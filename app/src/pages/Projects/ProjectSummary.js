import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BlockTitle, BottomButtons, Page, PageContent, SprintTimeLine, Tabs, UserList, withLogin, withSpace } from '@/components';
import request from '@/utils/request';
import './ProjectSummary.scss';
import commonUtil from '@/utils/commonUtil';
import { ProjectApplicantStatus } from '@/pages';

const ProjectSummary = ({
  t,
  match: {
    params: { id, spaceCode, token },
  },
}) => {
  const tabs = [
    {
      key: 'project',
      value: t('프로젝트'),
    },
    {
      key: 'timeline',
      value: t('스프린트 타임라인'),
    },
  ];

  const [project, setProject] = useState(null);
  const [tab, setTab] = useState('project');
  const [allowed, setAllowed] = useState(null);

  const getProject = (projectId) => {
    request.get(
      token ? `/api/{spaceCode}/projects/tokens/${token}` : `/api/{spaceCode}/projects/${projectId}`,
      null,
      (data) => {
        setAllowed(true);
        setProject(data);
      },
      (error, response) => {
        setAllowed(false);
        return response && (response.status === 423 || response.status === 404);
      },
      t('프로젝트 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getProject(id);
  }, [id]);

  const approveRequestCount = project?.applicants?.filter((d) => d.approvalStatusCode === 'REQUEST').length;

  return (
    <Page
      className="project-wrapper"
      title={false}
      breadcrumbs={[
        {
          link: commonUtil.getSpaceUrl('/'),
          name: t('TOP'),
        },
        {
          link: commonUtil.getSpaceUrl('/projects/my'),
          name: t('프로젝트 목록'),
        },
        {
          link: commonUtil.getSpaceUrl(`/projects/${project?.id}`),
          name: project?.name,
          current: true,
        },
      ]}
    >
      {allowed && project && project.isMember && (
        <PageContent className={`project-content ${tab}`} padding="0">
          <Tabs className="tabs" tab={tab} tabs={tabs} onChange={setTab} border={false} cornered size="sm" />
          <div className="project-info">
            <div className="general-info">
              <BlockTitle className="mb-3 project-member-title">
                {t('프로젝트 멤버')} ({project.users.length}
                {t('명')})
                {approveRequestCount > 0 && (
                  <span className="request-count">
                    <Link to={`/${spaceCode}/projects/${id}/info`} onClick={() => {}}>
                      {t('참여 요청이 있습니다')}
                      <span className="count">
                        <span>{approveRequestCount}</span>
                      </span>
                    </Link>
                  </span>
                )}
              </BlockTitle>
              <div className="project-user-list">
                <div className="g-scroller">
                  <UserList
                    icon={false}
                    type="list"
                    users={project.users}
                    editable={{
                      role: false,
                      member: false,
                      add: false,
                    }}
                    showAdmin
                  />
                </div>
              </div>
            </div>
            <div className="sprint-timeline">
              <BlockTitle className="content-title mb-3">{t('스프린트 타임라인')}</BlockTitle>
              <div className="sprint-timeline-content">
                <SprintTimeLine project={project} />
              </div>
            </div>
          </div>
          <BottomButtons
            onList={() => {
              commonUtil.move('/projects/my');
            }}
            onInfo={() => {
              commonUtil.move(`/projects/${project?.id || id}/info`);
            }}
            onEdit={
              project?.isAdmin
                ? () => {
                    commonUtil.move(`/projects/${project?.id || id}/edit`);
                  }
                : null
            }
            onEditText="변경"
          />
        </PageContent>
      )}
      <ProjectApplicantStatus allowed={allowed} spaceCode={spaceCode} projectId={project?.id || id} project={project} getProject={getProject} token={token} />
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default compose(withLogin, withSpace, connect(mapStateToProps, undefined), withRouter, withTranslation())(ProjectSummary);

ProjectSummary.propTypes = {
  t: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      spaceCode: PropTypes.string,
      token: PropTypes.string,
    }),
  }),
};
