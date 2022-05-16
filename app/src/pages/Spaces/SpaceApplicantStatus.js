import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BottomButtons, Button, EmptyContent, PageContent } from '@/components';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes, SpacePropTypes, UserPropTypes } from '@/proptypes';
import dialog from '@/utils/dialog';
import commonUtil from '@/utils/commonUtil';
import { setSpaceInfo, setUserInfo } from '@/store/actions';
import './SpaceApplicantStatus.scss';

const SpaceApplicantStatus = ({
  t,
  history,
  className,
  user,
  spaceCode,
  space,
  getSpace,
  token,
  setSpaceInfo: setSpaceInfoReducer,
  setUserInfo: setUserInfoReducer,
  allowed,
}) => {
  const getMyInfo = (code) => {
    request.get('/api/users/my-info', null, (data) => {
      setSpaceInfoReducer(commonUtil.getUserSpace(data.spaces, code));
      setUserInfoReducer(data);
    });
  };

  const onJoin = () => {
    request.post(
      token ? `/api/spaces/${spaceCode}/join?token=${token}` : `/api/spaces/${spaceCode}/join`,
      { userId: user.id },
      (d, r) => {
        getSpace();
        if (r.status === 201) {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('스페이스에 가입을 요청하였습니다.'));
        } else {
          getMyInfo(space.code);
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('스페이스에 가입하였습니다.'));
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

  return (
    <>
      {allowed !== null && allowed === false && (
        <PageContent className="d-flex flex-column">
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={
              <div>
                <div>{t('접근 할 수 있는 스페이스가 아닙니다.')}</div>
                <div>{t('잘못된 링크이거나, 멤버만 접근 가능한 스페이스이거나 또는 접근이 허용되지 않는 스페이스입니다.')}</div>
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
      {allowed !== null && allowed && space && !space.isMember && (
        <PageContent className={`space-applicant-status-wrapper ${className}`}>
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
    </>
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

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter, withTranslation())(SpaceApplicantStatus);

SpaceApplicantStatus.defaultProps = {
  className: '',
};

SpaceApplicantStatus.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  user: UserPropTypes,
  spaceCode: PropTypes.string,
  space: SpacePropTypes,
  getSpace: PropTypes.func,
  token: PropTypes.string,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      spaceCode: PropTypes.string,
    }),
  }),
  setSpaceInfo: PropTypes.func,
  setUserInfo: PropTypes.func,
  allowed: PropTypes.bool,
};
