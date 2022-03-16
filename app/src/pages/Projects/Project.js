import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BlockTitle, BottomButtons, Page, PageContent, SprintTimeLine, Tabs, UserList, withLogin } from '@/components';
import { ACTIVATES, ALLOW_SEARCHES, JOIN_POLICIES } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes } from '@/proptypes';
import './Project.scss';

const Project = ({
  t,
  history,
  match: {
    params: { id },
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

  useEffect(() => {
    request.get(`/api/projects/${id}`, null, setProject, null, t('프로젝트 정보를 가져오고 있습니다.'));
  }, [id]);

  const allowSearch = ALLOW_SEARCHES.find((d) => d.key === project?.allowSearch) || {};
  const allowAutoJoin = JOIN_POLICIES.find((d) => d.key === project?.allowAutoJoin) || {};
  const activated = ACTIVATES.find((d) => d.key === project?.activated) || {};

  return (
    <Page
      className="project-wrapper"
      title={false}
      breadcrumbs={[
        {
          link: '/',
          name: t('TOP'),
        },
        {
          link: '/projects',
          name: t('프로젝트 목록'),
        },
        {
          link: `/projects/${project?.id}`,
          name: project?.name,
          current: true,
        },
      ]}
    >
      {project && (
        <PageContent className={`project-content ${tab}`} padding="0">
          <Tabs className="tabs" tab={tab} tabs={tabs} onChange={setTab} border={false} cornered size="sm" />
          <div className="project-info">
            <div className="general-info">
              <BlockTitle className="content-title mb-3">{t('프로젝트')}</BlockTitle>
              <div className="project-card">
                <div className={`${project.activated ? '' : 'deactivate'} project-name`}>{project.name}</div>
                <div className="project-info-tag">
                  <span className={allowSearch.key ? 'allowed' : ''}>{allowSearch.value}</span>
                  <span className={allowAutoJoin.key ? 'allowed' : ''}>{allowAutoJoin.value}</span>
                  {!project.activated && <span className={activated.key ? '' : 'deactivated'}>{activated.value}</span>}
                </div>
              </div>
              <BlockTitle className="mb-3">
                {t('프로젝트 멤버')} ({project.users.length}
                {t('명')})
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
              history.push('/projects');
            }}
            onEdit={
              project?.isAdmin
                ? () => {
                    history.push(`/projects/${id}/edit`);
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

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(withLogin(Project))));

Project.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
    }),
  }),
};
