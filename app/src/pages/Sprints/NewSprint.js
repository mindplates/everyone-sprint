import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BottomButtons, CheckBox, DateRange, Form, Input, PageTitle, BlockTitle, UserCard } from '@/components';
import dialog from '@/utils/dialog';
import { ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import auth from '@/utils/auth';
import './NewSprint.scss';

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

const NewSprint = ({ t, history, user }) => {
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
    auth.checkUserLogin(history);
  }, []);

  useEffect(() => {
    const users = info.users.splice(0);
    if (user && user.id) {
      users.push({
        id: user.id,
        email: user.email,
        alias: user.alias,
        name: user.name,
        imageType: user.imageType,
        imageData: user.imageData,
        role: 'ADMIN',
      });

      setInfo({
        ...info,
        users,
      });
    }
  }, [user]);

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    request.post(
      '/api/sprints',
      { ...info, startDate: new Date(info.startDate), endDate: new Date(info.endDate) },
      (data) => {
        dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '정상적으로 등록되었습니다.', () => {
          history.push(`/sprints/${data.id}`);
        });
      },
    );
  };

  return (
    <div className="new-sprint-wrapper g-content">
      <PageTitle>새로운 스프린트</PageTitle>
      <Form className="new-sprint-content g-page-content" onSubmit={onSubmit}>
        <div className="new-sprint-info">
          <div className="general-info">
            <BlockTitle>스프린트 정보</BlockTitle>
            <div className="row-input">
              <div>
                <span>
                  이름
                  <span className="required">
                    <i className="fas fa-star" />
                  </span>
                </span>
              </div>
              <div>
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
              </div>
            </div>
            <div className="row-input">
              <div>
                <span>
                  기간
                  <span className="required">
                    <i className="fas fa-star" />
                  </span>
                </span>
              </div>
              <div className="date-range">
                <DateRange
                  country={user.country}
                  startDate={info.startDate}
                  endDate={info.endDate}
                  onChange={(key, value) => {
                    const v = {};
                    v[key] = value;
                    setInfo({ ...info, ...v });
                  }}
                />
              </div>
            </div>
          </div>
          <div className="general-info">
            <BlockTitle>멤버</BlockTitle>
            {info.users.length < 1 && (
              <div className="sprint-user-list">
                <div>등록된 멤버가 없습니다.</div>
              </div>
            )}
            {info.users.length > 0 && (
              <div className="sprint-user-list">
                {info.users.map((u) => {
                  return (
                    <div key={u.id} className="user-card">
                      <UserCard user={u} editable={user.id !== u.id} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          <div className="general-info">
            <BlockTitle>지라 연동</BlockTitle>
            <div className="row-input">
              <div>
                <span>지라 연동</span>
              </div>
              <div className="g-line-height-0 check-box">
                <CheckBox
                  size="md"
                  type="checkbox"
                  value={info.isJiraSprint}
                  onChange={(val) => changeInfo('isJiraSprint', val)}
                  label={t('이 스프린트를 지라 스프린트와 연결합니다.')}
                />
              </div>
            </div>
            <div className="row-input">
              <div>
                <span>지라 스트린트 URL</span>
              </div>
              <div className="jira-sprint-url">
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
              </div>
            </div>
            <div className="row-input">
              <div>
                <span>지라 인증 키</span>
              </div>
              <div className="jira-auth-key">
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
              </div>
            </div>
          </div>
          <div className="general-info">
            <BlockTitle>검색 및 참여 설정</BlockTitle>
            <div className="row-input">
              <div>
                <span>검색 허용</span>
              </div>
              <div>
                <RadioButton
                  size="sm"
                  items={ALLOW_SEARCHES}
                  value={info.allowSearch}
                  onClick={(val) => {
                    changeInfo('allowSearch', val);
                  }}
                />
              </div>
            </div>
            <div className="row-input">
              <div>
                <span>자동 승인</span>
              </div>
              <div className="g-line-height-0">
                <RadioButton
                  size="sm"
                  items={JOIN_POLICIES}
                  value={info.allowAutoJoin}
                  onClick={(val) => {
                    changeInfo('allowAutoJoin', val);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <BottomButtons
          onList={() => {
            history.push('/sprints');
          }}
          onSubmit
          onSubmitIcon={<i className="fas fa-plane" />}
          onSubmitText="스프린트 등록"
        />
      </Form>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(NewSprint)));

NewSprint.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
};
