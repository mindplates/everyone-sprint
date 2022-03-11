import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import {
  Common,
  Conference,
  ConferenceHeader,
  EditMeeting,
  EditProject,
  EditSprint,
  Footer,
  Groups,
  Header,
  Home,
  Join,
  Login,
  Meetings,
  Message,
  Project,
  Projects,
  PublicPark,
  Sprint,
  SprintDaily,
  SprintDeactivate,
  Sprints,
  SprintSummary,
  Stats,
} from './pages';
import './App.scss';
import { HistoryPropTypes, SettingPropTypes } from '@/proptypes';

const CONFERENCE_PATTERN = /^\/meets|talks\/[A-Za-z0-9]*/;
const NO_MAX_WIDTH_PATTERNS = [CONFERENCE_PATTERN, /^\/login[A-Za-z0-9]*/];

function App({ history, setting }) {
  const noMaxWidth = NO_MAX_WIDTH_PATTERNS.some((pattern) => pattern.test(history.location.pathname));
  const isConference = CONFERENCE_PATTERN.test(history.location.pathname);

  return (
    <div className={`app-wrapper ${isConference ? 'conference-page' : ''}`}>
      <div className="app-header">
        {isConference && <ConferenceHeader />}
        {!isConference && <Header />}
      </div>
      <div className={`app-content ${noMaxWidth ? 'no-max-width' : ''}`}>
        <Switch>
          <Route exact path="/" component={Stats} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/public-park" component={PublicPark} />
          <Route exact path="/groups" component={Groups} />
          <Route exact path="/projects/new" render={() => <EditProject type="new" />} />
          <Route exact path="/projects/:id/edit" render={() => <EditProject type="edit" />} />
          <Route exact path="/projects/:id" component={Project} />
          <Route exact path="/projects" component={Projects} />
          <Route exact path="/sprints/new" render={() => <EditSprint type="new" />} />
          <Route exact path="/sprints/:id/deactivate" component={SprintDeactivate} />
          <Route exact path="/sprints/:id/daily/:date" component={SprintDaily} />
          <Route exact path="/sprints/:id/daily" component={SprintDaily} />
          <Route exact path="/sprints/:id/summary" component={SprintSummary} />
          <Route exact path="/sprints/:id/edit" render={() => <EditSprint type="edit" />} />
          <Route exact path="/sprints/:id" component={Sprint} />
          <Route exact path="/sprints" component={Sprints} />
          <Route exact path="/meetings/new" render={() => <EditMeeting type="new" />} />
          <Route exact path="/meetings/:id/edit" render={() => <EditMeeting type="edit" />} />
          <Route exact path="/meetings" component={Meetings} />
          <Route exact path="/meets/:code" component={Conference} />
          <Route exact path="/meets" component={Conference} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/join" component={Join} />
          <Route render={() => <Message code="404" />} />
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
  history: HistoryPropTypes,
};
