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
  UserList,
} from '@/components';
import dialog from '@/utils/dialog';
import { ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';

const labelMinWidth = '140px';

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
    request.get(
      `/api/sprints/${id}`,
      null,
      (data) => {
        setInfo(data);
      },
      null,
      '스프린트 정보를 가져오고 있습니다',
    );
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
    <Page>
      <PageTitle>스프린트 정보</PageTitle>
      <PageContent>
        <Block>
          <BlockTitle>스프린트 정보</BlockTitle>
          <BlockRow>
            <Label minWidth={labelMinWidth}>이름</Label>
            <Text>{info.name}</Text>
          </BlockRow>
          <BlockRow>
            <Label minWidth={labelMinWidth}>기간</Label>
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
        </Block>
        <Block>
          <BlockTitle>{t('지라 연동')}</BlockTitle>
          <BlockRow>
            <Label minWidth={labelMinWidth}>지라 연동</Label>
            <Text>{info.isJiraSprint ? 'Y' : 'N'}</Text>
          </BlockRow>
          {info.isJiraSprint && (
            <>
              <BlockRow>
                <Label minWidth={labelMinWidth}>지라 스트린트 URL</Label>
                <Text>{info.jiraSprintUrl}</Text>
              </BlockRow>
              <BlockRow>
                <Label minWidth={labelMinWidth}>지라 인증 키</Label>
                <Text>{info.jiraAuthKey}</Text>
              </BlockRow>
            </>
          )}
        </Block>
        <Block>
          <BlockTitle>{t('검색 및 참여 설정')}</BlockTitle>
          <BlockRow>
            <Label minWidth={labelMinWidth}>검색 허용</Label>
            <Text>{(ALLOW_SEARCHES.find((d) => d.key === info.allowSearch) || {}).value}</Text>
          </BlockRow>
          <BlockRow>
            <Label minWidth={labelMinWidth}>자동 승인</Label>
            <Text>{(JOIN_POLICIES.find((d) => d.key === info.allowAutoJoin) || {}).value}</Text>
          </BlockRow>
        </Block>
        <BottomButtons
          onList={() => {
            history.push('/sprints');
          }}
          onEdit={() => {
            history.push(`/sprints/${id}/edit`);
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
