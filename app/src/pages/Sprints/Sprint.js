import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BottomButtons, DateRangeText, PageTitle, SubTitle, Text, UserCard } from '@/components';
import dialog from '@/utils/dialog';
import { ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import './Sprint.scss';

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

const Sprint = ({
  t,
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
    request.get(`/api/sprints/${id}`, null, (data) => {
      console.log(data);
      setInfo(data);
    });
  }, [id]);

  const onDelete = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, '데이터 삭제 경고', '스프린트를 삭제하시겠습니까?', () => {
      request.del(`/api/sprints/${id}`, null, () => {
        dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '삭제되었습니다.', () => {
          history.push('/sprints');
        });
      });
    });
  };

  return (
    <div className="sprint-wrapper g-content">
      <PageTitle>스프린트 정보</PageTitle>
      <div className="sprint-content g-page-content">
        <div className="sprint-info">
          <div className="general-info">
            <SubTitle>스프린트 정보</SubTitle>
            <div className="row-input">
              <div>
                <span>이름</span>
              </div>
              <div>
                <Text>{info.name}</Text>
              </div>
            </div>
            <div className="row-input">
              <div>
                <span>기간</span>
              </div>
              <div className="date-range">
                <DateRangeText
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
                      <UserCard user={u} editable={false} />
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
                <span>{t('지라 연동')}</span>
              </div>
              <div className="g-line-height-0 check-box">
                <Text>{info.isJiraSprint ? 'Y' : 'N'}</Text>
              </div>
            </div>
            {info.isJiraSprint && (
              <>
                <div className="row-input">
                  <div>
                    <span>지라 스트린트 URL</span>
                  </div>
                  <div className="jira-sprint-url">
                    <Text>{info.jiraSprintUrl}</Text>
                  </div>
                </div>
                <div className="row-input">
                  <div>
                    <span>지라 인증 키</span>
                  </div>
                  <div className="jira-auth-key">
                    <Text>{info.jiraAuthKey}</Text>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="general-info">
            <SubTitle>검색 및 참여 설정</SubTitle>
            <div className="row-input">
              <div>
                <span>검색 허용</span>
              </div>
              <div>
                <Text>{(ALLOW_SEARCHES.find((d) => d.key === info.allowSearch) || {}).value}</Text>
              </div>
            </div>
            <div className="row-input">
              <div>
                <span>자동 승인</span>
              </div>
              <div className="g-line-height-0">
                <Text>{(JOIN_POLICIES.find((d) => d.key === info.allowAutoJoin) || {}).value}</Text>
              </div>
            </div>
          </div>
        </div>
        <BottomButtons
          onList={() => {
            history.push('/sprints');
          }}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(Sprint)));

Sprint.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
