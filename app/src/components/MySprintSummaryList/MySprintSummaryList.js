import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Liner } from '@/components';
import withLoader from '@/components/Common/withLoader';
import { HistoryPropTypes, SprintPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './MySprintSummaryList.scss';
import { DATE_FORMATS_TYPES } from '@/constants/constants';

const MySprintSummaryList = ({ className, t, history, sprints, onClickScrumInfo }) => {
  const now = Date.now();
  return (
    <div className={`my-sprint-summary-list-wrapper ${className} ${sprints && sprints?.length > 0 ? 'g-list-content' : 'g-page-content'}`}>
      {sprints && sprints.length < 1 && (
        <EmptyContent
          height="100%"
          message={t('스프린트가 없습니다.')}
          additionalContent={
            <div className="mt-3">
              <Button
                size="md"
                color="primary"
                onClick={() => {
                  history.push('/sprints/new');
                }}
              >
                <i className="fas fa-plus" /> {t('새 스프린트')}
              </Button>
            </div>
          }
        />
      )}
      {sprints && sprints.length > 0 && (
        <div className="my-sprint-list">
          <ul>
            {sprints.map((sprint) => {
              const startTime = dateUtil.getTime(sprint.startDate);
              const endTime = dateUtil.getTime(sprint.endDate);
              const duration = endTime - startTime;
              const span = (endTime > now ? now : endTime) - startTime;
              const percentage = (span / duration) * 100;
              const isStarted = now > startTime;
              const isDone = isStarted && endTime < now;

              return (
                <li
                  key={sprint.id}
                  onClick={() => {
                    history.push(`/sprints/${sprint.id}/board/daily`);
                  }}
                >
                  {sprint.isMember && (
                    <div className="config-button">
                      <Button
                        size="sm"
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
                  )}
                  <div className="name">{sprint.name}</div>
                  <div className="duration">
                    <div className="status-bar">
                      <span className="start-day">{dateUtil.getDateString(startTime, DATE_FORMATS_TYPES.days)}</span>
                      <span className="end-day">{dateUtil.getDateString(endTime, DATE_FORMATS_TYPES.days)}</span>
                      <div
                        className={`current ${isDone ? 'done' : ''}`}
                        style={{
                          width: `${percentage}%`,
                        }}
                      >
                        {isDone && (
                          <span className="last-days">
                            <span>-{dateUtil.getSpan(endTime, now).days}일</span>
                          </span>
                        )}
                        {isStarted && !isDone && (
                          <span className="sprint-progress">
                            <span>{Math.round(percentage)}%</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="message">
                      {isStarted && isDone && <span>{t('스트린트 종료일이 지났습니다.')}</span>}
                      {isStarted && !isDone && <span>{dateUtil.getSpan(now, endTime).days}일 남았습니다</span>}
                      {!isStarted && <span>{dateUtil.getSpan(now, startTime).days}일 후 시작됩니다</span>}
                    </div>
                  </div>
                  <Liner width="100%" height="1px" color="light" margin="1rem 0" />
                  <div className="controls">
                    <div>
                      {sprint.hasScrumMeeting && (
                        <Button
                          size="xs"
                          className="daily-scrum-button"
                          color="point"
                          onClick={(e) => {
                            e.stopPropagation();
                            onClickScrumInfo(sprint.id);
                          }}
                        >
                          {!sprint.isUserScrumInfoRegistered && <div className="no-register">{t('미등록')}</div>}
                          <i className="fas fa-file-invoice" /> {t('데일리 스크럼')}
                        </Button>
                      )}
                      {!sprint.hasScrumMeeting && <div className="control-message">{t('NO DAILY SCRUM')}</div>}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(withRouter, withTranslation(), connect(mapStateToProps, undefined))(withLoader(MySprintSummaryList, 'sprints'));

MySprintSummaryList.defaultProps = {
  className: '',
};

MySprintSummaryList.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  sprints: PropTypes.arrayOf(SprintPropTypes),
  history: HistoryPropTypes,
  onClickScrumInfo: PropTypes.func,
};
