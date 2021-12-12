import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { BrowserRouter as Router } from 'react-router-dom';
import TimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en.json';
import ko from 'javascript-time-ago/locale/ko.json';
import reportWebVitals from './reportWebVitals';
import store from './store';
import '@/languages/i18n';
import App from './App';
import './index.scss';
import 'react-datepicker/dist/react-datepicker.css';

TimeAgo.addLocale(ko);
TimeAgo.addLocale(en);
TimeAgo.addDefaultLocale(ko);

ReactDOM.render(
  <Router>
    <Provider store={store}>
      <App />
    </Provider>
  </Router>,
  document.getElementById('root'),
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
