import React from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Button, Page, PageContent } from '@/components';
import { HistoryPropTypes } from '@/proptypes';
import request from '@/utils/request';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import './EmptyConference.scss';

class EmptyConference extends React.PureComponent {
  render() {
    const { history, t, code, allowRequest, setAllowRequest } = this.props;

    const joinMeetingRequest = () => {
      request.put(
        `/api/{spaceCode}/meets/${code}/request/join`,
        null,
        () => {
          setAllowRequest({
            allowed: false,
            request: true,
            result: null,
          });
        },
        (error, response) => {
          if (response && response.status === 404) {
            dialog.setMessage(MESSAGE_CATEGORY.WARNING, '요청 실패', '현재 미팅에 참석 중인 사용자가 없습니다.');
            return true;
          }

          return false;
        },
        t('참석자들에게 참석 요청을 전송합니다.'),
      );
    };

    return (
      <Page className="empty-conference-wrapper">
        <PageContent className="empty-conference-content">
          <div className="h-100 d-flex justify-content-center">
            <div className="align-self-center message">
              {allowRequest.allowed === false && (
                <>
                  {allowRequest.request && allowRequest.result === null && <div className="mb-3">{t('미팅 참여를 요청했습니다.')}</div>}
                  {allowRequest.request && allowRequest.result === false && <div className="mb-3">{t('미팅 참여가 거절되었습니다.')}</div>}
                  {allowRequest.request && allowRequest.result === true && <div className="mb-3">{t('미팅 참여가 수락되었습니다.')}</div>}
                  {!allowRequest.request && <div className="mb-3">{t('미팅 참여 권한이 없습니다.')}</div>}
                  <div>
                    <Button size="sm" color="white" outline onClick={joinMeetingRequest}>
                      {t('참여 요청')}
                    </Button>
                  </div>
                </>
              )}
              {allowRequest.allowed !== false && (
                <>
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
                </>
              )}
            </div>
          </div>
        </PageContent>
      </Page>
    );
  }
}
export default withTranslation()(withRouter(EmptyConference));

EmptyConference.propTypes = {
  t: PropTypes.func,
  code: PropTypes.string,
  history: HistoryPropTypes,
  match: PropTypes.shape({
    params: PropTypes.shape({
      code: PropTypes.string,
    }),
  }),
  allowRequest: PropTypes.shape({
    allowed: PropTypes.bool,
    request: PropTypes.bool,
    result: PropTypes.bool,
  }),
  setAllowRequest: PropTypes.func,
};
