import React, { Component } from 'react';
import './App.css';
import axios from 'axios';
import { getBaseApiUrl } from './utils.js';

const _NUM_ARTICLES_DISPLAYED = 30;

class App extends Component {
    constructor() {
        super();

        this.state = {
            topArticlesIds: [],
            topArticlesInfo: []
        };

        this.getTopArticles = this.getTopArticles.bind(this);
        this.getTopArticlesInfo = this.getTopArticlesInfo.bind(this);
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
            let articlePromises = [];
            this.state.topArticlesIds.forEach((id) => {
                articlePromises.push(
                    axios.get(`${getBaseApiUrl()}/item/${id}.json`)
                )
            });

            axios.all(articlePromises)
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

    componentWillMount() {
        let scope = this;

        scope.getTopArticles().then(() => {
            scope.getTopArticlesInfo().then(() => {
                // TODO
            });
        });
    }

    render() {
        return (
            <div>
                { JSON.stringify(this.state.topArticlesIds) }
                { JSON.stringify(this.state.topArticlesInfo) }
            </div>
        );
    }
}

export default App;
