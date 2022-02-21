import React, { useEffect, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { HistoryPropTypes, ProjectPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './SprintTimeLine.scss';
import { DATE_FORMATS_TYPES } from '@/constants/constants';

const SprintTimeLine = ({ className, t, history, project }) => {
  const now = Date.now();

  const element = useRef(null);

  const summary = useMemo(() => {
    const map = {};
    project?.sprints.forEach((sprint) => {
      const startDate = dateUtil.getDateString(sprint.startDate, DATE_FORMATS_TYPES.yearsDays);
      const endDate = dateUtil.getDateString(sprint.endDate, DATE_FORMATS_TYPES.yearsDays);
      const dateKey = `${startDate}_${endDate}`;

      if (!map[dateKey]) {
        map[dateKey] = {
          startTime: dateUtil.getTime(sprint.startDate),
          endTime: dateUtil.getTime(sprint.endDate),
          startDate,
          endDate,
          duration: dateUtil.getSpan(dateUtil.getTime(sprint.startDate), dateUtil.getTime(sprint.endDate)),
          sprints: [],
        };
      }

      map[dateKey].sprints.push(sprint);
    });

    const list = [];
    Object.keys(map).forEach((key) => {
      list.push({
        startTime: map[key].startTime,
        endTime: map[key].endTime,
        startDate: map[key].startDate,
        endDate: map[key].endDate,
        duration: map[key].duration,
        sprints: map[key].sprints,
      });
    });

    list.sort((a, b) => {
      if (a.startTime === b.startTime) {
        return a.endTime - b.endTime;
      }
      return a.startTime - b.startTime;
    });

    return list;
  }, [project]);

  useEffect(() => {
    if (element.current) {
      const prev = element.current.querySelector('.prev');
      const current = element.current.querySelector('.current');
      if (current) {
        element.current.scrollTop = current.offsetTop - (prev ? prev.offsetHeight : 0);
      }
    }
  }, []);

  return (
    <div className={`sprint-time-line-wrapper g-scroller ${className}`} ref={element}>
      <ul>
        <li>
          <div>
            <div className="date">{dateUtil.getDateString(project.creationDate, DATE_FORMATS_TYPES.yearsDays)}</div>
          </div>
        </li>
        {summary.map((sprintSummary, inx) => {
          const current = sprintSummary.startTime < now && sprintSummary.endTime > now;
          let isNextCurrent = false;
          if (inx < summary.length - 1) {
            isNextCurrent = summary[inx + 1].startTime < now && summary[inx + 1].endTime > now;
          }

          return (
            <li key={inx} className={`${current ? 'current' : ''} ${isNextCurrent ? 'prev' : ''}`}>
              <div>
                <div className="date">
                  <div className="start-date">{sprintSummary.startDate}</div>
                  <div className="duration">
                    <div>
                      <span>
                        <span className="text">{t(`${sprintSummary.duration?.days}일`)}</span>
                        <span className="arrow arrow-up">
                          <span />
                        </span>
                        <span className="arrow arrow-down">
                          <span />
                        </span>
                      </span>
                    </div>
                  </div>
                  <div className="end-date">{sprintSummary.endDate}</div>
                </div>
                <div className="sprint-list">
                  <div>
                    <ul>
                      {sprintSummary.sprints.map((sprint) => {
                        const sprintStartTime = dateUtil.getTime(sprint.startDate);
                        const sprintEndTime = dateUtil.getTime(sprint.endDate);
                        let point = 'past';
                        if (now >= sprintStartTime && now <= sprintEndTime) {
                          point = 'current';
                        } else if (now < sprintStartTime) {
                          point = 'future';
                        }

                        return (
                          <li
                            key={sprint.id}
                            className={`point-${point}`}
                            onClick={() => {
                              if (point === 'past') {
                                history.push(`/sprints/${sprint.id}/board/summary`);
                              } else if (point === 'current') {
                                history.push(`/sprints/${sprint.id}/board/daily`);
                              } else {
                                history.push(`/sprints/${sprint.id}`);
                              }
                            }}
                          >
                            {sprint.name}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(withRouter, withTranslation(), connect(mapStateToProps, undefined))(SprintTimeLine);

SprintTimeLine.defaultProps = {
  className: '',
};

SprintTimeLine.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  project: ProjectPropTypes,
  history: HistoryPropTypes,
};
