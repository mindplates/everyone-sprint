import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Page, PageContent, PageTitle, ProjectList, withLogin, withSpace } from '@/components';
import request from '@/utils/request';
import commonUtil from '@/utils/commonUtil';
import { SpacePropTypes } from '@/proptypes';

const Projects = ({ t, space }) => {
  const [projects, setProjects] = useState(null);

  const getProjects = () => {
    request.get(
      '/api/{spaceCode}/projects',
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
  }, [space]);

  return (
    <Page>
      <PageTitle
        isListPageTitle
        buttons={[
          {
            icon: <i className="fas fa-plus" />,
            text: t('새 프로젝트'),
            handler: () => {
              commonUtil.move('/projects/new');
            },
          },
        ]}
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/projects'),
            name: t('프로젝트 목록'),
            current: true,
          },
        ]}
      >
        {t('프로젝트')}
      </PageTitle>
      <PageContent listLayout={projects === null || projects?.length > 0}>
        {projects?.length > 0 && <ProjectList projects={projects} />}
        {projects?.length < 1 && (
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-archive" />}
            message={t('참여 중인 프로젝트가 없습니다.')}
            additionalContent={
              <div className="mt-3">
                <Button
                  size="md"
                  color="point"
                  onClick={() => {
                    commonUtil.move('/projects/new');
                  }}
                >
                  <i className="fas fa-plus" /> {t('새 프로젝트')}
                </Button>
              </div>
            }
          />
        )}
      </PageContent>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    space: state.space,
  };
};

export default compose(withLogin, withSpace, withRouter, withTranslation(), connect(mapStateToProps, undefined))(Projects);

Projects.propTypes = {
  t: PropTypes.func,
  space: SpacePropTypes,
};
