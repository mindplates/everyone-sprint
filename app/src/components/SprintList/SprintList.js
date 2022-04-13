import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, Liner } from '@/components';
import { SprintPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './SprintList.scss';
import withLoader from '@/components/Common/withLoader';
import { DATE_FORMATS_TYPES } from '@/constants/constants';
import commonUtil from '@/utils/commonUtil';

const SprintList = ({ className, t, sprints }) => {
  const now = Date.now();
  return (
    <ul className={`sprint-list-wrapper ${className}`}>
      {sprints.map((sprint) => {
        const old = now > sprint.endDate;

        return (
          <li
            key={sprint.id}
            onClick={() => {
              commonUtil.move(`/sprints/${sprint.id}/daily`);
            }}
          >
            <div>
              <div className="name-and-date">
                <div className="name">
                  <span className="project-name">{sprint.projectName}</span>
                  <span className="sprint-name">{sprint.name}</span>
                </div>
                <div className={`sprint-date ${old ? 'old-sprint' : ''}`}>
                  <div>
                    <div>
                      <span className="date-label">FROM</span>
                      <span className="date-text">{dateUtil.getDateString(sprint.startDate)}</span>
                    </div>
                    <Liner className="date-liner" width="10px" height="1px" display="inline-block" color="black" margin="0 0.5rem" />
                    <div>
                      <span className="date-label">TO</span>
                      <span className="date-text">
                        {dateUtil.isSameYear(sprint.startDate, sprint.endDate)
                          ? dateUtil.getDateString(sprint.endDate, DATE_FORMATS_TYPES.dayHours)
                          : dateUtil.getDateString(sprint.endDate)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {old && sprint.isAdmin && (
                <>
                  <div className="status">
                    <Button
                      size="xs"
                      color="danger"
                      onClick={(e) => {
                        e.stopPropagation();
                        commonUtil.move(`/sprints/${sprint.id}/deactivate`);
                      }}
                    >
                      <i className="far fa-stop-circle" /> {t('종료')}
                    </Button>
                  </div>
                  <div className="liner">
                    <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 1rem" />
                  </div>
                </>
              )}
              <div className="others">
                <div>
                  <Button
                    size="lg"
                    color="white"
                    className="daily-button"
                    outline
                    onClick={(e) => {
                      e.stopPropagation();
                      commonUtil.move(`/sprints/${sprint.id}/daily`);
                    }}
                  >
                    <div className="label">{t('데일리')}</div>
                    <div className="icon">
                      <i className="fas fa-calendar-alt" />
                    </div>
                  </Button>
                </div>
                <div className="allow-auto-join">
                  <Button
                    size="lg"
                    color="white"
                    outline
                    onClick={(e) => {
                      e.stopPropagation();
                      commonUtil.move(`/sprints/${sprint.id}/summary`);
                    }}
                  >
                    <div className="label">{t('요약')}</div>
                    <div className="icon">
                      <i className="fas fa-chart-bar" />
                    </div>
                  </Button>
                </div>
              </div>
              {sprint.isMember && (
                <>
                  <div className="liner">
                    <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 1rem" />
                  </div>
                  <div className="controls">
                    <Button
                      size="md"
                      color="white"
                      outline
                      rounded
                      onClick={(e) => {
                        e.stopPropagation();
                        commonUtil.move(`/sprints/${sprint.id}`);
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

export default compose(withRouter, withTranslation(), connect(mapStateToProps, undefined))(withLoader(SprintList, 'sprints'));

SprintList.defaultProps = {
  className: '',
};

SprintList.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  sprints: PropTypes.arrayOf(SprintPropTypes),
};
