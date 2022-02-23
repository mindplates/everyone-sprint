import React from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { UserPropTypes } from '@/proptypes';
import { BlockRow, Button, DateRange, DateRangeText, Input, Label, Liner, Text } from '@/components';
import './DailySmallTalkMeeting.scss';

const DailySmallTalkMeeting = ({ className, t, edit, no, onRemove, onChangeInfo, sprintDailySmallTalkMeeting, onChangeMeetingDays, user }) => {
  const labelMinWidth = '140px';

  return (
    <div className={`daily-scrum-meeting-wrapper ${className} ${edit ? 'edit' : ''}`}>
      <div className="meeting-index">
        <span>
          <span>{no}</span>
        </span>
      </div>
      {edit && (
        <div className="meeting-remove-button">
          <Button
            size="sm"
            color="warning"
            outline
            rounded
            onClick={() => {
              onRemove();
            }}
          >
            <i className="fas fa-times" />
          </Button>
        </div>
      )}
      <BlockRow>
        <Label minWidth={labelMinWidth}>{t('미팅 이름')}</Label>
        {edit && (
          <Input
            type="text"
            size="md"
            value={sprintDailySmallTalkMeeting.name}
            onChange={(val) => onChangeInfo('name', val)}
            outline
            simple
            required
            minLength={1}
          />
        )}
        {!edit && <Text>{sprintDailySmallTalkMeeting.name}</Text>}
      </BlockRow>
      <BlockRow>
        <Label minWidth={labelMinWidth}>{t('시간')}</Label>
        {edit && (
          <DateRange
            country={user.country}
            language={user.language}
            startDate={sprintDailySmallTalkMeeting.startTime}
            endDate={sprintDailySmallTalkMeeting.endTime}
            showTimeSelectOnly
            startDateKey="startTime"
            endDateKey="endTime"
            onChange={(key, value) => {
              onChangeInfo(key, value);
            }}
          />
        )}
        {!edit && (
          <DateRangeText showTimeOnly country={user.country} startDate={sprintDailySmallTalkMeeting.startTime} endDate={sprintDailySmallTalkMeeting.endTime} />
        )}
        {edit && (
          <div className="day-of-weeks">
            <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
            {[t('월'), t('화'), t('수'), t('목'), t('금'), t('토'), t('일')].map((day, jnx) => {
              return (
                <Button
                  key={jnx}
                  className={sprintDailySmallTalkMeeting.days[jnx] === '1' ? 'selected' : ''}
                  size="md"
                  color="white"
                  outline
                  rounded
                  onClick={() => {
                    onChangeMeetingDays(jnx, sprintDailySmallTalkMeeting.days[jnx] === '1' ? '0' : '1');
                  }}
                >
                  {day}
                </Button>
              );
            })}
            <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
            <Button
              size="sm"
              className={sprintDailySmallTalkMeeting.onHoliday ? 'selected' : ''}
              color="white"
              outline
              onClick={() => {
                onChangeInfo('onHoliday', !sprintDailySmallTalkMeeting.onHoliday);
              }}
            >
              휴일 제외
            </Button>
          </div>
        )}
        {!edit && (
          <div className="day-of-weeks">
            <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
            {[t('월'), t('화'), t('수'), t('목'), t('금'), t('토'), t('일')]
              .filter((d, inx) => {
                return sprintDailySmallTalkMeeting.days[inx] === '1';
              })
              .map((day, jnx) => {
                return (
                  <span key={jnx} className="day-text">
                    <span>{day}</span>
                  </span>
                );
              })}
            {sprintDailySmallTalkMeeting.onHoliday && (
              <>
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
                <span className="holiday-text">
                  <span>휴일 제외</span>
                </span>
              </>
            )}
          </div>
        )}
      </BlockRow>
      <BlockRow>
        <Label minWidth={labelMinWidth}>{t('최대 참여자 수')}</Label>
        {edit && (
          <Input
            type="number"
            size="md"
            value={sprintDailySmallTalkMeeting.limitUserCount}
            onChange={(val) => onChangeInfo('limitUserCount', val)}
            outline
            simple
            required
            minLength={1}
          />
        )}
        {!edit && <Text>{sprintDailySmallTalkMeeting.limitUserCount}</Text>}
      </BlockRow>
    </div>
  );
};

export default withTranslation()(withRouter(DailySmallTalkMeeting));

DailySmallTalkMeeting.defaultProps = {
  className: '',
  edit: false,
};

DailySmallTalkMeeting.propTypes = {
  className: PropTypes.string,
  edit: PropTypes.bool,
  t: PropTypes.func,
  no: PropTypes.number,
  onRemove: PropTypes.func,
  sprintDailySmallTalkMeeting: PropTypes.shape({
    days: PropTypes.string,
    endTime: PropTypes.number,
    id: PropTypes.number,
    name: PropTypes.string,
    onHoliday: PropTypes.bool,
    startTime: PropTypes.number,
    limitUserCount: PropTypes.number,
  }),
  onChangeInfo: PropTypes.func,
  onChangeMeetingDays: PropTypes.func,

  user: UserPropTypes,
};
