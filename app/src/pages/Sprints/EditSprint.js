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
    users: [],
  });

  useEffect(() => {
    if (id && type === 'edit')
      request.get(`/api/sprints/${id}`, null, (data) => {
        console.log(data);
        setInfo({
          ...data,
          startDate: dateUtil.getDateValue(data.startDate),
          endDate: dateUtil.getDateValue(data.endDate),
        });
      });
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
        '/api/sprints',
        { ...info, startDate: new Date(info.startDate), endDate: new Date(info.endDate) },
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '정상적으로 등록되었습니다.', () => {
            history.push(`/sprints/${data.id}`);
          });
        },
      );
    } else {
      request.post(
        '/api/sprints',
        { ...info, startDate: new Date(info.startDate), endDate: new Date(info.endDate) },
        (data) => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '정상적으로 등록되었습니다.', () => {
            history.push(`/sprints/${data.id}`);
          });
        },
      );
    }
  };

  return (
    <Page className="sprint-wrapper">
      <PageTitle>{type === 'edit' ? '스프린트 변경' : '새로운 스프린트'}</PageTitle>
      <PageContent>
        <Form className="new-sprint-content" onSubmit={onSubmit}>
          <Block>
            <BlockTitle>스프린트 정보</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth} required>
                이름
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
                기간
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
          <Block>
            <BlockTitle>멤버</BlockTitle>
            <UserList users={info.users} onChange={(val) => changeInfo('users', val)} onChangeUsers={changeUsers} editable />
          </Block>
          <Block>
            <BlockTitle>{t('지라 연동')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>지라 연동</Label>
              <CheckBox
                size="md"
                type="checkbox"
                value={info.isJiraSprint}
                onChange={(val) => changeInfo('isJiraSprint', val)}
                label={t('이 스프린트를 지라 스프린트와 연결합니다.')}
              />
            </BlockRow>
            <BlockRow expand>
              <Label minWidth={labelMinWidth}>지라 스트린트 URL</Label>
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
              <Label minWidth={labelMinWidth}>지라 인증 키</Label>
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
          </Block>
          <Block className="mb-2">
            <BlockTitle>{t('검색 및 참여 설정')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>검색 허용</Label>
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
              <Label minWidth={labelMinWidth}>자동 승인</Label>
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
          <BottomButtons
            onList={() => {
              history.push('/sprints');
            }}
            onSubmit
            onSubmitIcon={<i className="fas fa-plane" />}
            onSubmitText={type === 'edit' ? '스프린트 변경' : '스프린트 등록'}
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
