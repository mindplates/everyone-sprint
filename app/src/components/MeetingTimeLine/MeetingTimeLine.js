import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { withResizeDetector } from 'react-resize-detector';
import _ from 'lodash';
import dateUtil from '@/utils/dateUtil';
import { DATE_FORMATS_TYPES } from '@/constants/constants';
import { MeetingPropTypes, UserPropTypes } from '@/proptypes';
import { TimeLineItem } from '@/components';
import withLoader from '@/components/Common/withLoader';
import './MeetingTimeLine.scss';
import commonUtil from '@/utils/commonUtil';

const MeetingTimeLine = ({ className, date: paramDate, user, meetings, height }) => {
  let meetingCount = 0;
  const now = Date.now();

  const date = new Date(paramDate.getTime());

  const timeSpan = useRef(2);

  const getTimes = useCallback((startTime, endTime) => {
    const defaultTimes = [];
    for (let i = startTime; i < endTime; i += timeSpan.current) {
      defaultTimes.push(date.setHours(i));
    }

    return defaultTimes;
  }, []);

  const [times, setTimes] = useState(getTimes(8, 24));
  const debounceSetTimes = useCallback(
    _.debounce((startTime, endTime) => {
      setTimes(getTimes(startTime, endTime));
    }, 500),
    [],
  );

  useEffect(() => {
    if (height > 1000) {
      timeSpan.current = 1;
      debounceSetTimes(0, 24);
    } else {
      timeSpan.current = 2;
      debounceSetTimes(8, 24);
    }
  }, [height]);

  return (
    <div className={`meeting-time-line-wrapper ${className}`}>
      <div>
        <ul>
          {times.map((d, inx) => {
            let current = false;
            if (inx < times.length - 1) {
              if (d < now && now < times[inx + 1]) {
                current = true;
              }
            } else if (now > d && now < d + timeSpan.current * 1000 * 60 * 60) {
              current = true;
            }
            return (
              <li key={inx}>
                <div className="time">{dateUtil.getDateString(d, DATE_FORMATS_TYPES.hours)}</div>
                <div>{current && <div className="current-time" />}</div>
                {meetings
                  ?.filter((meeting) => {
                    const startDate = dateUtil.getLocalDate(meeting.startDate);

                    if (inx < times.length - 1) {
                      if (d <= startDate && startDate < times[inx + 1]) {
                        return true;
                      }
                    } else if (d + timeSpan.current * 1000 * 60 * 60 > startDate && startDate >= d) {
                      return true;
                    }

                    return false;
                  })
                  .map((meeting) => {
                    meetingCount += 1;
                    return (
                      <div
                        className="meeting-item"
                        key={meeting.id}
                        style={{
                          left: `${60 + 10 * meetingCount}px`,
                          top: `${(dateUtil.getSpanHours(d, dateUtil.getLocalDate(meeting.startDate), true) / timeSpan.current) * 100}%`,
                        }}
                      >
                        <TimeLineItem
                          meeting={meeting}
                          count={meetingCount}
                          zIndex={meetingCount}
                          timeSpan={timeSpan.current}
                          baseTime={d}
                          user={user}
                          onClick={() => {
                            commonUtil.move(`/meets/${meeting.code}`);
                          }}
                        />
                      </div>
                    );
                  })}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default compose(withRouter, withResizeDetector)(withLoader(MeetingTimeLine, 'meetings'));

MeetingTimeLine.defaultProps = {
  className: '',
};

MeetingTimeLine.propTypes = {
  className: PropTypes.string,
  date: PropTypes.instanceOf(Date),
  user: UserPropTypes,
  meetings: PropTypes.arrayOf(MeetingPropTypes),
  height: PropTypes.number,
};
