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

const MeetingList = ({ t, history, meetings, user }) => {
  console.log(user);
  return (
    <ul className="meeting-list-wrapper">
      {meetings.map((meeting) => {
        return (
          <li
            key={meeting.id}
            onClick={() => {
              history.push(`/meetings/${meeting.id}`);
            }}
          >
            <div>
              <div className="name-and-date">
                <div className="name">{meeting.name}</div>
                <div className="meeting-date">
                  <div className="status">종료</div>
                  <div className="time-ago">
                    <ReactTimeAgo locale={user.language || 'ko'} date={dateUtil.getDateValue(meeting.startDate)} />
                  </div>
                  <div>
                    <div className="start-date">
                      <span className="date-label">FROM</span>
                      {dateUtil.getDateString(meeting.startDate)}
                    </div>
                    <Liner
                      className="date-liner"
                      width="10px"
                      height="1px"
                      display="inline-block"
                      color="black"
                      margin="0 0.5rem"
                    />
                    <div className="end-date">
                      <span className="date-label">TO</span>
                      {dateUtil.getDateString(meeting.endDate)}
                    </div>
                  </div>
                </div>
              </div>
              <div className="liner">
                <Liner width="1px" height="20px" display="inline-block" color="gray" margin="0 0.5rem" />
              </div>
              <div className="others">
                <div className="user-count">
                  <div className="label">
                    <span>{t('사용자')}</span>
                  </div>
                  <div className="value">{meeting.userCount}</div>
                </div>
                <div className="allow-search">
                  <Button size="lg" color="white" outline rounded onClick={() => {}}>
                    <i className="fas fa-arrow-right" />
                  </Button>
                </div>
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
