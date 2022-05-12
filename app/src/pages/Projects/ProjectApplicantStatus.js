import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BottomButtons, Button, EmptyContent, PageContent } from '@/components';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes, ProjectPropTypes, UserPropTypes } from '@/proptypes';
import dialog from '@/utils/dialog';
import { setSpaceInfo, setUserInfo } from '@/store/actions';
import './ProjectApplicantStatus.scss';

const ProjectApplicantStatus = ({ t, history, className, user, spaceCode, projectId, project, getProject, token, allowed }) => {
  const onJoin = () => {
    request.post(
      token ? `/api/${spaceCode}/projects/${projectId}/join?token=${token}` : `/api/${spaceCode}/projects/${projectId}/join`,
      { userId: user.id },
      (d, r) => {
        getProject(projectId);
        if (r.status === 201) {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('프로젝트에 가입을 요청하였습니다.'));
        } else {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('프로젝트에 가입하였습니다.'));
        }
      },
      null,
      t('프로젝트에 참여 의사를 전달 중입니다.'),
    );
  };

  const onJoinCancel = () => {
    request.del(
      `/api/${spaceCode}/projects/${projectId}/join`,
      { userId: user.id },
      () => {
        getProject(projectId);
        dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('프로젝트 가입 요청을 취소되었습니다.'));
      },
      null,
      t('프로젝트 참여 요청을 취소하고 있습니다.'),
    );
  };

  return (
    <>
      {allowed !== null && allowed === false && (
        <PageContent className={`${className} d-flex flex-column`}>
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={
              <div>
                <div>{t('접근 할 수 있는 프로젝트가 아닙니다.')}</div>
                <div>{t('잘못된 링크이거나, 멤버만 접근 가능한 프로젝트이거나 또는 접근이 허용되지 않는 프로젝트입니다.')}</div>
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
      {allowed !== null && allowed && project && !project.isMember && (
        <PageContent className={`user-applicant-status-wrapper ${className}`}>
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={
              <div className="space-requesting-info">
                <div className="space-name">{project.name}</div>
                {!project.userApplicantStatus.approvalStatusCode && project.allowAutoJoin && (
                  <>
                    <div>{t('프로젝트 멤버만 접근할 수 접근할 수 있습니다.')}</div>
                    <div>{t('아래 버튼을 클릭하여, 바로 프로젝트 멤버로 참여할 수 있습니다.')}</div>
                    <div className="button">
                      <Button size="md" color="point" outline onClick={onJoin}>
                        {t('프로젝트 가입')}
                      </Button>
                    </div>
                  </>
                )}
                {!project.userApplicantStatus.approvalStatusCode && !project.allowAutoJoin && (
                  <>
                    <div>{t('프로젝트 멤버만 접근할 수 있습니다.')}</div>
                    <div>
                      {t('프로젝트에 참여하기 위해서는 프로젝트 관리자의 승인이 필요합니다. 아래 버튼을 클릭하여, 프로젝트 가입을 요청할 수 있습니다.')}
                    </div>
                    <div className="button">
                      <Button size="md" color="point" outline onClick={onJoin}>
                        {t('프로젝트 가입 요청')}
                      </Button>
                    </div>
                  </>
                )}
                {project.userApplicantStatus?.approvalStatusCode === 'REQUEST' && !project.allowAutoJoin && (
                  <>
                    <div>{t('프로젝트 참여를 요청 중입니다.')}</div>
                    <div>{t('아직 관리자의 승인이 이루어지지 않았습니다. 프로젝트 관리자의 승인 이 후 접근이 가능합니다.')}</div>
                    <div className="button">
                      <Button size="md" color="danger" outline onClick={onJoinCancel}>
                        {t('프로젝트 가입 요청 취소')}
                      </Button>
                    </div>
                  </>
                )}
                {project.userApplicantStatus?.approvalStatusCode === 'REJECTED' && !project.allowAutoJoin && (
                  <>
                    <div>{t('프로젝트 참여 요청이 거절되었습니다.')}</div>
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

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter, withTranslation())(ProjectApplicantStatus);

ProjectApplicantStatus.defaultProps = {
  className: '',
};

ProjectApplicantStatus.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  user: UserPropTypes,
  spaceCode: PropTypes.string,
  projectId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  project: ProjectPropTypes,
  getProject: PropTypes.func,
  token: PropTypes.string,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      spaceCode: PropTypes.string,
    }),
  }),
  allowed: PropTypes.bool,
};
