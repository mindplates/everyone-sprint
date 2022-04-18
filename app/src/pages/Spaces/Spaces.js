import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Input, Page, PageContent, PageTitle, SpaceList, withLogin } from '@/components';
import { HistoryPropTypes } from '@/proptypes';
import request from '@/utils/request';
import './Spaces.scss';
import commonUtil from '@/utils/commonUtil';

const Spaces = ({ t, history }) => {
  const [spaces, setSpaces] = useState(null);
  const [search, setSearch] = useState({
    type: 'search',
    text: '',
  });

  const getSpaces = () => {
    request.get(
      '/api/spaces',
      search,
      (list) => {
        setSpaces(list);
      },
      null,
      t('사용자의 스페이스 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getSpaces();
  }, [search.type]);

  return (
    <Page className="spaces-wrapper">
      <PageTitle
        className="pb-2"
        isListPageTitle
        buttons={[
          {
            icon: <i className="fas fa-plus" />,
            text: t('새 스페이스'),
            handler: () => {
              history.push('/spaces/new');
            },
          },
          {
            icon: <i className="fas fa-map-marker-alt" />,
            text: t('내 스페이스'),
            handler: () => {
              history.push('/spaces/my');
            },
          },
        ]}
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/spaces'),
            name: t('스페이스 검색'),
            current: true,
          },
        ]}
      >
        {t('스페이스 검색')}
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
            onEnter={getSpaces}
          />
        </div>
        <div className="search-button">
          <Button size="sm" color="white" outline onClick={getSpaces}>
            {t('검색')}
          </Button>
        </div>
      </div>
      <PageContent listLayout={spaces === null || spaces?.length > 0}>
        {spaces?.length > 0 && <SpaceList spaces={spaces} />}
        {spaces?.length < 1 && (
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={t('검색된 스페이스가 없습니다.')}
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
                  <i className="fas fa-plus" /> {t('새로운 스페이스 만들기')}
                </Button>
              </div>
            }
          />
        )}
      </PageContent>
    </Page>
  );
};

export default compose(withLogin, withRouter, withTranslation())(Spaces);

Spaces.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
};
