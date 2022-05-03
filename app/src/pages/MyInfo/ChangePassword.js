import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Block, BlockRow, BlockTitle, BottomButtons, Form, Input, Label, Page, PageContent, PageTitle, withLogin } from '@/components';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import request from '@/utils/request';
import { HistoryPropTypes } from '@/proptypes';
import commonUtil from '@/utils/commonUtil';
import './ChangePassword.scss';

const labelMinWidth = '140px';

const ChangePassword = ({ t, history }) => {
  const [info, setInfo] = useState({
    currentPassword: '',
    changePassword1: '',
    changePassword2: '',
  });

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (info.changePassword1 !== info.changePassword2) {
      dialog.setMessage(MESSAGE_CATEGORY.INFO, t('validation.badInput'), t('validation.notEqualPassword'));
      return;
    }

    request.put(
      '/api/users/my-info/password',
      info,
      () => {
        dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '정상적으로 변경되었습니다.', () => {
          history.push('/my-info');
        });
      },
      null,
      t('비밀번호를 변경하고 있습니다.'),
    );
  };

  return (
    <Page className="change-password-wrapper">
      <PageTitle
        breadcrumbs={[
          {
            link: commonUtil.getSpaceUrl('/'),
            name: t('TOP'),
          },
          {
            link: commonUtil.getSpaceUrl('/home'),
            name: t('HOME'),
            current: true,
          },
        ]}
      >
        {t('비밀번호 변경')}
      </PageTitle>
      <PageContent className="d-flex" info>
        {info && (
          <Form onSubmit={onSubmit}>
            <div className="general-info">
              <Block className="pt-0">
                <BlockTitle>{t('비밀번호 정보')}</BlockTitle>
                <div className="input-content">
                  <div>
                    <BlockRow>
                      <Label minWidth={labelMinWidth} required>
                        {t('현재 비밀번호')}
                      </Label>
                      <Input
                        type="password"
                        value={info.currentPassword}
                        onChange={(val) => changeInfo('currentPassword', val)}
                        required
                        minLength={2}
                        outline
                        simple
                      />
                    </BlockRow>
                    <BlockRow>
                      <Label minWidth={labelMinWidth} required>
                        {t('변경할 비밀번호')}
                      </Label>
                      <Input
                        type="password"
                        value={info.changePassword1}
                        onChange={(val) => changeInfo('changePassword1', val)}
                        required
                        minLength={2}
                        outline
                        simple
                      />
                    </BlockRow>
                    <BlockRow>
                      <Label minWidth={labelMinWidth} required>
                        {t('변경할 비밀번호 확인')}
                      </Label>
                      <Input
                        type="password"
                        value={info.changePassword2}
                        onChange={(val) => changeInfo('changePassword2', val)}
                        required
                        minLength={2}
                        outline
                        simple
                      />
                    </BlockRow>
                  </div>
                </div>
              </Block>
            </div>
            <BottomButtons
              onCancel={() => {
                history.goBack();
              }}
              onSubmit
              onSubmitText={t('저장')}
              onCancelIcon=""
            />
          </Form>
        )}
      </PageContent>
    </Page>
  );
};

export default compose(withLogin, withRouter, withTranslation())(ChangePassword);

ChangePassword.defaultProps = {};

ChangePassword.propTypes = {
  t: PropTypes.func,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
};
