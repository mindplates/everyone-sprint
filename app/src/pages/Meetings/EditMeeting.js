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
  Form,
  Input,
  Label,
  Page,
  PageContent,
  PageTitle,
  Selector,
  UserList,
} from '@/components';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import dateUtil from '@/utils/dateUtil';
import './EditMeeting.scss';

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

const EditSprint = ({
  t,
  type,
  history,
  user,
  match: {
    params: { id },
  },
}) => {
  const [sprints, setSprints] = useState([]);
  const [info, setInfo] = useState({
    sprintId: null,
    name: '',
    startDate: start.getTime(),
    endDate: end.getTime(),
    users: [],
  });

  const getSprints = () => {
    request.get(
      '/api/sprints',
      null,
      (list) => {
        const current = list.find((sprint) => sprint.id === id);
        if (id && current) {
          setInfo({
            ...info,
            sprintId: current.id,
          });
        } else if (list.length > 0) {
          setInfo({
            ...info,
            sprintId: list[0].id,
          });
        }

        setSprints(list);
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

        setInfo({
          ...info,
          users,
        });
      },
      null,
      t('스프린트가 변경되어 참여자를 변경 중입니다.'),
    );
  };

  useEffect(() => {
    getSprints();
  }, []);

  useEffect(() => {
    if (info.sprintId) {
      getSprint(info.sprintId);
    }
  }, [info.sprintId]);

  useEffect(() => {
    if (id && type === 'edit')
      request.get(
        `/api/sprints/${id}`,
        null,
        (data) => {
          setInfo({
            ...data,
            startDate: dateUtil.getDateValue(data.startDate),
            endDate: dateUtil.getDateValue(data.endDate),
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

  const changeUsers = (users) => {
    const next = { ...info };
    next.users = users;
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
        '/api/meetings',
        { ...info, startDate: new Date(info.startDate), endDate: new Date(info.endDate) },
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('정상적으로 등록되었습니다.'), () => {
            history.push(`/meetings/${data.id}`);
          });
        },
        null,
        t('새로운 미팅을 만들고 있습니다.'),
      );
    }
  };

  const nowHours = new Date().getHours();

  console.log(sprints);

  return (
    <Page className="edit-meeting-wrapper">
      <PageTitle>{type === 'edit' ? t('미팅 정보 변경') : t('새로운 미팅')}</PageTitle>
      <PageContent>
        <Form onSubmit={onSubmit}>
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
              <Input
                type="name"
                size="md"
                value={info.name}
                onChange={(val) => changeInfo('name', val)}
                outline
                simple
                required
                minLength={1}
              />
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
                    <Button size="sm" color="white" outline>
                      지금
                    </Button>
                    <Button size="sm" color="white" outline>
                      다음 시간
                    </Button>
                  </div>
                  <div>
                    <span className="day-label">오늘</span>
                    {quickTimes
                      .filter((d) => d > nowHours)
                      .map((d) => {
                        return (
                          <Button size="sm" color="white" outline>
                            {d}시
                          </Button>
                        );
                      })}
                  </div>
                  <div className="next-day">
                    <span className="day-label">내일</span>
                    {quickTimes.map((d) => {
                      return (
                        <Button size="sm" color="white" outline>
                          {d}시
                        </Button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </BlockRow>
          </Block>
          <Block>
            <BlockTitle className="mb-2 mb-sm-3">{t('참여자')}</BlockTitle>
            <UserList
              users={info.users}
              onChange={(val) => changeInfo('users', val)}
              onChangeUsers={changeUsers}
              editable={{
                role: false,
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
