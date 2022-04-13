import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import copy from 'copy-to-clipboard';
import ReactTimeAgo from 'react-time-ago';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, Liner } from '@/components';
import { MeetingPropTypes, UserPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import { DATE_FORMATS_TYPES } from '@/constants/constants';
import './MeetingList.scss';

const MeetingList = ({ t, meetings, user, onClick, onJoin, onConfig }) => {
  const now = new Date();

  const [copiedId, setCopiedId] = useState(null);

  return (
    <ul className="meeting-list-wrapper">
      {meetings.map((meeting) => {
        const startDate = dateUtil.getDate(meeting.startDate);
        const isSameDay = dateUtil.isSameDay(startDate, now);

        return (
          <li
            key={meeting.id}
            className={startDate > now ? 'future' : 'past'}
            onClick={() => {
              onClick(meeting.code);
            }}
          >
            <div>
              <div className="status">
                <span className="time-ago">
                  <ReactTimeAgo locale={user.language} date={startDate} />
                </span>
              </div>
              <div className="name-and-date">
                <div className="name">
                  {meeting.type === 'SMALLTALK' && (
                    <div className="small-talk-icon">
                      <span className="icon-1">
                        <i className="fas fa-smile" />
                      </span>
                      <span className="icon-2">
                        <i className="fab fa-gratipay" />
                      </span>
                      <span className="icon-3">
                        <i className="fas fa-comment-alt" />
                      </span>
                    </div>
                  )}
                  <span className="text">{meeting.name}</span>
                  <span className="time-ago">
                    <ReactTimeAgo locale={user.language} date={startDate} />
                  </span>
                </div>
                <div className="meeting-date">
                  <div className="start-date">
                    {dateUtil.getDateString(meeting.startDate, isSameDay ? DATE_FORMATS_TYPES.hoursMinutes : DATE_FORMATS_TYPES.dayHours)}
                  </div>
                  <Liner className="date-liner" width="10px" height="1px" display="inline-block" color="black" margin="0 0.5rem" />
                  <div className="end-date">{dateUtil.getDateString(meeting.endDate, DATE_FORMATS_TYPES.hoursMinutes)}</div>
                </div>
                <div className="project-sprint-info">
                  <span>{meeting.projectName}</span>
                  <span>{meeting.sprintName}</span>
                </div>
              </div>
              <div className="users">
                {meeting.type !== 'SMALLTALK' && (
                  <div>
                    <span className="icon">
                      <i className="fas fa-child" />
                    </span>
                    {meeting.users.map((d) => {
                      return (
                        <span className="user-alias" key={d.id}>
                          {d.alias}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="liner">
                <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 1rem" />
              </div>
              <div className="buttons d-none d-sm-flex">
                <Button
                  size="md"
                  data-tip={t('참여')}
                  color="point"
                  outline
                  rounded
                  onClick={(e) => {
                    e.stopPropagation();
                    onJoin(meeting.code);
                  }}
                >
                  <i className="fas fa-arrow-right" />
                </Button>
                <Button
                  size="md"
                  data-tip={t('URL 복사')}
                  color="white"
                  outline
                  rounded
                  onClick={(e) => {
                    e.stopPropagation();
                    setCopiedId(meeting.id);
                    setTimeout(() => {
                      setCopiedId(null);
                    }, 1000);
                    copy(`${window.location.origin}/meets/${meeting.code}`);
                  }}
                >
                  {meeting.id === copiedId && <i className="fas fa-clipboard-check" />}
                  {meeting.id !== copiedId && <i className="fas fa-clipboard" />}
                </Button>
                <Button
                  size="md"
                  data-tip={t('설정')}
                  color="white"
                  outline
                  rounded
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfig(meeting.id);
                  }}
                >
                  <i className="fas fa-cog" />
                </Button>
              </div>
              <div className="buttons d-flex d-sm-none ">
                <Button
                  size="md"
                  data-tip={t('설정')}
                  color="white"
                  outline
                  rounded
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfig(meeting.id);
                  }}
                >
                  <i className="fas fa-cog" />
                </Button>
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

export default compose(withRouter, withTranslation(), connect(mapStateToProps, undefined))(MeetingList);

MeetingList.propTypes = {
  t: PropTypes.func,
  meetings: PropTypes.arrayOf(MeetingPropTypes),
  user: UserPropTypes,
  onClick: PropTypes.func,
  onJoin: PropTypes.func,
  onConfig: PropTypes.func,
};
