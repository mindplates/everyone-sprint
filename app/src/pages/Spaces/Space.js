import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  Button,
  EmptyContent,
  Label,
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
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';
import dialog from '@/utils/dialog';
import dateUtil from '@/utils/dateUtil';
import commonUtil from '@/utils/commonUtil';
import { setSpaceInfo, setUserInfo } from '@/store/actions';
import './Space.scss';

const Space = ({
  t,
  history,
  user,
  match: {
    params: { spaceCode },
  },
  setSpaceInfo: setSpaceInfoReducer,
  setUserInfo: setUserInfoReducer,
}) => {
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
        if (response && response.status === 423) {
          setAllowed(false);
          return true;
        }

        return false;
      },
      t('스페이스 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getSpace();
  }, [spaceCode]);

  const getMyInfo = () => {
    request.get('/api/users/my-info', null, (data) => {
      setSpaceInfoReducer(commonUtil.getUserSpace(data.spaces));
      setUserInfoReducer(data);
    });
  };

  const onJoin = () => {
    request.post(
      `/api/spaces/${spaceCode}/join`,
      { userId: user.id },
      (d, r) => {
        getSpace();
        if (r.status === 201) {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('스페이스에 가입을 요청하였습니다.'));
        } else {
          getMyInfo();
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('스페이스 가입에 가입하였습니다.'));
        }
      },
      null,
      t('스페이스에 참여 의사를 전달 중입니다.'),
    );
  };

  const onJoinCancel = () => {
    request.del(
      `/api/spaces/${spaceCode}/join`,
      { userId: user.id },
      () => {
        getSpace();
        dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('스페이스 가입 요청을 취소되었습니다.'));
      },
      null,
      t('스페이스 참여 요청을 취소하고 있습니다.'),
    );
  };

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

  const allowSearch = ALLOW_SEARCHES.find((d) => d.key === space?.allowSearch) || {};
  const allowAutoJoin = JOIN_POLICIES.find((d) => d.key === space?.allowAutoJoin) || {};
  const activated = ACTIVATES.find((d) => d.key === space?.activated) || {};

  const labelMinWidth = '140px';

  return (
    <Page className="space-wrapper" title={false}>
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
      {!allowed && (
        <PageContent className="space-content">
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={
              <div>
                <div>{t('접근 할 수 있는 스페이스가 아닙니다.')}</div>
                <div>{t('멤버만 접근 가능하거나, 혹은 접근이 허용되지 않는 스페이스입니다.')}</div>
              </div>
            }
          />
          <BottomButtons
            onList={() => {
              history.push('/spaces');
            }}
          />
        </PageContent>
      )}
      {allowed && space && !space.isMember && (
        <PageContent className="space-content">
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={
              <div className="space-requesting-info">
                <div className="space-name">{space.name}</div>
                {!space.userApplicantStatus.approvalStatusCode && space.allowAutoJoin && (
                  <>
                    <div>{t('스페이스 멤버만 접근할 수 접근할 수 있습니다.')}</div>
                    <div>{t('아래 버튼을 클릭하여, 바로 스페이스 멤버로 참여할 수 있습니다.')}</div>
                    <div className="button">
                      <Button size="md" color="point" outline onClick={onJoin}>
                        {t('스페이스 가입')}
                      </Button>
                    </div>
                  </>
                )}
                {!space.userApplicantStatus.approvalStatusCode && !space.allowAutoJoin && (
                  <>
                    <div>{t('스페이스 멤버만 접근할 수 있습니다.')}</div>
                    <div>
                      {t('스페이스에 참여하기 위해서는 스페이스 관리자의 승인이 필요합니다. 아래 버튼을 클릭하여, 스페이스 가입을 요청할 수 있습니다.')}
                    </div>
                    <div className="button">
                      <Button size="md" color="point" outline onClick={onJoin}>
                        {t('스페이스 가입 요청')}
                      </Button>
                    </div>
                  </>
                )}
                {space.userApplicantStatus?.approvalStatusCode === 'REQUEST' && !space.allowAutoJoin && (
                  <>
                    <div>{t('스페이스 참여를 요청 중입니다.')}</div>
                    <div>{t('아직 관리자의 승인이 이루어지지 않았습니다. 스페이스 관리자의 승인 이 후 접근이 가능합니다.')}</div>
                    <div className="button">
                      <Button size="md" color="danger" outline onClick={onJoinCancel}>
                        {t('스페이스 가입 요청 취소')}
                      </Button>
                    </div>
                  </>
                )}
                {space.userApplicantStatus?.approvalStatusCode === 'REJECTED' && !space.allowAutoJoin && (
                  <>
                    <div>{t('스페이스 참여 요청이 거절되었습니다.')}</div>
                    <div>{t('요청 정보를 삭제하거나, 다시 한번 가입 요청을 할 수 있습니다.')}</div>
                    <div className="button">
                      <Button className="mr-2" size="md" color="danger" outline onClick={onJoinCancel}>
                        {t('요청 정보 삭제')}
                      </Button>
                      <Button size="md" color="point" outline onClick={onJoin}>
                        {t('가입 재요청')}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            }
          />
          <BottomButtons
            onList={() => {
              history.push('/spaces');
            }}
          />
        </PageContent>
      )}
      {allowed && space && space.isMember && (
        <PageContent className="space-content" info>
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
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setSpaceInfo: (space) => dispatch(setSpaceInfo(space)),
    setUserInfo: (user) => dispatch(setUserInfo(user)),
  };
};

export default compose(withLogin, connect(mapStateToProps, mapDispatchToProps), withRouter, withTranslation())(Space);

Space.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      spaceCode: PropTypes.string,
    }),
  }),
  setSpaceInfo: PropTypes.func,
  setUserInfo: PropTypes.func,
};
