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
  const [sprint, setSprint] = useState(null);

  useEffect(() => {
    request.get(
      `/api/sprints/${id}`,
      null,
      (data) => {
        setSprint(data);
      },
      null,
      t('스프린트 정보를 가져오고 있습니다.'),
    );
  }, [id]);

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

  return (
    <Page>
      <PageTitle>{t('스프린트 정보')}</PageTitle>
      {sprint && (
        <PageContent>
          <Block className="pt-0">
            <BlockTitle>{t('스프린트 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('이름')}</Label>
              <Text>{sprint.name}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('기간')}</Label>
              <DateRangeText
                country={user.country}
                startDate={sprint.startDate}
                endDate={sprint.endDate}
                onChange={(key, value) => {
                  const v = {};
                  v[key] = value;
                  setSprint({ ...sprint, ...v });
                }}
              />
            </BlockRow>
          </Block>
          <Block>
            <BlockTitle className="mb-2 mb-sm-3">{t('멤버')}</BlockTitle>
            <UserList users={sprint.users} />
          </Block>
          <Block>
            <BlockTitle>{t('지라 연동')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('지라 연동')}</Label>
              <Text>{sprint.isJiraSprint ? 'Y' : 'N'}</Text>
            </BlockRow>
            {sprint.isJiraSprint && (
              <>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('지라 스트린트 URL')}</Label>
                  <Text>{sprint.jiraSprintUrl}</Text>
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth}>{t('지라 인증 키')}</Label>
                  <Text>{sprint.jiraAuthKey}</Text>
                </BlockRow>
              </>
            )}
          </Block>
          <Block>
            <BlockTitle>{t('검색 및 참여 설정')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('검색 허용')}</Label>
              <Text>{(ALLOW_SEARCHES.find((d) => d.key === sprint.allowSearch) || {}).value}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('자동 승인')}</Label>
              <Text>{(JOIN_POLICIES.find((d) => d.key === sprint.allowAutoJoin) || {}).value}</Text>
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
            onDeleteText="스프린트 삭제"
          />
        </PageContent>
      )}
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
