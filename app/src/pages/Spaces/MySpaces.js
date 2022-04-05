import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Page, PageContent, PageTitle, SpaceList, withLogin } from '@/components';
import { HistoryPropTypes } from '@/proptypes';
import request from '@/utils/request';

const Spaces = ({ t, history }) => {
  const [spaces, setSpaces] = useState(null);

  const getSpaces = () => {
    request.get(
      '/api/spaces',
      {
        type: 'my',
        text: '',
      },
      (list) => {
        setSpaces(list);
      },
      null,
      t('사용자의 스페이스 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getSpaces();
  }, []);

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
            icon: <i className="fas fa-search" />,
            text: t('검색'),
            handler: () => {
              history.push('/spaces');
            },
          },
        ]}
        breadcrumbs={[
          {
            link: '/',
            name: t('TOP'),
          },
          {
            link: '/spaces',
            name: t('스페이스 목록'),
            current: true,
          },
        ]}
      >
        {t('내 스페이스')}
      </PageTitle>

      <PageContent listLayout={spaces === null || spaces?.length > 0}>
        {spaces?.length > 0 && <SpaceList spaces={spaces} />}
        {spaces?.length < 1 && (
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-globe-asia" />}
            message={t('참여 중인 스페이스가 없습니다.')}
            additionalContent={
              <div className="mt-3">
                <Button
                  size="md"
                  color="point"
                  onClick={() => {
                    history.push('/spaces/new');
                  }}
                >
                  <i className="fas fa-plus" /> {t('새 스페이스')}
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
