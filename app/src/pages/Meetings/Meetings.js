import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import { Button, CheckBox, DatePicker, EmptyContent, Liner, MeetingList, PageTitle, Selector } from '@/components';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import DateCustomInput from '@/components/DateRange/DateCustomInput/DateCustomInput';
import { DATE_FORMATS } from '@/constants/constants';
import './Meetings.scss';
import dateUtil from '@/utils/dateUtil';
import commonUtil from '@/utils/commonUtil';

const ranges = [
  {
    key: dateUtil.getToday(),
    value: '오늘',
  },
  {
    key: dateUtil.getTomorrow(),
    value: '내일',
  },
];

const Meetings = ({ t, user, history }) => {
  const [tabs] = useState([
    {
      key: 'list',
      value: t('리스트'),
      icon: <i className="fas fa-bars" />,
    },
    {
      key: 'calendar',
      value: t('캘린더'),
      icon: <i className="far fa-calendar-alt" />,
    },
  ]);
  const [tab, setTab] = useState(tabs[0].key);
  const [query, setQuery] = useState({
    date: dateUtil.getToday(),
    sprintId: null,
  });
  const [options, setOptions] = useState({
    all: true,
  });

  const [sprints, setSprints] = useState([]);
  const [meetings, setMeetings] = useState(null);

  const getSprints = () => {
    request.get(
      '/api/sprints',
      null,
      (list) => {
        setSprints(list);
      },
      null,
      t('사용자의 스프린트 목록을 모으고 있습니다.'),
    );
  };

  const getMeetings = () => {
    request.get(
      '/api/meetings',
      query,
      (list) => {
        setMeetings(list.sort((a, b) => dateUtil.getTime(a.startDate) - dateUtil.getTime(b.startDate)));
      },
      null,
      t('사용자의 미팅 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getSprints();
  }, []);

  useEffect(() => {
    getMeetings();
  }, [query]);

  const list = meetings?.filter((d) => (options.all ? true : dateUtil.getTime(d.endDate) > Date.now()));

  return (
    <div className="meetings-wrapper g-content">
      <PageTitle
        buttons={[
          {
            icon: <i className="fas fa-plus" />,
            text: t('새 미팅'),
            handler: () => {
              history.push('/meetings/new');
            },
          },
        ]}
      >
        {t('미팅')}
      </PageTitle>
      <div className={`${meetings && meetings.length > 0 ? 'g-page-content' : 'g-page-content'}`}>
        <div className="search">
          <div>
            <div>
              <div className="label date-quick-control">{t('날짜')}</div>
              <div>
                <div className="day-selector">
                  <div className="day-quick-button  date-quick-control">
                    <RadioButton
                      size="xs"
                      items={ranges.map((d) => {
                        return {
                          key: d.key.getTime(),
                          value: d.value,
                        };
                      })}
                      value={query.date.getTime()}
                      onClick={(val) => {
                        setQuery({
                          ...query,
                          date: new Date(val),
                        });
                      }}
                    />
                  </div>
                  <div>
                    <Button
                      size="xs"
                      color="white"
                      outline
                      onClick={() => {
                        setQuery({
                          ...query,
                          date: dateUtil.addDays(query.date, -1),
                        });
                      }}
                    >
                      <i className="fas fa-chevron-left" />
                    </Button>
                  </div>
                  <div className="date-picker">
                    <DatePicker
                      className="date-picker start-date-picker"
                      selected={query.date}
                      onChange={(date) => {
                        setQuery({
                          ...query,
                          date: dateUtil.getTruncateDate(date),
                        });
                      }}
                      locale={user.language}
                      customInput={<DateCustomInput />}
                      dateFormat={DATE_FORMATS[dateUtil.getUserLocale()].days.picker}
                    />
                  </div>
                  <div>
                    <Button
                      size="xs"
                      color="white"
                      outline
                      onClick={() => {
                        setQuery({
                          ...query,
                          date: dateUtil.addDays(query.date, 1),
                        });
                      }}
                    >
                      <i className="fas fa-chevron-right" />
                    </Button>
                  </div>
                </div>
              </div>
              <div>
                <Liner className="date-quick-control" display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
              </div>
            </div>

            <div>
              <div className="label">{t('스프린트')}</div>
              <div className="sprint-control">
                <Selector
                  outline
                  size="xs"
                  items={[{ key: null, value: t('모두') }].concat(
                    sprints.map((sprint) => {
                      return {
                        key: sprint.id,
                        value: sprint.name,
                      };
                    }),
                  )}
                  value={query.sprintId}
                  onChange={(val) =>
                    setQuery({
                      ...query,
                      sprintId: val,
                    })
                  }
                  minWidth="65px"
                />
              </div>
              <div className="all-control">
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
              </div>
              <div className="all-control">
                <CheckBox
                  size="sm"
                  type="checkbox"
                  value={options.all}
                  onChange={() =>
                    setOptions({
                      all: !options.all,
                    })
                  }
                  label={t('지난 일정 포함')}
                />
              </div>
              <div className="all-control">
                <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 1rem" />
              </div>
              <div className="label">{t('보기')}</div>
              <div>
                <RadioButton
                  className="d-none d-sm-inline-block"
                  size="xs"
                  items={tabs}
                  value={tab}
                  onClick={(val) => {
                    setTab(val);
                  }}
                />
                <RadioButton
                  className="d-inline-block d-sm-none"
                  size="xs"
                  items={tabs.map((d) => {
                    return { key: d.key, value: d.icon };
                  })}
                  value={tab}
                  onClick={(val) => {
                    setTab(val);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        {tab === 'list' && meetings != null && (
          <>
            {meetings && list.length > 0 && (
              <MeetingList
                meetings={list}
                onJoin={(code) => {
                  commonUtil.fullscreen(true);
                  history.push(`/conferences/${code}`);
                }}
              />
            )}
            {!(meetings && list.length > 0) && (
              <EmptyContent
                height="100%"
                message={t('약속된 미팅이 없습니다.')}
                additionalContent={
                  <div className="mt-3 mb-4">
                    <Button
                      size="md"
                      color="primary"
                      onClick={() => {
                        history.push('/meetings/new');
                      }}
                    >
                      <i className="fas fa-plus" /> {t('새 미팅')}
                    </Button>
                  </div>
                }
              />
            )}
          </>
        )}
        {tab === 'calendar' && <EmptyContent height="100%" message={t('아직 구현되지 않은 기능입니다.')} />}
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(connect(mapStateToProps, undefined), withRouter, withTranslation())(Meetings);

Meetings.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
  user: UserPropTypes,
};
