import React from 'react';
import PropTypes from 'prop-types';
import ReactTimeAgo from 'react-time-ago';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import dateUtil from '@/utils/dateUtil';
import { DATE_FORMATS_TYPES } from '@/constants/constants';
import { MeetingPropTypes, UserPropTypes } from '@/proptypes';
import commonUtil from '@/utils/commonUtil';
import './TimeLineItem.scss';

const TimeLineItem = ({ className, t, meeting, timeSpan, user, height, onClick }) => {
  return (
    <div
      className={`time-line-item-wrapper ${className} ${meeting.type}`}
      style={{
        height: `${dateUtil.getSpanHours(dateUtil.getLocalDate(meeting.startDate), dateUtil.getLocalDate(meeting.endDate), true) * (100 / timeSpan)}%`,
      }}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <div className="tooltip-info" onClick={(e) => e.stopPropagation()}>
        <div>
          <div className="move">
            <a href={commonUtil.getSpaceUrl(`/meets/${meeting.code}`)}>{t('클릭하여 이동')}</a>
          </div>
          <div className="meeting-name">
            <span>{meeting.name}</span>
          </div>
          <div>
            <span>{dateUtil.getDateString(meeting.startDate, DATE_FORMATS_TYPES.hoursMinutes)}</span>
            <span className="mx-1">-</span>
            <span>{dateUtil.getDateString(meeting.endDate, DATE_FORMATS_TYPES.hoursMinutes)}</span>
          </div>
          {!meeting.smallTalkMeetingPlanId && (
            <div>
              <span>{meeting.users[0]?.alias}</span>
              {meeting.users.length - 1 > 0 && <span className="ml-1">외</span>}
              {meeting.users.length - 1 > 0 && <span className="ml-1">{meeting.users.length - 1}명</span>}
              <span className="connected-count">{meeting.connectedUserCount} 명 참가중</span>
            </div>
          )}
          <div className="sprint-name">
            <span>{meeting.sprintName}</span>
          </div>
        </div>
      </div>
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
      <div className="meeting-info">
        <div className="meeting-name">
          <span>{meeting.name}</span>
          {meeting.type !== 'SMALLTALK' && (
            <span className="connected-user-count">
              <span>{meeting.connectedUserCount}</span>
            </span>
          )}
        </div>
        {height > 40 && (
          <div className="time-ago">
            <ReactTimeAgo locale={user.language} date={dateUtil.getTime(meeting.startDate)} />
          </div>
        )}
      </div>
      {height > 60 && (
        <div className="time-info">
          <span>{dateUtil.getDateString(meeting.startDate, DATE_FORMATS_TYPES.hoursMinutes)}</span>
          <span className="mx-1">-</span>
          <span>{dateUtil.getDateString(meeting.endDate, DATE_FORMATS_TYPES.hoursMinutes)}</span>
        </div>
      )}
    </div>
  );
};

export default compose(withTranslation())(TimeLineItem);

TimeLineItem.defaultProps = {
  className: '',
};

TimeLineItem.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  meeting: MeetingPropTypes,
  timeSpan: PropTypes.number,
  user: UserPropTypes,
  height: PropTypes.number,
  onClick: PropTypes.func,
};
