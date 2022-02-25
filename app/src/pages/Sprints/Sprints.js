import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { Button, EmptyContent, Page, PageTitle, SprintList, withLogin } from '@/components';
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
          list.map((d) => {
            return sprintUtil.getSprint(d);
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
        buttons={[
          {
            icon: <i className="fas fa-plus" />,
            text: t('새 스프린트'),
            handler: () => {
              history.push('/sprints/new');
            },
          },
        ]}
      >
        {t('스프린트')}
      </PageTitle>
      {sprints != null && (
        <div className={`${sprints && sprints.length > 0 ? 'g-list-content' : 'g-page-content'}`}>
          {sprints && sprints.length > 0 && <SprintList sprints={sprints} />}
          {!(sprints && sprints.length > 0) && (
            <EmptyContent
              height="100%"
              message={t('스프린트가 없습니다.')}
              additionalContent={
                <div className="mt-3">
                  <Button
                    size="md"
                    color="primary"
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
        </div>
      )}
    </Page>
  );
};

export default compose(withLogin, withRouter, withTranslation())(Sprints);

Sprints.propTypes = {
  t: PropTypes.func,
  history: HistoryPropTypes,
};
