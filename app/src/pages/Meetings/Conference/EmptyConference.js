import React from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Page, PageContent, PageTitle } from '@/components';
import { HistoryPropTypes, UserPropTypes } from '@/proptypes';

class EmptyConference extends React.PureComponent {
  render() {
    const { history, t, user } = this.props;

    console.log(user);

    return (
      <Page className="empty-conference-wrapper">
        <PageTitle>{t('미팅 참석')}</PageTitle>
        <PageContent>
          <div className="h-100 d-flex justify-content-center">
            <div className="align-self-center ">
              <div>{t('미팅 정보를 찾을 수 없습니다.')}</div>
              <div className="text-center mt-3">
                <Button
                  size="sm"
                  color="white"
                  outline
                  onClick={() => {
                    history.push('/meetings/new');
                  }}
                >
                  <i className="fas fa-plus" /> {t('새 미팅')}
                </Button>
              </div>
            </div>
          </div>
        </PageContent>
      </Page>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(withRouter(EmptyConference)));

EmptyConference.propTypes = {
  t: PropTypes.func,
  user: UserPropTypes,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      code: PropTypes.string,
    }),
  }),
};
