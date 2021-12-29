import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Block, BlockRow, Button, DatePicker, DateRangeText, Label, Liner, Page, PageContent, PageTitle, Tabs, Text } from '@/components';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import sprintUtil from '@/pages/Sprints/sprintUtil';
import dateUtil from '@/utils/dateUtil';
import DateCustomInput from '@/components/DateRange/DateCustomInput/DateCustomInput';
import { DATE_FORMATS } from '@/constants/constants';
import './SprintCommon.scss';
import './SprintBoard.scss';

const labelMinWidth = '140px';

const SprintBoard = ({
  t,
  history,
  user,
  match: {
    params: { id },
  },
}) => {
  const tabs = [
    {
      key: 'today',
      value: t('오늘'),
    },
    {
      key: 'summary',
      value: t('요약'),
    },
  ];

  const [sprint, setSprint] = useState(null);
  const [tab, setTab] = useState('today');
  const [date, setDate] = useState(
    (() => {
      const today = new Date();
      today.setHours(0);
      today.setMinutes(0);
      today.setSeconds(0);
      today.setMilliseconds(0);
      return today.getTime();
    })(),
  );

  useEffect(() => {
    request.get(
      `/api/sprints/${id}`,
      null,
      (data) => {
        setSprint(sprintUtil.getSprint(data));
      },
      null,
      t('스프린트 정보를 가져오고 있습니다.'),
    );
  }, [id]);

  console.log(history);

  const sprintSpan = dateUtil.getSpan(Date.now(), sprint?.endDate);

  return (
    <Page className="sprint-board-wrapper sprint-common">
      <PageTitle className="sprint-title-with-tag">
        <span>{sprint?.name}</span>
        <span className="spring-title-tag">BOARD</span>
      </PageTitle>
      {sprint && (
        <PageContent className="page-content">
          <Tabs
            tab={tab}
            tabs={tabs}
            onChange={setTab}
            rounded
            size="45px"
            border
            content={
              <div className="sprint-board-day-selector">
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem 0 0" />
                <div>
                  <Button
                    size="sm"
                    color="white"
                    outline
                    rounded
                    onClick={() => {
                      const prevDay = new Date(date);
                      prevDay.setDate(prevDay.getDate() - 1);
                      setDate(prevDay.getTime());
                    }}
                  >
                    <i className="fas fa-angle-left" />
                  </Button>
                </div>
                <div className="ml-3">
                  <DatePicker
                    className="date-picker start-date-picker"
                    selected={date}
                    onChange={setDate}
                    locale={user.language}
                    customInput={<DateCustomInput />}
                    dateFormat={DATE_FORMATS[dateUtil.getUserLocale()].days.picker}
                  />
                </div>
                <div>
                  <Button
                    className="ml-1"
                    size="sm"
                    color="white"
                    outline
                    rounded
                    onClick={() => {
                      const nextDay = new Date(date);
                      nextDay.setDate(nextDay.getDate() + 1);
                      setDate(nextDay.getTime());
                    }}
                  >
                    <i className="fas fa-angle-right" />
                  </Button>
                </div>
              </div>
            }
          />
          <div className="board-content">
            {tab === 'today' && <div className="day-content">TODAY</div>}
            {tab === 'summary' && (
              <div className="summary-content">
                <Block className="">
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('남은 기간')}</Label>
                    <Text>
                      <span className="sprint-span ml-0">
                        <span>{`${sprintSpan.days}${t('일')}`}</span>
                        <span className="ml-2">{`${sprintSpan.hours}${t('시간')}`}</span>
                        <span className="ml-2">{t('후 종료')}</span>
                      </span>
                    </Text>
                    <DateRangeText className="ml-2" country={user.country} startDate={sprint.startDate} endDate={sprint.endDate} />
                  </BlockRow>
                </Block>
              </div>
            )}
          </div>
        </PageContent>
      )}
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(SprintBoard)));

SprintBoard.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
