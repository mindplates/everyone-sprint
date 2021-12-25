import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, Liner } from '@/components';
import { HistoryPropTypes, SprintPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './SprintList.scss';

const SprintList = ({ className, printOld, t, history, sprints }) => {
  const now = Date.now();
  return (
    <ul className={`sprint-list-wrapper ${className}`}>
      {sprints.map((sprint) => {
        const old = now > dateUtil.getTime(sprint.endDate);

        return (
          <li
            key={sprint.id}
            onClick={() => {
              history.push(`/sprints/${sprint.id}/board`);
            }}
          >
            <div>
              <div className="name-and-date">
                <div className="name">{sprint.name}</div>
                <div className={`sprint-date ${printOld && old ? 'old-sprint' : ''}`}>
                  <div>
                    <div>
                      <span className="date-label">FROM</span>
                      <span className="date-text">{dateUtil.getDateString(sprint.startDate)}</span>
                    </div>
                    <Liner className="date-liner" width="10px" height="1px" display="inline-block" color="black" margin="0 0.5rem" />
                    <div>
                      <span className="date-label">TO</span>
                      <span className="date-text">{dateUtil.getDateString(sprint.endDate)}</span>
                    </div>
                    {printOld && old && (
                      <div className="old">
                        <span>old</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {printOld && old && (
                <div className="status">
                  <Button
                    size="xs"
                    color="danger"
                    onClick={(e) => {
                      e.stopPropagation();
                      history.push(`/sprints/${sprint.id}/deactivate`);
                    }}
                  >
                    <i className="far fa-stop-circle" /> {t('종료')}
                  </Button>
                </div>
              )}
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
              {sprint.isMember && (
                <>
                  <div className="liner">
                    <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 0.5rem" />
                  </div>
                  <div className="controls">
                    <Button
                      size="md"
                      color="white"
                      outline
                      rounded
                      onClick={(e) => {
                        e.stopPropagation();
                        history.push(`/sprints/${sprint.id}`);
                      }}
                    >
                      <i className="fas fa-cog" />
                    </Button>
                  </div>
                </>
              )}
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

SprintList.defaultProps = {
  className: '',
  printOld: true,
};

SprintList.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  sprints: PropTypes.arrayOf(SprintPropTypes),
  history: HistoryPropTypes,
  printOld: PropTypes.bool,
};
