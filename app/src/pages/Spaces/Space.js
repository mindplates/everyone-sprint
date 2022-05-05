import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import copy from 'copy-to-clipboard';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  Button,
  Label,
  Liner,
  Page,
  PageContent,
  PageTitle,
  Text,
  UserApplicants,
  UserList,
  withLogin,
} from '@/components';
import { ACTIVATES, ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes } from '@/proptypes';
import dialog from '@/utils/dialog';
import dateUtil from '@/utils/dateUtil';
import commonUtil from '@/utils/commonUtil';
import SpaceApplicantStatus from '@/pages/Spaces/SpaceApplicantStatus';
import { setSpaceInfo, setUserInfo } from '@/store/actions';

const Space = ({
  t,
  history,
  match: {
    params: { spaceCode },
  },
  setSpaceInfo: setSpaceInfoReducer,
  setUserInfo: setUserInfoReducer,
}) => {
  const [copyText, setCopyText] = useState(t('URL 복사'));
  const [space, setSpace] = useState(null);
  const [allowed, setAllowed] = useState(null);

  const getSpace = () => {
    request.get(
      `/api/spaces/${spaceCode}`,
      null,
      (data) => {
        setAllowed(true);
        setSpace(data);
      },
      (error, response) => {
        setAllowed(false);
        if (response && (response.status === 423 || response.status === 404)) {
          return true;
        }

        return false;
      },
      t('스페이스 정보를 가져오고 있습니다.'),
    );
  };

  const getMyInfo = () => {
    request.get(
      '/api/users/my-info',
      null,
      (data) => {
        setSpaceInfoReducer(commonUtil.getUserSpace(data.spaces));
        setUserInfoReducer(data);
      },
      null,
      t('사용자의 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getSpace();
  }, [spaceCode]);

  const onReject = (applicantId) => {
    request.put(
      `/api/spaces/${spaceCode}/applicants/${applicantId}/reject`,
      null,
      () => {
        getSpace();
        dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('거절하였습니다.'));
      },
      null,
      t('사용자에게 스페이스 결정 사항을 알리고 있습니다.'),
    );
  };

  const onApprove = (applicantId) => {
    request.put(
      `/api/spaces/${spaceCode}/applicants/${applicantId}/approve`,
      null,
      () => {
        getSpace();
        dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('승인하였습니다.'));
      },
      null,
      t('사용자를 스페이스에 참여시키고 있습니다.'),
    );
  };

  const onExit = () => {
    dialog.setConfirm(
      MESSAGE_CATEGORY.WARNING,
      t('데이터 삭제 경고'),
      t(`'${space.name}' 스페이스에서 사용자가 참여중인 프로젝트, 스프린트, 미팅을 비롯한 스페이스와 관련된 사용자 정보가 모두 삭제됩니다. 변경하시겠습니까?`),
      () => {
        request.put(
          `/api/spaces/${spaceCode}/exit`,
          null,
          () => {
            getMyInfo();
            dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('스페이스에서 정상적으로 탈퇴하였습니다.'), () => {
              history.push('/spaces');
            });
          },
          null,
          t('스페이스에 포함된 사용자의 모든 정보를 삭제하고 있습니다.'),
        );
      },
    );
  };

  const allowSearch = ALLOW_SEARCHES.find((d) => d.key === space?.allowSearch) || {};
  const allowAutoJoin = JOIN_POLICIES.find((d) => d.key === space?.allowAutoJoin) || {};
  const activated = ACTIVATES.find((d) => d.key === space?.activated) || {};

  const labelMinWidth = '140px';

  const spaceLink = `${window.location.origin}/spaces/tokens/${space?.token}`;

  return (
    <Page title={false}>
      <PageTitle
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/spaces'),
            name: t('스페이스 목록'),
          },
          {
            link: commonUtil.getSpaceUrl(`/spaces/${space?.id}`),
            name: space?.name,
            current: true,
          },
        ]}
      >
        {t('스페이스 정보')}
      </PageTitle>
      {allowed && space && space.isMember && (
        <PageContent className="d-flex" info>
          <Block className="pt-0">
            <BlockTitle>{t('스페이스 정보')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('스페이스')}</Label>
              <Text>{space.name}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('코드')}</Label>
              <Text>{space.code}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('설명')}</Label>
              <Text>{space.description}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('생성일시')}</Label>
              <Text>{dateUtil.getDateString(space.creationDate)}</Text>
            </BlockRow>
          </Block>
          <Block>
            <BlockTitle>{t('검색 및 참여 설정')}</BlockTitle>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('검색 허용')}</Label>
              <Text>{allowSearch.value}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('초대 링크')}</Label>
              <Text>
                <div className="d-flex">
                  <div>{spaceLink}</div>
                  <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
                  <div>
                    <Button
                      size="xs"
                      color="point"
                      outline
                      onClick={() => {
                        copy(spaceLink);
                        setCopyText(
                          <span>
                            <i className="fas fa-check mr-2" />
                            {t('URL 복사')}
                          </span>,
                        );
                        setTimeout(() => {
                          setCopyText(t('URL 복사'));
                        }, 1000);
                      }}
                    >
                      {copyText}
                    </Button>
                  </div>
                </div>
              </Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('자동 승인')}</Label>
              <Text>{allowAutoJoin.value}</Text>
            </BlockRow>
            <BlockRow>
              <Label minWidth={labelMinWidth}>{t('활성화')}</Label>
              <Text>{activated.value}</Text>
            </BlockRow>
          </Block>
          <Block className="pb-0">
            <BlockTitle>{t('멤버')}</BlockTitle>
            <UserList
              showAdmin
              users={space.users}
              editable={{
                role: false,
                member: false,
                add: false,
              }}
            />
          </Block>
          {space.isAdmin && (
            <Block className="g-last-block">
              <BlockTitle>{t('참여 요청')}</BlockTitle>
              <UserApplicants applicants={space.applicants} onReject={onReject} onApprove={onApprove} />
            </Block>
          )}
          <BottomButtons
            onClose={onExit}
            onCloseText={!space?.isAdmin ? t('스페이스 나가기') : null}
            onList={() => {
              history.push('/spaces');
            }}
            onEdit={
              space?.isAdmin
                ? () => {
                    history.push(`/spaces/${spaceCode}/edit`);
                  }
                : null
            }
            onEditText="변경"
          />
        </PageContent>
      )}
      <SpaceApplicantStatus allowed={allowed} spaceCode={space?.code} space={space} getSpace={getSpace} />
    </Page>
  );
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSpaceInfo: (space) => dispatch(setSpaceInfo(space)),
    setUserInfo: (user) => dispatch(setUserInfo(user)),
  };
};

export default compose(withLogin, connect(undefined, mapDispatchToProps), withRouter, withTranslation())(Space);

Space.propTypes = {
  t: PropTypes.func,

  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      spaceCode: PropTypes.string,
    }),
  }),
  setSpaceInfo: PropTypes.func,
  setUserInfo: PropTypes.func,
};
