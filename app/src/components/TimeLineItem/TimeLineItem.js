import React from 'react';
import PropTypes from 'prop-types';
import ReactTimeAgo from 'react-time-ago';
import { withResizeDetector } from 'react-resize-detector';
import dateUtil from '@/utils/dateUtil';
import { DATE_FORMATS_TYPES } from '@/constants/constants';
import { MeetingPropTypes, UserPropTypes } from '@/proptypes';
import './TimeLineItem.scss';

const TimeLineItem = ({ className, meeting, timeSpan, user, height, onClick }) => {
  return (
    <div
      className={`time-line-item-wrapper ${className}`}
      style={{
        height: `${dateUtil.getSpanHours(dateUtil.getLocalDate(meeting.startDate), dateUtil.getLocalDate(meeting.endDate)) * (100 / timeSpan)}%`,
      }}
      onClick={() => {
        if (onClick) {
          onClick();
        }
      }}
    >
      <div className="meeting-info">
        <div className="name">{meeting.name}</div>
        {height > 40 && (
          <div className="time-ago">
            <ReactTimeAgo locale={user.language || 'ko'} date={dateUtil.getTime(meeting.startDate)} />
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

export default withResizeDetector(TimeLineItem);

TimeLineItem.defaultProps = {
  className: '',
};

TimeLineItem.propTypes = {
  className: PropTypes.string,
  meeting: MeetingPropTypes,
  timeSpan: PropTypes.number,
  user: UserPropTypes,
  height: PropTypes.number,
  onClick: PropTypes.func,
};
