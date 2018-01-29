import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { getBaseApiUrl } from './utils.js';

const _NUM_ARTICLES_DISPLAYED = 30;
const _NUM_TOP_COMMENTERS_DISPLAYED = 10;

class App extends Component {
    constructor() {
        super();

        this.state = {
            commentIds: [],
            commenters: [],
            topCommenters: [],
            topArticlesIds: [],
            topArticlesInfo: [],
        };

        this.getTopArticles = this.getTopArticles.bind(this);
        this.getTopArticlesInfo = this.getTopArticlesInfo.bind(this);
        this.getCommenters = this.getCommenters.bind(this);
        this.getTopCommenters = this.getTopCommenters.bind(this);

        this.renderTopArticles = this.renderTopArticles.bind(this);
        this.renderTopCommenters = this.renderTopCommenters.bind(this);
    }

    getTopArticles() {
        let scope = this;

        return new Promise((resolve, reject) => {
            axios.get(`${getBaseApiUrl()}/topstories.json`)
            .then((response) => {
                let topArticlesIds = response.data.slice(0, _NUM_ARTICLES_DISPLAYED);
                scope.setState(
                    { topArticlesIds },
                    () => { resolve() }
                );
            })
            .catch((e) => {
                console.error(e);
                reject();
            });
        });
    }

    getTopArticlesInfo() {
        let scope = this;

        return new Promise((resolve, reject) => {
            let articleInfoPromises = [];
            this.state.topArticlesIds.forEach((id) => {
                articleInfoPromises.push(
                    axios.get(`${getBaseApiUrl()}/item/${id}.json`)
                )
            });

            axios.all(articleInfoPromises)
            .then((response) => {
                let topArticlesInfo = response.map(r => r.data);

                scope.setState(
                    { topArticlesInfo },
                    () => { resolve(); }
                );
            })
            .catch((e) => {
                console.error(e);
                reject();
            });
        });
    }

    getCommenters() {
        let scope = this;

        return new Promise((resolve, reject) => {
            let commentIds = [];
            let commentInfoPromises = [];
            let commenters = [];

            this.state.topArticlesInfo.forEach((article) => {
                if (article.kids) {
                    article.kids.forEach((commentId) => {
                        commentIds.push(commentId);
                    });
                }
            });

            commentIds.forEach((id) => {
                commentInfoPromises.push(
                    axios.get(`${getBaseApiUrl()}/item/${id}.json`)
                )
            });

            axios.all(commentInfoPromises)
            .then((comments) => {
                comments.forEach((comment) => {
                    if (comment.data.by) {
                        if (!commenters[comment.data.by]) {
                            commenters[comment.data.by] = 0;
                        }

                        commenters[comment.data.by] += 1;
                    }
                });

                scope.setState(
                    {
                        commentIds,
                        commenters
                    },
                    () => { resolve(); }
                )
            })
            .catch((e) => {
                console.error(e);
                reject();
            });
        });
    }

    getTopCommenters() {
        let commenters = this.state.commenters;

        let sortedCommenters = [];
        for (let key in commenters) {
            sortedCommenters.push([key, commenters[key]]);
        }

        sortedCommenters.sort(function(a, b) {
            a = a[1];
            b = b[1];

            return a > b ? -1 : (a < b ? 1 : 0);
        });

        let topCommenters = sortedCommenters.slice(0, _NUM_TOP_COMMENTERS_DISPLAYED);

        this.setState({ topCommenters });
    }

    componentWillMount() {
        let scope = this;

        scope.getTopArticles().then(() => {
            scope.getTopArticlesInfo().then(() => {
                scope.getCommenters().then(() => {
                    scope.getTopCommenters();
                });
            });
        });
    }

    renderTopArticles() {
        let index = 0;
        return this.state.topArticlesInfo.map((article) => {
            index += 1;

            return (
                <div className="article full-width" key={article.id}>
                    { `${index}. ${article.title}` }
                </div>
            );
        });
    }

    renderTopCommenters() {
        let index = 0;
        return this.state.topCommenters.map((commenter) => {
            index += 1;

            return (
                <div className="commenter full-width" key={commenter[0]}>
                    { `${index}. ${commenter[0]} (${commenter[1]})` }
                </div>
            );
        });
    }

    render() {
        return (
            <div className="app-wrapper">
                <div className="articles">
                    <div className="article-header header">
                        Top 30 Articles
                    </div>
                    <div className="article-body">
                        { this.renderTopArticles() }
                    </div>
                </div>
                <div className="commenters">
                    <div className="commenter-header header">
                        Top 10 Commenters
                    </div>
                    <div className="commenter-body">
                        { this.renderTopCommenters() }
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
