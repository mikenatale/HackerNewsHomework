import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { getBaseApiUrl } from './utils.js';

const _NUM_ARTICLES_DISPLAYED = 30;

class App extends Component {
    constructor() {
        super();

        this.state = {
            commentIds: [],
            commenters: [],
            topArticlesIds: [],
            topArticlesInfo: [],
            topCommenterIds: []
        };

        this.getTopArticles = this.getTopArticles.bind(this);
        this.getTopArticlesInfo = this.getTopArticlesInfo.bind(this);
        this.getCommenters = this.getCommenters.bind(this);
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

    componentWillMount() {
        let scope = this;

        scope.getTopArticles().then(() => {
            scope.getTopArticlesInfo().then(() => {
                scope.getCommenters().then(() => {
                    // TODO
                });
            });
        });
    }

    render() {
        return (
            <div>
                { JSON.stringify(this.state.commentIds) }
            </div>
        );
    }
}

export default App;
