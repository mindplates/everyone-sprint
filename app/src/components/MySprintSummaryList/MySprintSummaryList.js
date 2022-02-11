import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Liner } from '@/components';
import { HistoryPropTypes, SprintPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './MySprintSummaryList.scss';

const MySprintSummaryList = ({ className, printOld, t, history, sprints }) => {
  const now = Date.now();
  return (
    <div className={`my-sprint-summary-list-wrapper ${className} ${sprints && sprints?.length > 0 ? 'g-list-content' : 'g-page-content'}`}>
      {!(sprints && sprints?.length > 0) && (
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
              const old = now > dateUtil.getTime(sprint.endDate);

              const startTime = dateUtil.getTime(sprint.startDate);
              const endTime = dateUtil.getTime(sprint.endDate);
              const duration = endTime - startTime;
              const span = (endTime > now ? now : endTime) - startTime;
              console.log(new Date(startTime), new Date(now));

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
                  {now > startTime && (
                    <div className="duration">
                      <div className="status-bar">
                        <div
                          className="current"
                          style={{
                            width: `${(span / duration) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="message">
                        {endTime < now && <span>스트린트 종료일이 지났습니다</span>}
                        {endTime > now && <span>X일 남았습니다</span>}
                      </div>
                    </div>
                  )}
                  {now < startTime && (
                    <div className="duration">
                      <div className="status-bar" />
                      <div className="message">아직 시작되지 않았습니다</div>
                    </div>
                  )}
                  <div className="d-none">
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
                      <>
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
                        <div className="liner">
                          <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 0.5rem" />
                        </div>
                      </>
                    )}
                    <div className="others">
                      <div className="user-count">
                        <div className="label">
                          <span>{t('사용자')}</span>
                        </div>
                        <div className="value">{sprint.userCount}</div>
                      </div>
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

export default compose(withRouter, withTranslation(), connect(mapStateToProps, undefined))(MySprintSummaryList);

MySprintSummaryList.defaultProps = {
  className: '',
  printOld: true,
};

MySprintSummaryList.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  sprints: PropTypes.arrayOf(SprintPropTypes),
  history: HistoryPropTypes,
  printOld: PropTypes.bool,
};
