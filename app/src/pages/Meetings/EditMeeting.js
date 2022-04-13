import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  Button,
  DateRange,
  EmptyContent,
  Form,
  Input,
  Label,
  Liner,
  Page,
  PageContent,
  PageTitle,
  Selector,
  UserList,
} from '@/components';
import dialog from '@/utils/dialog';
import { MEETING_TYPES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './EditMeeting.scss';
import sprintUtil from '@/pages/Sprints/sprintUtil';
import RadioButton from '@/components/RadioButton/RadioButton';
import commonUtil from '@/utils/commonUtil';

const start = new Date();
start.setHours(start.getHours() + 1);
start.setMinutes(0);
start.setSeconds(0);
start.setMilliseconds(0);

const end = new Date();
end.setHours(end.getHours() + 2);
end.setMinutes(0);
end.setSeconds(0);
end.setMilliseconds(0);

const labelMinWidth = '140px';

const quickTimes = [10, 11, 14, 15, 16, 17, 18, 23];

const durations = [1000 * 60 * 10, 1000 * 60 * 30, 1000 * 60 * 60, 1000 * 60 * 120];

const EditMeeting = ({
  t,
  type,
  history,
  user,
  match: {
    params: { id },
  },
}) => {
  const [sprints, setSprints] = useState([]);
  const [sprintUsers, setSprintUsers] = useState([]);
  const [duration, setDuration] = useState(1000 * 60 * 30);
  const [info, setInfo] = useState({
    id: null,
    sprintId: null,
    name: '',
    startDate: start.getTime(),
    endDate: end.getTime(),
    users: [],
    type: 'MEETING',
  });

  const getSprints = () => {
    request.get(
      '/api/sprints',
      null,
      (list) => {
        setSprints(
          list.map((d) => {
            return sprintUtil.getSprint(d);
          }),
        );

        if (type === 'new') {
          if (list.length > 0) {
            setInfo({
              ...info,
              sprintId: list[0].id,
            });
          }
        }
      },
      null,
      t('사용자의 스프린트 목록을 모으고 있습니다.'),
    );
  };

  const getSprint = (sprintId) => {
    request.get(
      `/api/sprints/${sprintId}`,
      null,
      (data) => {
        const users = data.users.map((u) => {
          return {
            userId: u.userId,
            email: u.email,
            alias: u.alias,
            name: u.name,
            imageType: u.imageType,
            imageData: u.imageData,
          };
        });

        setSprintUsers(users);

        if (info.type !== 'SMALLTALK') {
          if (type === 'new') {
            setInfo({
              ...info,
              users,
            });
          }
        }
      },
      null,
      t('스프린트가 변경되어 참여자를 변경 중입니다.'),
    );
  };

  const getMeeting = (meetingId) => {
    request.get(
      `/api/meetings/${meetingId}`,
      null,
      (data) => {
        console.log(data);
        setInfo({
          ...data,
          startDate: dateUtil.getTime(data.startDate),
          endDate: dateUtil.getTime(data.endDate),
        });

        const currentDuration = dateUtil.getTime(data.endDate) - dateUtil.getTime(data.startDate);
        if (durations.find((d) => d === currentDuration)) {
          setDuration(currentDuration);
        }
      },
      null,
      t('미팅 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getSprints();
    if (id) {
      getMeeting(id);
    }
  }, [id]);

  useEffect(() => {
    if (info.sprintId) {
      getSprint(info.sprintId);
    }
  }, [info.sprintId]);

  useEffect(() => {
    if (type === 'new') {
      const users = info.users.splice(0);
      if (user && user.id && users.length < 1) {
        users.push({
          userId: user.id,
          email: user.email,
          alias: user.alias,
          name: user.name,
          imageType: user.imageType,
          imageData: user.imageData,
          role: 'ADMIN',
          CRUD: 'C',
        });

        setInfo({
          ...info,
          users,
        });
      }
    }
  }, [user]);

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;

    if (key === 'type') {
      if (value === 'SMALLTALK') {
        next.users = [];
        if (!next.limitUserCount) {
          next.limitUserCount = 4;
        }
      } else {
        next.users = sprintUsers.slice(0);
        if (!next.limitUserCount) {
          next.limitUserCount = null;
        }
      }
    }

    setInfo(next);
  };

  const changeUsers = (users) => {
    const next = { ...info };
    next.users = users;
    setInfo(next);
  };

  const changeTime = (startDate, span) => {
    if (span) {
      setInfo({
        ...info,
        startDate,
        endDate: startDate + span,
      });
    } else {
      setInfo({
        ...info,
        startDate,
      });
    }
  };

  const getHourDate = (date, hours) => {
    date.setHours(hours);
    date.setMinutes(0);
    date.setSeconds(0);
    date.setMilliseconds(0);
    return date;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (type === 'edit') {
      request.put(
        `/api/meetings/${info.id}`,
        {
          ...info,
          startDate: new Date(info.startDate),
          endDate: new Date(info.endDate),
          users: info.users.filter((u) => u.CRUD !== 'D'),
        },
        () => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 변경되었습니다.'), () => {
            history.push('/meetings');
          });
        },
        null,
        t('미팅 정보를 변경하고 있습니다.'),
      );
    } else {
      request.post(
        '/api/meetings',
        { ...info, startDate: new Date(info.startDate), endDate: new Date(info.endDate) },
        () => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push('/meetings');
          });
        },
        null,
        t('새로운 미팅을 만들고 있습니다.'),
      );
    }
  };

  const nowHours = new Date().getHours();

  return (
    <Page className="edit-meeting-wrapper">
      <PageTitle
        breadcrumbs={
          type === 'new'
            ? [
                {
                  link: commonUtil.getSpaceUrl('/'),
                  name: t('TOP'),
                },
                {
                  link: commonUtil.getSpaceUrl('/meetings'),
                  name: t('미팅 목록'),
                },
                {
                  link: commonUtil.getSpaceUrl('/meetings/new'),
                  name: t('새 미팅'),
                  current: true,
                },
              ]
            : [
                {
                  link: commonUtil.getSpaceUrl('/'),
                  name: t('TOP'),
                },
                {
                  link: commonUtil.getSpaceUrl('/meetings'),
                  name: t('미팅 목록'),
                },
                {
                  link: commonUtil.getSpaceUrl(`/meetings/${info?.id}`),
                  name: info?.name,
                },
                {
                  link: commonUtil.getSpaceUrl(`/meetings/${info?.id}/edit`),
                  name: t('변경'),
                  current: true,
                },
              ]
        }
      >
        {type === 'edit' ? t('미팅 정보 변경') : t('새로운 미팅')}
      </PageTitle>
      <PageContent className="d-flex" info>
        <Form onSubmit={onSubmit} className="d-flex flex-column h-100">
          <Block className="pt-0">
            <BlockTitle className="mb-2 mb-sm-3">{t('미팅 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('스프린트')}
              </Label>
              <Selector
                outline
                items={sprints.map((sprint) => {
                  return {
                    key: sprint.id,
                    value: sprint.name,
                  };
                })}
                value={info.sprintId}
                onChange={(val) => changeInfo('sprintId', val)}
                minWidth="160px"
              />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('이름')}
              </Label>
              <Input type="text" size="md" value={info.name} onChange={(val) => changeInfo('name', val)} outline simple required minLength={1} />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('시간')}
              </Label>
              <DateRange
                country={user.country}
                language={user.language}
                startDate={info.startDate}
                endDate={info.endDate}
                onChange={(key, value) => {
                  const v = {};
                  v[key] = value;
                  setInfo({ ...info, ...v });
                }}
              />
            </BlockRow>
            <BlockRow>
              <div
                className="range-quick-buttons"
                style={{
                  marginLeft: labelMinWidth,
                }}
              >
                <div className="g-scrollbar">
                  <div>
                    <span className="day-label">{t('회의 시간')}</span>
                    {durations.map((span) => {
                      return (
                        <Button
                          key={span}
                          size="sm"
                          color={info.endDate - info.startDate === span ? 'yellow' : 'white'}
                          outline
                          onClick={() => {
                            changeTime(info.startDate, span);
                            setDuration(span);
                          }}
                        >
                          {span / (1000 * 60)} {t('분')}
                        </Button>
                      );
                    })}
                  </div>
                  <div>
                    <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                  </div>
                  <div>
                    <span className="day-label">{t('시작 시간')}</span>
                    <Button
                      size="sm"
                      color="white"
                      outline
                      onClick={() => {
                        changeTime(Date.now(), info.endDate - info.startDate === duration ? duration : null);
                      }}
                    >
                      {t('지금')}
                    </Button>
                    <Button
                      size="sm"
                      color="white"
                      outline
                      onClick={() => {
                        changeTime(
                          Math.floor(Date.now() / (1000 * 60 * 60)) * 1000 * 60 * 60 + 1000 * 60 * 60,
                          info.endDate - info.startDate === duration ? duration : null,
                        );
                      }}
                    >
                      {t('다음 시간')}
                    </Button>
                  </div>
                  <div>
                    <span className="day-label">오늘</span>
                    {quickTimes
                      .filter((d) => d > nowHours)
                      .map((d) => {
                        return (
                          <Button
                            key={d}
                            size="sm"
                            color={
                              new Date(info.startDate).getDate() === new Date().getDate() && new Date(info.startDate).getHours() === d ? 'yellow' : 'white'
                            }
                            outline
                            onClick={() => {
                              changeTime(getHourDate(new Date(), d).getTime(), info.endDate - info.startDate === duration ? duration : null);
                            }}
                          >
                            {d}
                            {t('시')}
                          </Button>
                        );
                      })}
                  </div>
                  <div className="next-day">
                    <span className="day-label">{t('내일')}</span>
                    {quickTimes.map((d) => {
                      return (
                        <Button
                          key={d}
                          size="sm"
                          color={
                            new Date(info.startDate).getDate() === new Date().getDate() + 1 && new Date(info.startDate).getHours() === d ? 'yellow' : 'white'
                          }
                          outline
                          onClick={() => {
                            const nextDay = new Date();
                            nextDay.setDate(nextDay.getDate() + 1);
                            changeTime(getHourDate(nextDay, d).getTime(), info.endDate - info.startDate === duration ? duration : null);
                          }}
                        >
                          {d}
                          {t('시')}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('미팅 타입')}
              </Label>
              {type === 'new' && (
                <RadioButton
                  className="radio"
                  size="sm"
                  items={MEETING_TYPES.filter((d) => d.supportType === type)}
                  value={info?.type}
                  onClick={(val) => changeInfo('type', val)}
                />
              )}
              {type === 'edit' && info.type === 'SCRUM' && <span className="align-self-center">{MEETING_TYPES.find((d) => d.key === info?.type).value}</span>}
              {type === 'edit' && info.type !== 'SCRUM' && (
                <RadioButton
                  className="radio"
                  size="sm"
                  items={MEETING_TYPES.filter((d) => d.supportType === 'new')}
                  value={info?.type}
                  onClick={(val) => changeInfo('type', val)}
                />
              )}
            </BlockRow>
            {info.type === 'SMALLTALK' && (
              <BlockRow>
                <Label minWidth={labelMinWidth} required>
                  {t('최대 참여 인원')}
                </Label>
                <Input
                  type="number"
                  size="md"
                  value={info.limitUserCount}
                  onChange={(val) => changeInfo('limitUserCount', val)}
                  outline
                  simple
                  required
                  minLength={1}
                />
              </BlockRow>
            )}
          </Block>
          <Block className={`flex-grow-1 d-flex flex-column ${info.type === 'SMALLTALK' ? 'pb-0' : ''}`}>
            <BlockTitle className="mb-2 mb-sm-3">{t('참여자')}</BlockTitle>
            {info.type === 'SMALLTALK' && <EmptyContent className="flex-grow-1" icon={false} height="auto" message={t('스프린트 멤버들이 참여 가능합니다.')} />}
            {info.type !== 'SMALLTALK' && (
              <UserList
                users={info.users}
                onChange={(val) => changeInfo('users', val)}
                onChangeUsers={changeUsers}
                editable={{
                  role: false,
                  member: true,
                  add : true,
                }}
              />
            )}
          </Block>
          <BottomButtons
            onCancel={() => {
              history.goBack();
            }}
            onSubmit
            onSubmitIcon={<i className="fas fa-plane" />}
            onSubmitText={type === 'edit' ? t('변경') : t('미팅 추가')}
          />
        </Form>
      </PageContent>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(EditMeeting)));

EditMeeting.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  type: PropTypes.string,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
