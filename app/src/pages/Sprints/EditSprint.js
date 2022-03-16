import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import qs from 'qs';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  Button,
  CheckBox,
  DailyScrumMeeting,
  DailySmallTalkMeeting,
  DateRange,
  EmptyContent,
  Form,
  Input,
  Label,
  Page,
  PageContent,
  PageTitle,
  Selector,
  UserList,
  withLogin,
} from '@/components';
import dialog from '@/utils/dialog';
import { JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes, LocationPropTypes, UserPropTypes } from '@/proptypes';
import sprintUtil from '@/pages/Sprints/sprintUtil';

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
  location,
}) => {
  const [projects, setProjects] = useState(null);
  const [sprint, setSprint] = useState({
    name: '',
    startDate: start.getTime(),
    endDate: end.getTime(),
    isJiraSprint: false,
    jiraSprintUrl: '',
    jiraAuthKey: '',
    allowAutoJoin: true,
    activated: true,
    doDailyScrumMeeting: false,
    doDailySmallTalkMeeting: false,
    users: [],
    scrumMeetingPlans: [],
    smallTalkMeetingPlans: [],
    projectId: null,
  });

  const search = qs.parse(location.search, { ignoreQueryPrefix: true });

  useEffect(() => {
    if (id && type === 'edit')
      request.get(
        `/api/sprints/${id}`,
        null,
        (data) => {
          setSprint(sprintUtil.getSprint(data));
        },
        null,
        t('스프린트 정보를 가져오고 있습니다'),
      );
  }, [id, type]);

  const getProjects = () => {
    request.get(
      '/api/projects',
      null,
      (list) => {
        setProjects(list);

        if (type === 'new' && list.filter((d) => d.activated).length > 0) {
          const [first] = list;
          let project = first;
          if (search.projectId) {
            project = list.filter((d) => d.activated).find((d) => d.id === Number(search.projectId));
          }

          const users = project?.users.map((d) => {
            return {
              userId: d.userId,
              email: d.email,
              alias: d.alias,
              name: d.name,
              imageType: d.imageType,
              imageData: d.imageData,
              role: d.role,
              CRUD: 'C',
            };
          });

          setSprint({
            ...sprint,
            users: users || [],
            projectId: project?.id,
          });
        }
      },
      null,
      t('사용자의 프로젝트 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getProjects();
  }, [user]);

  const changeInfo = (key, value) => {
    const next = { ...sprint };
    next[key] = value;

    if (key === 'startDate' && next.startDate > next.endDate) {
      const nextEnd = new Date(next.startDate);
      nextEnd.setHours(18);
      nextEnd.setMinutes(0);
      nextEnd.setSeconds(0);
      nextEnd.setMilliseconds(0);
      nextEnd.setDate(nextEnd.getDate() + 14);

      next.endDate = nextEnd.getTime();
    }

    if (key === 'endDate' && next.startDate > next.endDate) {
      const nextStart = new Date(next.endDate);
      nextStart.setHours(9);
      nextStart.setMinutes(0);
      nextStart.setSeconds(0);
      nextStart.setMilliseconds(0);
      nextStart.setDate(nextStart.getDate() - 14);

      next.startDate = nextStart.getTime();
    }

    if (key === 'startDate' || key === 'endDate' || key === 'users') {
      const nextSprintDailyMeetings = next.scrumMeetingPlans.slice(0);
      nextSprintDailyMeetings.forEach((scrumMeetingPlan) => {
        if (scrumMeetingPlan.CRUD === 'R') {
          scrumMeetingPlan.CRUD = 'U';
        }
      });
      next.scrumMeetingPlans = nextSprintDailyMeetings;
    }

    if (key === 'doDailyScrumMeeting' && value === false) {
      const nextSprintDailyMeetings = next.scrumMeetingPlans.slice(0);
      for (let i = nextSprintDailyMeetings.length - 1; i >= 0; i -= 1) {
        if (nextSprintDailyMeetings[i].CRUD === 'C') {
          nextSprintDailyMeetings.splice(i, 1);
        } else {
          nextSprintDailyMeetings[i].CRUD = 'D';
        }
      }
      next.scrumMeetingPlans = nextSprintDailyMeetings;
    }

    if (key === 'doDailySmallTalkMeeting' && value === false) {
      const nextSprintDailySmallTalkMeetings = next.smallTalkMeetingPlans.slice(0);
      for (let i = nextSprintDailySmallTalkMeetings.length - 1; i >= 0; i -= 1) {
        if (nextSprintDailySmallTalkMeetings[i].CRUD === 'C') {
          nextSprintDailySmallTalkMeetings.splice(i, 1);
        } else {
          nextSprintDailySmallTalkMeetings[i].CRUD = 'D';
        }
      }
      next.smallTalkMeetingPlans = nextSprintDailySmallTalkMeetings;
    }

    setSprint(next);
  };

  const changeSprintDailyMeeting = (inx, key, value) => {
    const next = { ...sprint };
    const nextSprintDailyMeetings = next.scrumMeetingPlans.slice(0);
    nextSprintDailyMeetings[inx] = { ...nextSprintDailyMeetings[inx], [key]: value };

    if (key === 'startTime' && nextSprintDailyMeetings[inx].startTime >= nextSprintDailyMeetings[inx].endTime) {
      nextSprintDailyMeetings[inx].endTime = nextSprintDailyMeetings[inx].startTime + 1000 * 60 * 30;
    }

    if (key === 'endTime' && nextSprintDailyMeetings[inx].startTime >= nextSprintDailyMeetings[inx].endTime) {
      nextSprintDailyMeetings[inx].startTime = nextSprintDailyMeetings[inx].endTime - 1000 * 60 * 30;
    }

    if (nextSprintDailyMeetings[inx].CRUD === 'R') {
      nextSprintDailyMeetings[inx].CRUD = 'U';
    }

    next.scrumMeetingPlans = nextSprintDailyMeetings;
    setSprint(next);
  };

  const changeSprintDailyMeetingDays = (inx, daysIndex, value) => {
    const next = { ...sprint };
    const nextSprintDailyMeetings = next.scrumMeetingPlans.slice(0);
    const nextSprintDailyMeeting = nextSprintDailyMeetings[inx];
    const list = nextSprintDailyMeeting.days.split('');
    list[daysIndex] = value;
    nextSprintDailyMeeting.days = list.join('');

    if (nextSprintDailyMeeting.CRUD === 'R') {
      nextSprintDailyMeeting.CRUD = 'U';
    }

    next.scrumMeetingPlans = nextSprintDailyMeetings;
    setSprint(next);
  };

  const removeSprintDailyMeeting = (inx) => {
    const next = { ...sprint };
    const nextSprintDailyMeetings = next.scrumMeetingPlans.slice(0);
    if (nextSprintDailyMeetings[inx].CRUD === 'C') {
      nextSprintDailyMeetings.splice(inx, 1);
      next.scrumMeetingPlans = nextSprintDailyMeetings;
    } else {
      nextSprintDailyMeetings[inx].CRUD = 'D';
      next.scrumMeetingPlans = nextSprintDailyMeetings;
    }

    setSprint(next);
  };

  const changeSprintDailyMeetingQuestions = (meetingIndex, questionIndex, key, value) => {
    const next = { ...sprint };
    const nextSprintDailyMeetings = next.scrumMeetingPlans.slice(0);
    const nextSprintDailyMeetingQuestions = nextSprintDailyMeetings[meetingIndex].scrumMeetingQuestions.slice(0);
    nextSprintDailyMeetingQuestions[questionIndex][key] = value;
    nextSprintDailyMeetings[meetingIndex].scrumMeetingQuestions = nextSprintDailyMeetingQuestions;
    next.scrumMeetingPlans = nextSprintDailyMeetings;
    setSprint(next);
  };

  const changeOrderSprintDailyMeetingQuestions = (dir, meetingIndex, questionIndex) => {
    const next = { ...sprint };
    const nextSprintDailyMeetings = next.scrumMeetingPlans.slice(0);
    const nextSprintDailyMeetingQuestions = nextSprintDailyMeetings[meetingIndex].scrumMeetingQuestions.slice(0);

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

    nextSprintDailyMeetings[meetingIndex].scrumMeetingQuestions = nextSprintDailyMeetingQuestions;
    next.scrumMeetingPlans = nextSprintDailyMeetings;
    setSprint(next);
  };

  const changeUsers = (users) => {
    const next = { ...sprint };
    next.users = users;
    const nextSprintDailyMeetings = next.scrumMeetingPlans.slice(0);
    nextSprintDailyMeetings.forEach((scrumMeetingPlan) => {
      if (scrumMeetingPlan.CRUD === 'R') {
        scrumMeetingPlan.CRUD = 'U';
      }
    });
    setSprint(next);
  };

  const addSprintDailyMeeting = () => {
    const next = { ...sprint };
    const scrumMeetingPlans = next.scrumMeetingPlans.slice(0);

    const scrumMeetingQuestions = [];
    scrumMeetingQuestions.push({
      question: t('지난 데일리 스크럼부터 지금까지 내가 완수한 것이 무엇인가'),
      sortOrder: 1,
    });

    scrumMeetingQuestions.push({
      question: t('다음 데일리 스크럼까지 내가 하기로 한 것이 무엇인가'),
      sortOrder: 2,
    });

    scrumMeetingQuestions.push({
      question: t('현재 장애가 되고 있는 것(곤란하고 어려운 것)이 무엇인가'),
      sortOrder: 3,
    });

    const startTime = new Date();
    startTime.setHours(10);
    startTime.setMinutes(30);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    const endTime = new Date();
    endTime.setHours(11);
    endTime.setMinutes(30);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);

    scrumMeetingPlans.push({
      CRUD: 'C',
      name: '데일리 스크럼',
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      days: '1111100',
      onHoliday: true,
      useQuestion: true,
      scrumMeetingQuestions,
    });

    next.scrumMeetingPlans = scrumMeetingPlans;
    setSprint(next);
  };

  const removeSprintDailySmallTalkMeeting = (inx) => {
    const next = { ...sprint };
    const nextSprintDailySmallTalkMeetings = next.smallTalkMeetingPlans.slice(0);

    if (nextSprintDailySmallTalkMeetings[inx].CRUD === 'C') {
      nextSprintDailySmallTalkMeetings.splice(inx, 1);
      next.smallTalkMeetingPlans = nextSprintDailySmallTalkMeetings;
    } else {
      nextSprintDailySmallTalkMeetings[inx].CRUD = 'D';
      next.smallTalkMeetingPlans = nextSprintDailySmallTalkMeetings;
    }

    setSprint(next);
  };

  const changeSprintDailySmallTalkMeeting = (inx, key, value) => {
    const next = { ...sprint };
    const nextSprintDailySmallTalkMeetings = next.smallTalkMeetingPlans.slice(0);
    nextSprintDailySmallTalkMeetings[inx] = { ...nextSprintDailySmallTalkMeetings[inx], [key]: value };

    if (key === 'startTime' && nextSprintDailySmallTalkMeetings[inx].startTime >= nextSprintDailySmallTalkMeetings[inx].endTime) {
      nextSprintDailySmallTalkMeetings[inx].endTime = nextSprintDailySmallTalkMeetings[inx].startTime + 1000 * 60 * 30;
    }

    if (key === 'endTime' && nextSprintDailySmallTalkMeetings[inx].startTime >= nextSprintDailySmallTalkMeetings[inx].endTime) {
      nextSprintDailySmallTalkMeetings[inx].startTime = nextSprintDailySmallTalkMeetings[inx].endTime - 1000 * 60 * 30;
    }

    if (nextSprintDailySmallTalkMeetings[inx].CRUD === 'R') {
      nextSprintDailySmallTalkMeetings[inx].CRUD = 'U';
    }
    next.smallTalkMeetingPlans = nextSprintDailySmallTalkMeetings;
    setSprint(next);
  };

  const changeSprintDailySmallTalkMeetingDays = (inx, daysIndex, value) => {
    const next = { ...sprint };
    const nextSprintDailySmallTalkMeetings = next.smallTalkMeetingPlans.slice(0);
    const nextSprintDailySmallTalkMeeting = nextSprintDailySmallTalkMeetings[inx];
    const list = nextSprintDailySmallTalkMeeting.days.split('');
    list[daysIndex] = value;
    nextSprintDailySmallTalkMeeting.days = list.join('');

    if (nextSprintDailySmallTalkMeeting.CRUD === 'R') {
      nextSprintDailySmallTalkMeeting.CRUD = 'U';
    }

    next.smallTalkMeetingPlans = nextSprintDailySmallTalkMeetings;
    setSprint(next);
  };

  const addSprintDailySmallTalkMeeting = () => {
    const next = { ...sprint };
    const smallTalkMeetingPlans = next.smallTalkMeetingPlans.slice(0);

    const startTime = new Date();
    startTime.setHours(13);
    startTime.setMinutes(30);
    startTime.setSeconds(0);
    startTime.setMilliseconds(0);

    const endTime = new Date();
    endTime.setHours(14);
    endTime.setMinutes(0);
    endTime.setSeconds(0);
    endTime.setMilliseconds(0);

    smallTalkMeetingPlans.push({
      CRUD: 'C',
      name: '스몰톡 미팅',
      startTime: startTime.getTime(),
      endTime: endTime.getTime(),
      days: '1111100',
      onHoliday: false,
      limitUserCount: 5,
    });

    next.smallTalkMeetingPlans = smallTalkMeetingPlans;
    setSprint(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const next = JSON.parse(JSON.stringify(sprint));
    next.startDate = new Date(next.startDate).toISOString();
    next.endDate = new Date(next.endDate).toISOString();
    next.scrumMeetingPlans.forEach((scrumMeetingPlan) => {
      const startTime = new Date(scrumMeetingPlan.startTime);
      startTime.setHours(startTime.getHours());
      startTime.setMinutes(startTime.getMinutes());

      const endTime = new Date(scrumMeetingPlan.endTime);
      endTime.setHours(endTime.getHours());
      endTime.setMinutes(endTime.getMinutes());

      // scrumMeetingPlan.startTime = `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}:00`;
      // scrumMeetingPlan.endTime = `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}:00`;

      scrumMeetingPlan.startTime = startTime.toISOString();
      scrumMeetingPlan.endTime = endTime.toISOString();

      scrumMeetingPlan.scrumMeetingQuestions.forEach((scrumMeetingPlanQuestion, inx) => {
        scrumMeetingPlanQuestion.sortOrder = inx + 1;
      });
    });

    next.smallTalkMeetingPlans.forEach((smallTalkMeetingPlan) => {
      const startTime = new Date(smallTalkMeetingPlan.startTime);
      startTime.setHours(startTime.getHours());
      startTime.setMinutes(startTime.getMinutes());

      const endTime = new Date(smallTalkMeetingPlan.endTime);
      endTime.setHours(endTime.getHours());
      endTime.setMinutes(endTime.getMinutes());

      // smallTalkMeetingPlan.startTime = `${`0${startTime.getHours()}`.slice(-2)}:${`0${startTime.getMinutes()}`.slice(-2)}:00`;
      // smallTalkMeetingPlan.endTime = `${`0${endTime.getHours()}`.slice(-2)}:${`0${endTime.getMinutes()}`.slice(-2)}:00`;

      smallTalkMeetingPlan.startTime = startTime.toISOString();
      smallTalkMeetingPlan.endTime = endTime.toISOString();
    });

    if (type === 'edit') {
      request.put(
        `/api/sprints/${next.id}`,
        {
          ...next,
          startDate: new Date(next.startDate),
          endDate: new Date(next.endDate),
          users: next.users.filter((u) => u.CRUD !== 'D'),
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
        { ...next, startDate: new Date(next.startDate), endDate: new Date(next.endDate) },
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

  const onDelete = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('데이터 삭제 경고'), t('스프린트를 삭제하시겠습니까?'), () => {
      request.del(
        `/api/sprints/${id}`,
        null,
        () => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('삭제되었습니다.'), () => {
            history.push('/sprints');
          });
        },
        null,
        t('스프린트와 관련된 모든 데이터를 정리중입니다.'),
      );
    });
  };

  const onOpen = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('스프린트 다시 열기'), t('스프린트를 오픈하시겠습니까?'), () => {
      request.put(
        `/api/sprints/${id}/open`,
        null,
        () => {
          history.push('/sprints');
        },
        null,
        t('스프린트를 다시 활성화하고 있습니다.'),
      );
    });
  };

  const onClose = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('스프린트 종료'), t('스프린트를 종료하시겠습니까?'), () => {
      request.put(
        `/api/sprints/${id}/close`,
        null,
        () => {
          history.push('/sprints');
        },
        null,
        t('스프린트를 종료하고 있습니다.'),
      );
    });
  };

  const getOpenCloseHandler = () => {
    if (sprint?.isAdmin) {
      return sprint.closed ? onOpen : onClose;
    }

    return null;
  };

  return (
    <Page className="edit-sprint-wrapper">
      <PageTitle
        breadcrumbs={
          type === 'new'
            ? [
                {
                  link: '/',
                  name: t('TOP'),
                },
                {
                  link: '/sprints',
                  name: t('스프린트 목록'),
                },
                {
                  link: '/sprints/new',
                  name: t('새 스프린트'),
                  current: true,
                },
              ]
            : [
                {
                  link: '/',
                  name: t('TOP'),
                },
                {
                  link: '/sprints',
                  name: t('스프린트 목록'),
                },
                {
                  link: `/sprints/${sprint?.id}`,
                  name: sprint?.name,
                },
                {
                  link: `/sprints/${sprint?.id}/edit`,
                  name: t('변경'),
                  current: true,
                },
              ]
        }
      >
        {type === 'edit' ? t('스프린트 변경') : t('새로운 스프린트')}
      </PageTitle>
      <PageContent info>
        {projects && projects.length < 1 && (
          <EmptyContent
            height="100%"
            message={t('스프린트를 만들기 위해서는 프로젝트가 필요합니다.')}
            additionalContent={
              <div className="mt-3">
                <Button
                  size="md"
                  color="point"
                  onClick={() => {
                    history.push('/projects/new');
                  }}
                >
                  <i className="fas fa-plus" /> {t('새 프로젝트')}
                </Button>
              </div>
            }
          />
        )}
        {projects && projects.length > 0 && (
          <Form className="new-sprint-content" onSubmit={onSubmit}>
            <Block className="pt-0">
              <BlockTitle>{t('스프린트 정보')}</BlockTitle>
              <BlockRow>
                <Label minWidth={labelMinWidth} required>
                  {t('프로젝트')}
                </Label>
                {projects && (
                  <Selector
                    outline
                    size="md"
                    items={projects
                      .filter((d) => d.activated)
                      .map((project) => {
                        return {
                          key: project.id,
                          value: project.name,
                        };
                      })}
                    value={sprint.projectId}
                    onChange={(val) => {
                      changeInfo('projectId', val);
                    }}
                    minWidth="220px"
                  />
                )}
              </BlockRow>
              <BlockRow>
                <Label minWidth={labelMinWidth} required>
                  {t('이름')}
                </Label>
                <Input type="text" size="md" value={sprint.name} onChange={(val) => changeInfo('name', val)} outline simple required minLength={1} />
              </BlockRow>
              <BlockRow>
                <Label minWidth={labelMinWidth} required>
                  {t('기간')}
                </Label>
                <DateRange country={user.country} language={user.language} startDate={sprint.startDate} endDate={sprint.endDate} onChange={changeInfo} />
              </BlockRow>
            </Block>
            <Block className="pb-0">
              <BlockTitle>{t('데일리 스크럼 미팅')}</BlockTitle>
              <BlockRow>
                <Label minWidth={labelMinWidth}>{t('데일리 스크럼 미팅')}</Label>
                <CheckBox
                  size="md"
                  type="checkbox"
                  value={sprint.doDailyScrumMeeting}
                  onChange={(val) => changeInfo('doDailyScrumMeeting', val)}
                  label={t('스프린트 기간 데일리 스크럼 미팅을 진행합니다.')}
                />
              </BlockRow>
            </Block>
            {sprint.doDailyScrumMeeting && (
              <Block className="sprint-daily-meetings">
                {sprint.scrumMeetingPlans.map((scrumMeetingPlan, inx) => {
                  return (
                    <DailyScrumMeeting
                      className={scrumMeetingPlan.CRUD === 'D' ? 'd-none' : ''}
                      key={inx}
                      edit
                      no={inx + 1}
                      scrumMeetingPlan={scrumMeetingPlan}
                      onRemove={() => {
                        removeSprintDailyMeeting(inx);
                      }}
                      onChangeInfo={(key, value) => {
                        changeSprintDailyMeeting(inx, key, value);
                      }}
                      onChangeMeetingDays={(dayIndex) => {
                        changeSprintDailyMeetingDays(inx, dayIndex, scrumMeetingPlan.days[dayIndex] === '1' ? '0' : '1');
                      }}
                      onChangeQuestionOrder={(dayIndex, dir) => {
                        changeOrderSprintDailyMeetingQuestions(dir, inx, dayIndex);
                      }}
                      onChangeQuestion={(questionIndex, key, value) => {
                        changeSprintDailyMeetingQuestions(inx, questionIndex, key, value);
                      }}
                      user={user}
                    />
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
            <Block className="pb-0">
              <BlockTitle>{t('데일리 스몰톡 미팅')}</BlockTitle>
              <BlockRow>
                <Label minWidth={labelMinWidth}>{t('데일리 스몰톡 미팅')}</Label>
                <CheckBox
                  size="md"
                  type="checkbox"
                  value={sprint.doDailySmallTalkMeeting}
                  onChange={(val) => changeInfo('doDailySmallTalkMeeting', val)}
                  label={t('스프린트 기간 스몰톡 미팅을 진행합니다.')}
                />
              </BlockRow>
            </Block>
            {sprint.doDailySmallTalkMeeting && (
              <Block className="sprint-daily-meetings">
                {sprint.smallTalkMeetingPlans.map((smallTalkMeetingPlan, inx) => {
                  return (
                    <DailySmallTalkMeeting
                      className={smallTalkMeetingPlan.CRUD === 'D' ? 'd-none' : ''}
                      key={inx}
                      edit
                      no={inx + 1}
                      smallTalkMeetingPlan={smallTalkMeetingPlan}
                      onRemove={() => {
                        removeSprintDailySmallTalkMeeting(inx);
                      }}
                      onChangeInfo={(key, value) => {
                        changeSprintDailySmallTalkMeeting(inx, key, value);
                      }}
                      onChangeMeetingDays={(dayIndex) => {
                        changeSprintDailySmallTalkMeetingDays(inx, dayIndex, smallTalkMeetingPlan.days[dayIndex] === '1' ? '0' : '1');
                      }}
                      user={user}
                    />
                  );
                })}
                <BlockRow>
                  <div className="flex-grow-1 text-center">
                    <Button size="sm" color="white" outline onClick={addSprintDailySmallTalkMeeting}>
                      미팅 추가
                    </Button>
                  </div>
                </BlockRow>
              </Block>
            )}
            <Block className="d-none">
              <BlockTitle>{t('지라 연동')}</BlockTitle>
              <BlockRow>
                <Label minWidth={labelMinWidth}>{t('지라 연동')}</Label>
                <CheckBox
                  size="md"
                  type="checkbox"
                  value={sprint.isJiraSprint}
                  onChange={(val) => changeInfo('isJiraSprint', val)}
                  label={t('이 스프린트를 지라 스프린트와 연결합니다.')}
                />
              </BlockRow>
              {sprint.isJiraSprint && (
                <>
                  <BlockRow expand>
                    <Label minWidth={labelMinWidth}>{t('지라 스트린트 URL')}</Label>
                    <Input
                      type="text"
                      size="md"
                      value={sprint.jiraSprintUrl}
                      onChange={(val) => changeInfo('jiraSprintUrl', val)}
                      outline
                      simple
                      display="block"
                      disabled={!sprint.isJiraSprint}
                    />
                  </BlockRow>
                  <BlockRow expand>
                    <Label minWidth={labelMinWidth}>{t('지라 인증 키')}</Label>
                    <Input
                      type="text"
                      size="md"
                      value={sprint.jiraAuthKey}
                      onChange={(val) => changeInfo('jiraAuthKey', val)}
                      outline
                      simple
                      display="block"
                      disabled={!sprint.isJiraSprint}
                    />
                  </BlockRow>
                </>
              )}
            </Block>
            <Block>
              <BlockTitle>{t('참여 설정')}</BlockTitle>
              <BlockRow>
                <Label minWidth={labelMinWidth}>{t('자동 승인')}</Label>
                <RadioButton
                  disabled
                  size="sm"
                  items={JOIN_POLICIES}
                  value={sprint.allowAutoJoin}
                  onClick={(val) => {
                    changeInfo('allowAutoJoin', val);
                  }}
                />
              </BlockRow>
            </Block>
            <Block className="g-last-block">
              <BlockTitle>{t('멤버')}</BlockTitle>
              <UserList
                users={sprint.users}
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
              onDelete={sprint?.isAdmin ? onDelete : null}
              onDeleteText="삭제"
              onSubmit
              onSubmitIcon={<i className="fas fa-plane" />}
              onSubmitText={t('저장')}
              onCancelIcon=""
              onClose={getOpenCloseHandler()}
              onCloseText={sprint.closed ? '스프린트 열기' : '스프린트 닫기'}
            />
          </Form>
        )}
      </PageContent>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(withLogin, connect(mapStateToProps, undefined), withRouter, withTranslation())(EditSprint);

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
  location: LocationPropTypes,
};
