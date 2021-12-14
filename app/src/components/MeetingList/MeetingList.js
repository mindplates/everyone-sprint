import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import ReactTimeAgo from 'react-time-ago';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, Liner } from '@/components';
import { HistoryPropTypes, SprintPropTypes, UserPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './MeetingList.scss';
import { DATE_FORMATS_TYPES } from '@/constants/constants';

const MeetingList = ({ t, history, meetings, user }) => {
  const now = new Date();

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
              history.push(`/meetings/${meeting.id}`);
            }}
          >
            <div>
              <div className="status">
                <span className="time-ago">
                  <ReactTimeAgo locale={user.language || 'ko'} date={startDate} />
                </span>
              </div>
              <div className="name-and-date">
                <div className="name">
                  <span className="text">{meeting.name}</span>
                  <span className="time-ago">
                    <ReactTimeAgo locale={user.language || 'ko'} date={startDate} />
                  </span>
                </div>
                <div className="meeting-date">
                  <div className="start-date">
                    {dateUtil.getDateString(
                      meeting.startDate,
                      isSameDay ? DATE_FORMATS_TYPES.hours : DATE_FORMATS_TYPES.dayHours,
                    )}
                  </div>
                  <Liner
                    className="date-liner"
                    width="10px"
                    height="1px"
                    display="inline-block"
                    color="black"
                    margin="0 0.5rem"
                  />
                  <div className="end-date">{dateUtil.getDateString(meeting.endDate, DATE_FORMATS_TYPES.hours)}</div>
                </div>
              </div>
              <div className="users">
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
              </div>
              <div className="liner">
                <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 1rem" />
              </div>
              <div className="buttons d-none d-sm-flex">
                <Button size="md" data-tip={t('참여')} color="white" outline rounded onClick={() => {}}>
                  <i className="fas fa-arrow-right" />
                </Button>
                <Button size="md" color="white" outline rounded onClick={() => {}}>
                  <i className="fas fa-ellipsis-h" />
                </Button>
              </div>
              <div className="buttons d-flex d-sm-none ">
                <Button size="sm" color="white" outline rounded onClick={() => {}}>
                  <i className="fas fa-ellipsis-h" />
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
  meetings: PropTypes.arrayOf(SprintPropTypes),
  history: HistoryPropTypes,
  user: UserPropTypes,
};
