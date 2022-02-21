import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BlockTitle, BottomButtons, Page, PageContent, SprintTimeLine, UserList, withLogin } from '@/components';
import dialog from '@/utils/dialog';
import { ALLOW_SEARCHES, JOIN_POLICIES, MESSAGE_CATEGORY } from '@/constants/constants';
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
  const [project, setProject] = useState(null);

  useEffect(() => {
    request.get(`/api/projects/${id}`, null, setProject, null, t('프로젝트 정보를 가져오고 있습니다.'));
  }, [id]);

  console.log(project);

  const onDelete = () => {
    dialog.setConfirm(MESSAGE_CATEGORY.WARNING, t('데이터 삭제 경고'), t('프로젝트를 삭제하시겠습니까?'), () => {
      request.del(
        `/api/projects/${id}`,
        null,
        () => {
          dialog.setMessage(MESSAGE_CATEGORY.INFO, t('성공'), t('삭제되었습니다.'), () => {
            history.push('/projects');
          });
        },
        null,
        t('프로젝트와 관련된 모든 데이터를 정리중입니다.'),
      );
    });
  };

  const allowSearch = ALLOW_SEARCHES.find((d) => d.key === project?.allowSearch) || {};
  const allowAutoJoin = JOIN_POLICIES.find((d) => d.key === project?.allowAutoJoin) || {};

  return (
    <Page
      className="project-wrapper"
      listLayout
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
        },
      ]}
    >
      {project && (
        <PageContent className="project-content" padding="0">
          <div className="project-info">
            <div className="general-info">
              <BlockTitle className="content-title mb-3">{t('프로젝트')}</BlockTitle>
              <div className="project-card">
                <div className="project-name">{project.name}</div>
                <div className="project-info-tag">
                  <span className={allowSearch.key ? 'allowed' : ''}>{allowSearch.value}</span>
                  <span className={allowAutoJoin.key ? 'allowed' : ''}>{allowAutoJoin.value}</span>
                </div>
              </div>
              <BlockTitle className="content-title mb-3">
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
            onEdit={() => {
              history.push(`/projects/${id}/edit`);
            }}
            onEditText="변경"
            onDelete={onDelete}
            onDeleteText="삭제"
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
