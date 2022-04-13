import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Page, PageContent, PageTitle } from '@/components';
import './Notice.scss';

const Notice = ({ t }) => {
  return (
    <Page className="notice-wrapper" title={false}>
      <PageTitle isListPageTitle>{t('모두의 스프린트')}</PageTitle>
      <PageContent listLayout>
        <div className="notice-board">
          <div>
            <div className="title">
              <span>NOTICE</span>
            </div>
            <div className="content">
              <ul>
                <li>
                  <div>테스트</div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </PageContent>
    </Page>
  );
};

export default compose(withRouter, withTranslation())(Notice);

Notice.propTypes = {
  t: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      id: PropTypes.string,
      spaceCode: PropTypes.string,
    }),
  }),
};
