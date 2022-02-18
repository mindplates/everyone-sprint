import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Page, PageTitle, ProjectList } from '@/components';
import { HistoryPropTypes } from '@/proptypes';
import request from '@/utils/request';

const Projects = ({ t, history }) => {
  const [projects, setProjects] = useState(null);

  const getProjects = () => {
    request.get(
      '/api/projects',
      null,
      (list) => {
        setProjects(list);
      },
      null,
      t('사용자의 프로젝트 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getProjects();
  }, []);

  return (
    <Page>
      <PageTitle
        buttons={[
          {
            icon: <i className="fas fa-plus" />,
            text: t('새 프로젝트'),
            handler: () => {
              history.push('/projects/new');
            },
          },
        ]}
      >
        {t('프로젝트')}
      </PageTitle>
      {projects != null && (
        <div className={`${projects && projects.length > 0 ? 'g-list-content' : 'g-page-content'}`}>
          {projects && projects.length > 0 && <ProjectList projects={projects} />}
          {!(projects && projects.length > 0) && (
            <EmptyContent
              height="100%"
              message={t('프로젝트가 없습니다.')}
              additionalContent={
                <div className="mt-3">
                  <Button
                    size="md"
                    color="primary"
                    onClick={() => {
                      history.push('/projects/new');
                    }}
                  >
                    <i className="fas fa-plus" /> {t('새 프로젝트')}
                  </Button>
                </div>
              }
            />
          )}
        </div>
      )}
    </Page>
  );
};

export default compose(withRouter, withTranslation())(Projects);

Projects.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
};
