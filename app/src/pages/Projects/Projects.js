import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Input, Page, PageContent, PageTitle, ProjectList, withLogin } from '@/components';
import { HistoryPropTypes } from '@/proptypes';
import request from '@/utils/request';
import './Projects.scss';
import commonUtil from '@/utils/commonUtil';

const Projects = ({ t, history }) => {
  const [projects, setProjects] = useState(null);
  const [search, setSearch] = useState({
    type: 'search',
    text: '',
  });

  const getProjects = () => {
    request.get(
      '/api/{spaceCode}/projects',
      search,
      (list) => {
        setProjects(list);
      },
      null,
      t('사용자의 프로젝트 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getProjects();
  }, [search.type]);

  return (
    <Page className="spaces-wrapper">
      <PageTitle
        className="pb-2"
        isListPageTitle
        buttons={[
          {
            icon: <i className="fas fa-plus" />,
            text: t('새 프로젝트'),
            handler: () => {
              commonUtil.move('/projects/new');
            },
          },
          {
            icon: <i className="fas fa-map-marker-alt" />,
            text: t('내 프로젝트'),
            handler: () => {
              commonUtil.move('/projects/my');
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
            name: t('프로젝트 검색'),
            current: true,
          },
        ]}
      >
        {t('프로젝트 검색')}
      </PageTitle>
      <div className="search">
        <div className="text">
          <Input
            simple
            outline
            type="text"
            size="sm"
            value={search.text}
            onChange={(val) => {
              setSearch({
                ...search,
                text: val,
              });
            }}
            onEnter={getProjects}
          />
        </div>
        <div className="search-button">
          <Button size="sm" color="white" outline onClick={getProjects}>
            {t('검색')}
          </Button>
        </div>
      </div>
      <PageContent listLayout={projects === null || projects?.length > 0}>
        {projects?.length > 0 && <ProjectList projects={projects} />}
        {projects?.length < 1 && (
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={t('검색된 프로젝트가 없습니다.')}
            additionalContent={
              <div className="mt-3">
                <Button
                  size="md"
                  color="white"
                  outline
                  onClick={() => {
                    history.push('/spaces/new');
                  }}
                >
                  <i className="fas fa-plus" /> {t('새로운 프로젝트 만들기')}
                </Button>
              </div>
            }
          />
        )}
      </PageContent>
    </Page>
  );
};

export default compose(withLogin, withRouter, withTranslation())(Projects);

Projects.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
};
