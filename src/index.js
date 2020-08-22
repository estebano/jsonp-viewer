import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import MobxStoe from './viewer/js/stores/MobXStore';
import inp from './json/inp.json';
import 'mobx-react/batchingForReactDom';

const mobXStore = new MobxStoe(inp);

delete window.inp;

ReactDOM.render(
  <React.StrictMode>
    <App store={mobXStore} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
