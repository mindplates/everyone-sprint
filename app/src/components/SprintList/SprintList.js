import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Liner } from '@/components';
import { HistoryPropTypes, SprintPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './SprintList.scss';

const SprintList = ({ t, history, sprints }) => {
  return (
    <ul className="sprint-list-wrapper">
      {sprints.map((sprint) => {
        return (
          <li
            key={sprint.id}
            onClick={() => {
              history.push(`/sprints/${sprint.id}`);
            }}
          >
            <div>
              <div className="name-and-date">
                <div className="name">{sprint.name}</div>
                <div className="sprint-date">
                  <div>
                    <div className="start-date">
                      <span className="date-label">FROM</span>
                      {dateUtil.getDateString(sprint.startDate)}
                    </div>
                    <Liner
                      className="date-liner"
                      width="10px"
                      height="1px"
                      display="inline-block"
                      color="black"
                      margin="0 0.5rem"
                    />
                    <div className="end-date">
                      <span className="date-label">TO</span>
                      {dateUtil.getDateString(sprint.endDate)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="liner">
                <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 0.5rem" />
              </div>
              <div className="others">
                <div className="user-count">
                  <div className="label">
                    <span>{t('사용자')}</span>
                  </div>
                  <div className="value">{sprint.userCount}</div>
                </div>
                <div className="is-jira-sprint">
                  <div className="label">
                    <span>{t('JIRA')}</span>
                  </div>
                  <div className="value">{sprint.isJiraSprint ? 'Y' : 'N'}</div>
                </div>
                <div className="allow-auto-join">
                  <div className="label">
                    <span>{t('자동 승인')}</span>
                  </div>
                  <div className="value">{sprint.allowAutoJoin ? 'Y' : 'N'}</div>
                </div>
                <div className="allow-search">
                  <div className="label">
                    <span>{t('검색 허용')}</span>
                  </div>
                  <div className="value">{sprint.allowSearch ? 'Y' : 'N'}</div>
                </div>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(withRouter, withTranslation(), connect(mapStateToProps, undefined))(SprintList);

SprintList.propTypes = {
  t: PropTypes.func,
  sprints: PropTypes.arrayOf(SprintPropTypes),
  history: HistoryPropTypes,
};
