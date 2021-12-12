import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Common,
  EditMeeting,
  EditSprint,
  Entry,
  Footer,
  Groups,
  Header,
  Meetings,
  PublicPark,
  Sprint,
  Sprints,
  StartingLine,
} from './pages';
import './App.scss';
import { SettingPropTypes } from '@/proptypes';

function App({ setting }) {
  return (
    <div className="app-wrapper">
      <div className="app-header">
        <Header />
      </div>
      <div className="app-content">
        <Switch>
          <Route exact path="/" component={PublicPark} />
          <Route exact path="/public-park" component={PublicPark} />
          <Route exact path="/groups" component={Groups} />
          <Route exact path="/sprints/new" render={() => <EditSprint type="new" />} />
          <Route exact path="/sprints/:id/edit" render={() => <EditSprint type="edit" />} />
          <Route exact path="/sprints/:id" component={Sprint} />
          <Route exact path="/sprints" component={Sprints} />
          <Route exact path="/meetings/new" render={() => <EditMeeting type="new" />} />
          <Route exact path="/meetings" component={Meetings} />
          <Route exact path="/starting-line" component={StartingLine} />
          <Route exact path="/entry" component={Entry} />
        </Switch>
      </div>
      {setting.footer && (
        <div className="app-footer">
          <Footer productName="everyone's sprint" />
        </div>
      )}
      <Common />
    </div>
  );
}

const mapStateToProps = (state) => {
  return {
    setting: state.setting,
  };
};

export default connect(mapStateToProps, undefined)(withRouter(App));

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
  setting: SettingPropTypes,
};
