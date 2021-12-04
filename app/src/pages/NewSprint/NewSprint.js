import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { registerLocale } from 'react-datepicker';
import ko from 'date-fns/locale/ko';
import en from 'date-fns/locale/en-US';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, CheckBox, DateRange, Form, Input, PageTitle, SubTitle, UserCard } from '@/components';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import './NewSprint.scss';

registerLocale('ko', ko);
registerLocale('en', en);

const NewSprint = ({ t, history, user }) => {
  const [info, setInfo] = useState({
    name: '',
    startDate: Date.now(),
    endDate: Date.now() + 1000 * 60 * 60 * 24 * 14,
    isJiraSpring: false,
    jiraSprintUrl: '',
    jiraAuthKey: '',
    allowSearch: true,
    users: [],
  });

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

    if (info.password !== info.password2) {
      dialog.setMessage(MESSAGE_CATEGORY.INFO, t('validation.badInput'), t('validation.notEqualPassword'));
      return;
    }

    request.post('/api/users', info, (data) => {
      console.log(data);

      dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '정상적으로 등록되었습니다.', () => {
        history.push('/');
      });
    });
  };

  return (
    <div className="new-sprint-wrapper g-content">
      <PageTitle>새로운 스프린트</PageTitle>
      <Form className="new-sprint-content g-page-content" onSubmit={onSubmit}>
        <div className="new-sprint-info">
          <div className="general-info">
            <SubTitle>스프린트 정보</SubTitle>
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
                  language={user.language}
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
            <SubTitle>멤버</SubTitle>
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
            <SubTitle>지라 연동</SubTitle>
            <div className="row-input">
              <div>
                <span>지라 연동</span>
              </div>
              <div className="g-line-height-0 check-box">
                <CheckBox
                  size="md"
                  type="checkbox"
                  value={info.isJiraSpring}
                  onChange={(val) => changeInfo('isJiraSpring', val)}
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
                  disabled={!info.isJiraSpring}
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
                  disabled={!info.isJiraSpring}
                />
              </div>
            </div>
          </div>
          <div className="general-info">
            <SubTitle>검색 및 참여 설정</SubTitle>
            <div className="row-input">
              <div>
                <span>검색 허용</span>
              </div>
              <div>
                <RadioButton
                  size="sm"
                  items={[
                    { key: true, value: '검색 허용' },
                    { key: false, value: '초대 혹은 링크만 허용' },
                  ]}
                  value={info.allowSearch}
                  onClick={(val) => {
                    changeInfo('allowSearch', val);
                  }}
                />
              </div>
            </div>
            <div className="row-input">
              <div>
                <span>참여 승인</span>
              </div>
              <div className="g-line-height-0">
                <RadioButton
                  size="sm"
                  items={[
                    { key: true, value: '누구나 참여' },
                    { key: false, value: '승인 후 참여' },
                  ]}
                  value={info.allowSearch}
                  onClick={(val) => {
                    changeInfo('allowSearch', val);
                  }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="submit-buttons">
          <Button size="md" color="white" outline>
            <i className="fas fa-angle-left" /> 취소
          </Button>
          <Button type="submit" size="md" color="primary">
            <i className="fas fa-plane" /> 스프린트 등록
          </Button>
        </div>
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
