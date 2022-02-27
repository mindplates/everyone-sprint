import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Page, PageContent, PageTitle, SprintList, withLogin } from '@/components';
import { HistoryPropTypes } from '@/proptypes';
import request from '@/utils/request';
import sprintUtil from '@/pages/Sprints/sprintUtil';

const Sprints = ({ t, history }) => {
  const [sprints, setSprints] = useState(null);

  const getSprints = () => {
    request.get(
      '/api/sprints',
      null,
      (list) => {
        setSprints(
          list
            .map((d) => {
              return sprintUtil.getSprint(d);
            })
            .sort((a, b) => {
              return b.startDate - a.startDate;
            }),
        );
      },
      null,
      t('사용자의 스프린트 목록을 모으고 있습니다.'),
    );
  };

  useEffect(() => {
    getSprints();
  }, []);

  return (
    <Page>
      <PageTitle
        isListPageTitle
        buttons={[
          {
            icon: <i className="fas fa-plus" />,
            text: t('새 스프린트'),
            handler: () => {
              history.push('/sprints/new');
            },
          },
        ]}
        breadcrumbs={[
          {
            link: '/',
            name: t('TOP'),
          },
          {
            link: '/sprints',
            name: t('스프린트 목록'),
            current: true,
          },
        ]}
      >
        {t('스프린트')}
      </PageTitle>
      <PageContent listLayout={sprints === null || sprints?.length > 0}>
        {sprints?.length > 0 && <SprintList sprints={sprints} />}
        {sprints?.length < 1 && (
          <EmptyContent
            height="100%"
            icon={<i className="fas fa-plane" />}
            message={t('참여 중인 스프린트가 없습니다.')}
            additionalContent={
              <div className="mt-3">
                <Button
                  size="md"
                  color="point"
                  onClick={() => {
                    history.push('/sprints/new');
                  }}
                >
                  <i className="fas fa-plus" /> {t('새 스프린트')}
                </Button>
              </div>
            }
          />
        )}
      </PageContent>
    </Page>
  );
};

export default compose(withLogin, withRouter, withTranslation())(Sprints);

Sprints.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
};
