import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Main, Common } from './pages';
import './App.css';

function App() {
  return (
    <div className="app-wrapper">
      <article className="app-content">
        <Switch>
          <Route exact path="/" component={Main} />
        </Switch>
      </article>
      <Common />
    </div>
  );
}

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
};

export default withRouter(App);
