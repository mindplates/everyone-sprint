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
  CheckBox,
  DateRange,
  Form,
  Input,
  Label,
  Page,
  PageContent,
  PageTitle,
  UserList,
} from '@/components';
import dialog from '@/utils/dialog';
import { ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './EditSprint.scss';

const start = new Date();
start.setHours(9);
start.setMinutes(0);
start.setSeconds(0);
start.setMilliseconds(0);

const end = new Date();
end.setHours(18);
end.setMinutes(0);
end.setSeconds(0);
end.setMilliseconds(0);
end.setDate(end.getDate() + 14);

const labelMinWidth = '140px';

const EditSprint = ({
  t,
  type,
  history,
  user,
  match: {
    params: { id },
  },
}) => {
  const [info, setInfo] = useState({
    name: '',
    startDate: start.getTime(),
    endDate: end.getTime(),
    isJiraSprint: false,
    jiraSprintUrl: '',
    jiraAuthKey: '',
    allowSearch: true,
    allowAutoJoin: true,
    activated: true,
    doDailyScrumMeeting: false,
    users: [],
    sprintDailyMeetings: [],
  });

  useEffect(() => {
    if (id && type === 'edit')
      request.get(
        `/api/sprints/${id}`,
        null,
        (data) => {
          setInfo({
            ...data,
            startDate: dateUtil.getTime(data.startDate),
            endDate: dateUtil.getTime(data.endDate),
          });
        },
        null,
        t('스프린트 정보를 가져오고 있습니다'),
      );
  }, [id, type]);

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
    setInfo(next);
  };

  const changeSprintDailyMeeting = (inx, key, value) => {
    const next = { ...info };
    const nextSprintDailyMeetings = next.sprintDailyMeetings.slice(0);
    nextSprintDailyMeetings[inx] = { ...nextSprintDailyMeetings[inx], [key]: value };
    next.sprintDailyMeetings = nextSprintDailyMeetings;
    setInfo(next);
  };

  const removeSprintDailyMeeting = (inx) => {
    const next = { ...info };
    const nextSprintDailyMeetings = next.sprintDailyMeetings.slice(0);
    nextSprintDailyMeetings.splice(inx, 1);
    next.sprintDailyMeetings = nextSprintDailyMeetings;
    setInfo(next);
  };

  const changeSprintDailyMeetingQuestions = (meetingIndex, questionIndex, key, value) => {
    const next = { ...info };
    const nextSprintDailyMeetings = next.sprintDailyMeetings.slice(0);
    const nextSprintDailyMeetingQuestions = nextSprintDailyMeetings[meetingIndex].sprintDailyMeetingQuestions.slice(0);

    nextSprintDailyMeetingQuestions[questionIndex] = { ...nextSprintDailyMeetingQuestions[questionIndex], [key]: value };

    nextSprintDailyMeetings[meetingIndex].sprintDailyMeetingQuestions = nextSprintDailyMeetingQuestions;
    next.sprintDailyMeetings = nextSprintDailyMeetings;
    setInfo(next);
  };

  const changeOrderSprintDailyMeetingQuestions = (dir, meetingIndex, questionIndex) => {
    const next = { ...info };
    const nextSprintDailyMeetings = next.sprintDailyMeetings.slice(0);
    const nextSprintDailyMeetingQuestions = nextSprintDailyMeetings[meetingIndex].sprintDailyMeetingQuestions.slice(0);

    const target = nextSprintDailyMeetingQuestions[questionIndex];

    if (dir === 'up' && questionIndex > 0) {
      nextSprintDailyMeetingQuestions.splice(questionIndex, 1);
      nextSprintDailyMeetingQuestions.splice(questionIndex - 1, 0, target);
    }

    if (dir === 'down' && questionIndex < nextSprintDailyMeetingQuestions.length - 1) {
      nextSprintDailyMeetingQuestions.splice(questionIndex, 1);
      nextSprintDailyMeetingQuestions.splice(questionIndex + 1, 0, target);
    }

    if (dir === 'remove') {
      nextSprintDailyMeetingQuestions.splice(questionIndex, 1);
    }

    if (dir === 'add') {
      nextSprintDailyMeetingQuestions.push({
        question: t('새 질문'),
        sortOrder: nextSprintDailyMeetingQuestions.length + 1,
      });
    }

    nextSprintDailyMeetings[meetingIndex].sprintDailyMeetingQuestions = nextSprintDailyMeetingQuestions;
    next.sprintDailyMeetings = nextSprintDailyMeetings;
    setInfo(next);
  };

  const changeUsers = (users) => {
    const next = { ...info };
    next.users = users;
    setInfo(next);
  };

  const addSprintDailyMeeting = () => {
    const next = { ...info };
    const sprintDailyMeetings = next.sprintDailyMeetings.slice(0);

    const sprintDailyMeetingQuestions = [];
    sprintDailyMeetingQuestions.push({
      question: t('지난 데일리 스크럼부터 지금까지 내가 완수한 것이 무엇인가'),
      sortOrder: 1,
    });

    sprintDailyMeetingQuestions.push({
      question: t('다음 데일리 스크럼까지 내가 하기로 한 것이 무엇인가'),
      sortOrder: 2,
    });

    sprintDailyMeetingQuestions.push({
      question: t('현재 장애가 되고 있는 것(곤란하고 어려운 것)이 무엇인가'),
      sortOrder: 3,
    });

    const startTime = new Date();
    startTime.setHours(11);
    startTime.setMinutes(0);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    const endTime = new Date();
    endTime.setHours(12);
    endTime.setMinutes(0);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);

    sprintDailyMeetings.push({
      name: '데일리 스크럼',
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      useQuestion: true,
      sprintDailyMeetingQuestions,
    });

    next.sprintDailyMeetings = sprintDailyMeetings;
    setInfo(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (type === 'edit') {
      request.put(
        `/api/sprints/${info.id}`,
        {
          ...info,
          startDate: new Date(info.startDate),
          endDate: new Date(info.endDate),
          users: info.users.filter((u) => u.CRUD !== 'D'),
        },
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push(`/sprints/${data.id}`);
          });
        },
        null,
        t('스프린트를 변경하고 있습니다.'),
      );
    } else {
      request.post(
        '/api/sprints',
        { ...info, startDate: new Date(info.startDate), endDate: new Date(info.endDate) },
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push(`/sprints/${data.id}`);
          });
        },
        null,
        t('새로운 스프린트를 만들고 있습니다.'),
      );
    }
  };

  return (
    <Page className="edit-sprint-wrapper">
      <PageTitle>{type === 'edit' ? t('스프린트 변경') : t('새로운 스프린트')}</PageTitle>
      <PageContent>
        <Form className="new-sprint-content" onSubmit={onSubmit}>
          <Block className="pt-0">
            <BlockTitle className="mb-2 mb-sm-3">{t('스프린트 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('이름')}
              </Label>
              <Input type="name" size="md" value={info.name} onChange={(val) => changeInfo('name', val)} outline simple required minLength={1} />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                {t('기간')}
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
          </Block>
          <Block className="pb-0">
            <BlockTitle className="mb-2 mb-sm-3">{t('데일리 스크럼')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('데일리 스크럼 미팅')}</Label>
              <CheckBox
                size="md"
                type="checkbox"
                value={info.doDailyScrumMeeting}
                onChange={(val) => changeInfo('doDailyScrumMeeting', val)}
                label={t('스프린트 기간 데일리 스크럼 미팅을 진행합니다.')}
              />
            </BlockRow>
          </Block>
          {info.doDailyScrumMeeting && (
            <Block className="sprint-daily-meetings">
              {info.sprintDailyMeetings.map((sprintDailyMeeting, inx) => {
                return (
                  <div key={inx} className="sprint-daily-meeting">
                    <div className="meeting-index">
                      <span>
                        <span>{inx + 1}</span>
                      </span>
                    </div>
                    <div className="meeting-remove-button">
                      <Button
                        size="sm"
                        color="warning"
                        outline
                        rounded
                        onClick={() => {
                          removeSprintDailyMeeting(inx);
                        }}
                      >
                        <i className="fas fa-times" />
                      </Button>
                    </div>
                    <BlockRow>
                      <Label minWidth={labelMinWidth}>{t('미팅 이름')}</Label>
                      <Input
                        type="name"
                        size="md"
                        value={sprintDailyMeeting.name}
                        onChange={(val) => changeSprintDailyMeeting(inx, 'name', val)}
                        outline
                        simple
                        required
                        minLength={1}
                      />
                    </BlockRow>
                    <BlockRow>
                      <Label minWidth={labelMinWidth}>{t('시간')}</Label>
                      <DateRange
                        country={user.country}
                        language={user.language}
                        startDate={sprintDailyMeeting.startTime}
                        endDate={sprintDailyMeeting.endTime}
                        showTimeSelectOnly
                        startDateKey="startTime"
                        endDateKey="endTime"
                        onChange={(key, value) => {
                          changeSprintDailyMeeting(inx, key, value);
                        }}
                      />
                    </BlockRow>
                    <BlockRow>
                      <Label minWidth={labelMinWidth}>{t('스크럼 양식 사용')}</Label>
                      <CheckBox
                        size="md"
                        type="checkbox"
                        value={sprintDailyMeeting.useQuestion}
                        onChange={(val) => changeSprintDailyMeeting(inx, 'useQuestion', val)}
                        label={t('정해진 스크럼 미팅 양식을 사용합니다.')}
                      />
                    </BlockRow>
                    {sprintDailyMeeting.useQuestion && (
                      <BlockRow>
                        <Label className="align-self-baseline" minWidth={labelMinWidth}>
                          {t('스크럼 질문')}
                        </Label>
                        <div className="flex-grow-1">
                          {sprintDailyMeeting.sprintDailyMeetingQuestions.map((sprintDailyMeetingQuestion, jnx) => {
                            return (
                              <div key={jnx} className="question-item">
                                <div className="dir-button up">
                                  <Button
                                    size="sm"
                                    color="white"
                                    outline
                                    rounded
                                    disabled={jnx < 1}
                                    onClick={() => {
                                      changeOrderSprintDailyMeetingQuestions('up', inx, jnx);
                                    }}
                                  >
                                    <i className="fas fa-arrow-up" />
                                  </Button>
                                </div>
                                <div className="dir-button down">
                                  <Button
                                    size="sm"
                                    color="white"
                                    outline
                                    rounded
                                    disabled={sprintDailyMeeting.sprintDailyMeetingQuestions.length - 2 < jnx}
                                    onClick={() => {
                                      changeOrderSprintDailyMeetingQuestions('down', inx, jnx);
                                    }}
                                  >
                                    <i className="fas fa-arrow-down" />
                                  </Button>
                                </div>
                                <div className="question">
                                  <Input
                                    type="name"
                                    size="md"
                                    value={sprintDailyMeetingQuestion.question}
                                    onChange={(val) => changeSprintDailyMeetingQuestions(inx, jnx, 'question', val)}
                                    outline
                                    simple
                                    required
                                    minLength={1}
                                  />
                                </div>
                                <div className="dir-button delete">
                                  <Button
                                    size="sm"
                                    color="warning"
                                    outline
                                    rounded
                                    onClick={() => {
                                      changeOrderSprintDailyMeetingQuestions('remove', inx, jnx);
                                    }}
                                  >
                                    <i className="fas fa-times" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                          <div className="add-button">
                            <Button
                              size="sm"
                              color="white"
                              outline
                              rounded
                              onClick={() => {
                                changeOrderSprintDailyMeetingQuestions('add', inx, null);
                              }}
                            >
                              <i className="fas fa-plus" />
                            </Button>
                          </div>
                        </div>
                      </BlockRow>
                    )}
                  </div>
                );
              })}
              <BlockRow>
                <div className="flex-grow-1 text-center">
                  <Button size="sm" color="white" outline onClick={addSprintDailyMeeting}>
                    미팅 추가
                  </Button>
                </div>
              </BlockRow>
            </Block>
          )}
          <Block>
            <BlockTitle className="mb-2 mb-sm-3">{t('지라 연동')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('지라 연동')}</Label>
              <CheckBox
                size="md"
                type="checkbox"
                value={info.isJiraSprint}
                onChange={(val) => changeInfo('isJiraSprint', val)}
                label={t('이 스프린트를 지라 스프린트와 연결합니다.')}
              />
            </BlockRow>
            {info.isJiraSprint && (
              <>
                <BlockRow expand>
                  <Label minWidth={labelMinWidth}>{t('지라 스트린트 URL')}</Label>
                  <Input
                    type="name"
                    size="md"
                    value={info.jiraSprintUrl}
                    onChange={(val) => changeInfo('jiraSprintUrl', val)}
                    outline
                    simple
                    display="block"
                    disabled={!info.isJiraSprint}
                  />
                </BlockRow>
                <BlockRow expand>
                  <Label minWidth={labelMinWidth}>{t('지라 인증 키')}</Label>
                  <Input
                    type="name"
                    size="md"
                    value={info.jiraAuthKey}
                    onChange={(val) => changeInfo('jiraAuthKey', val)}
                    outline
                    simple
                    display="block"
                    disabled={!info.isJiraSprint}
                  />
                </BlockRow>
              </>
            )}
          </Block>
          <Block className="mb-2">
            <BlockTitle className="mb-2 mb-sm-3">{t('검색 및 참여 설정')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('검색 허용')}</Label>
              <RadioButton
                size="sm"
                items={ALLOW_SEARCHES}
                value={info.allowSearch}
                onClick={(val) => {
                  changeInfo('allowSearch', val);
                }}
              />
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('자동 승인')}</Label>
              <RadioButton
                size="sm"
                items={JOIN_POLICIES}
                value={info.allowAutoJoin}
                onClick={(val) => {
                  changeInfo('allowAutoJoin', val);
                }}
              />
            </BlockRow>
          </Block>
          <Block>
            <BlockTitle className="mb-2 mb-sm-3">{t('멤버')}</BlockTitle>
            <UserList
              users={info.users}
              onChange={(val) => changeInfo('users', val)}
              onChangeUsers={changeUsers}
              editable={{
                role: true,
                member: true,
              }}
            />
          </Block>
          <BottomButtons
            onCancel={() => {
              history.goBack();
            }}
            onSubmit
            onSubmitIcon={<i className="fas fa-plane" />}
            onSubmitText={type === 'edit' ? t('스프린트 변경') : t('스프린트 등록')}
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

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(EditSprint)));

EditSprint.propTypes = {
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
