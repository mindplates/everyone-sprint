import React from 'react';
import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import {
  ChangePassword,
  Common,
  Conference,
  ConferenceHeader,
  EditMeeting,
  EditMyInfo,
  EditProject,
  EditSpace,
  EditSprint,
  Footer,
  Header,
  Home,
  Join,
  Login,
  Meetings,
  Message,
  MyInfo,
  MySpaces,
  Notice,
  Project,
  Projects,
  PublicPark,
  Space,
  SpaceHome,
  Spaces,
  Sprint,
  SprintDaily,
  Sprints,
  SprintSummary,
} from './pages';
import { HistoryPropTypes, SettingPropTypes } from '@/proptypes';
import { CONFERENCE_URL_PATTERN } from '@/constants/constants';
import './App.scss';

const NO_MAX_WIDTH_PATTERNS = [CONFERENCE_URL_PATTERN, /^\/login[A-Za-z0-9]*/];

function App({ history, setting }) {
  const noMaxWidth = NO_MAX_WIDTH_PATTERNS.some((pattern) => pattern.test(history.location.pathname));
  const isConference = CONFERENCE_URL_PATTERN.test(history.location.pathname);

  return (
    <div className={`app-wrapper ${isConference ? 'conference-page' : ''}`}>
      <div className="app-header">
        <Switch>
          <Route exact path="/:spaceCode/meets/*" component={ConferenceHeader} />
          <Route exact path="/:spaceCode/talks/*" component={ConferenceHeader} />
          <Route path="/:spaceCode" component={Header} />
          <Route component={Header} />
        </Switch>
      </div>
      <div className={`app-content ${noMaxWidth ? 'no-max-width' : ''}`}>
        <Switch>
          <Route exact path="/" component={Notice} />
          <Route exact path="/home" component={Home} />
          <Route exact path="/public-park" component={PublicPark} />
          <Route exact path="/my-info/edit" component={EditMyInfo} />
          <Route exact path="/my-info/password" component={ChangePassword} />
          <Route exact path="/my-info" component={MyInfo} />
          <Route exact path="/login" component={Login} />
          <Route exact path="/join" component={Join} />

          <Route exact path="/spaces" component={Spaces} />
          <Route exact path="/spaces/my" component={MySpaces} />
          <Route exact path="/spaces/new" render={() => <EditSpace type="new" />} />
          <Route exact path="/spaces/:spaceCode/edit" render={() => <EditSpace type="edit" />} />
          <Route exact path="/spaces/:spaceCode" component={Space} />

          <Route exact path="/:spaceCode/projects/new" render={() => <EditProject type="new" />} />
          <Route exact path="/:spaceCode/projects/:id/edit" render={() => <EditProject type="edit" />} />
          <Route exact path="/:spaceCode/projects/:id" component={Project} />
          <Route exact path="/:spaceCode/projects" component={Projects} />
          <Route exact path="/:spaceCode/sprints/new" render={() => <EditSprint type="new" />} />
          <Route exact path="/:spaceCode/sprints/:id/deactivate" render={() => <SprintSummary type="close" />} />
          <Route exact path="/:spaceCode/sprints/:id/daily/:date" component={SprintDaily} />
          <Route exact path="/:spaceCode/sprints/:id/daily" component={SprintDaily} />
          <Route exact path="/:spaceCode/sprints/:id/summary" render={() => <SprintSummary type="summary" />} />
          <Route exact path="/:spaceCode/sprints/:id/edit" render={() => <EditSprint type="edit" />} />
          <Route exact path="/:spaceCode/sprints/:id" component={Sprint} />
          <Route exact path="/:spaceCode/sprints" component={Sprints} />
          <Route exact path="/:spaceCode/meetings/new" render={() => <EditMeeting type="new" />} />
          <Route exact path="/:spaceCode/meetings/:id/edit" render={() => <EditMeeting type="edit" />} />
          <Route exact path="/:spaceCode/meetings" component={Meetings} />
          <Route exact path="/:spaceCode/meets/:code" component={Conference} />
          <Route exact path="/:spaceCode/meets" component={Conference} />
          <Route exact path="/:spaceCode/home" component={Home} />
          <Route exact path="/:spaceCode" component={SpaceHome} />

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

export default compose(connect(mapStateToProps, undefined), withRouter)(App);

App.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
  setting: SettingPropTypes,
  history: HistoryPropTypes,
};
