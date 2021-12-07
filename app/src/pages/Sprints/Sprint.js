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
  DateRangeText,
  Label,
  Page,
  PageContent,
  PageTitle,
  Text,
  UserCard,
  UserList,
} from '@/components';
import dialog from '@/utils/dialog';
import { ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';

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
    startDate: '',
    endDate: '',
    isJiraSprint: false,
    jiraSprintUrl: '',
    jiraAuthKey: '',
    allowSearch: true,
    allowAutoJoin: true,
    users: [],
  });

  useEffect(() => {
    request.get(`/api/sprints/${id}`, null, (data) => {
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
    <Page className="sprint-wrapper">
      <PageTitle>스프린트 정보</PageTitle>
      <PageContent>
        <Block>
          <BlockTitle>스프린트 정보</BlockTitle>
          <BlockRow>
            <Label minWidth="130px">이름</Label>
            <Text>{info.name}</Text>
          </BlockRow>
          <BlockRow>
            <Label minWidth="130px">기간</Label>
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
          </BlockRow>
        </Block>
        <Block>
          <BlockTitle>멤버</BlockTitle>
          <UserList users={info.users} />
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
        </Block>
        <Block>
          <BlockTitle>{t('지라 연동')}</BlockTitle>
          <BlockRow>
            <Label minWidth="130px">지라 연동</Label>
            <Text>{info.isJiraSprint ? 'Y' : 'N'}</Text>
          </BlockRow>
          {info.isJiraSprint && (
            <>
              <BlockRow>
                <Label minWidth="130px">지라 스트린트 URL</Label>
                <Text>{info.jiraSprintUrl}</Text>
              </BlockRow>
              <BlockRow>
                <Label minWidth="130px">지라 인증 키</Label>
                <Text>{info.jiraAuthKey}</Text>
              </BlockRow>
            </>
          )}
        </Block>
        <Block>
          <BlockTitle>{t('검색 및 참여 설정')}</BlockTitle>
          <BlockRow>
            <Label minWidth="130px">검색 허용</Label>
            <Text>{(ALLOW_SEARCHES.find((d) => d.key === info.allowSearch) || {}).value}</Text>
          </BlockRow>
          <BlockRow>
            <Label minWidth="130px">자동 승인</Label>
            <Text>{(JOIN_POLICIES.find((d) => d.key === info.allowAutoJoin) || {}).value}</Text>
          </BlockRow>
        </Block>

        <BottomButtons
          onList={() => {
            history.push('/sprints');
          }}
          onDelete={onDelete}
        />
      </PageContent>
    </Page>
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
