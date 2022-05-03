import React, { useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import {
  Block,
  BlockRow,
  BlockTitle,
  BottomButtons,
  CheckBox,
  Form,
  Input,
  Label,
  Liner,
  Page,
  PageContent,
  PageTitle,
  Selector,
  UserCard,
  UserPictureEditor,
} from '@/components';
import storage from '@/utils/storage';
import dialog from '@/utils/dialog';
import { COUNTRIES, LANGUAGES, MESSAGE_CATEGORY, TIMEZONES, USER_STUB } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes } from '@/proptypes';
import { setSpaceInfo, setUserInfo } from '@/store/actions';
import commonUtil from '@/utils/commonUtil';
import './Join.scss';

const labelMinWidth = '140px';

const Join = ({ t, history, setUserInfo: setUserInfoReducer, setSpaceInfo: setSpaceInfoReducer }) => {
  const [info, setInfo] = useState({
    ...USER_STUB,
    password: '',
    password2: '',
    isNameOpened: true,
    isTelOpened: true,
  });

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (info.password !== info.password2) {
      dialog.setMessage(MESSAGE_CATEGORY.INFO, t('validation.badInput'), t('validation.notEqualPassword'));
      return;
    }

    const nextInfo = _.cloneDeep(info);
    if (nextInfo.imageType === 'icon') {
      nextInfo.imageData = JSON.stringify(nextInfo.imageData);
    }

    request.post(
      '/api/users',
      nextInfo,
      (data) => {
        const { autoLogin, ...last } = data;
        if (data.autoLogin) {
          storage.setItem('auth', 'token', data.loginToken);
        } else {
          storage.setItem('auth', 'token', null);
        }

        setUserInfoReducer(last);
        setSpaceInfoReducer(commonUtil.getUserSpace(data.spaces));

        dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '정상적으로 등록되었습니다.', () => {
          history.push('/');
        });
      },
      null,
      t('사용자 정보를 등록하고 있습니다.'),
    );
  };

  return (
    <Page className="join-wrapper">
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
        {t('사용자 등록')}
      </PageTitle>
      <PageContent className="d-flex" info>
        <Form className="join-content" onSubmit={onSubmit}>
          <div className="join-info">
            <Block className="pt-0">
              <BlockTitle>{t('로그인 정보')}</BlockTitle>
              <div className="login-info">
                <BlockRow>
                  <Label minWidth={labelMinWidth} required>
                    {t('이메일')}
                  </Label>
                  <Input type="email" size="md" value={info.email} onChange={(val) => changeInfo('email', val)} required outline simple />
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth} required>
                    {t('비밀번호')}
                  </Label>
                  <Input type="password" value={info.password} onChange={(val) => changeInfo('password', val)} required minLength={2} outline simple />
                </BlockRow>
                <BlockRow>
                  <Label minWidth={labelMinWidth} required>
                    {t('비밀번호 확인')}
                  </Label>
                  <Input type="password" value={info.password2} onChange={(val) => changeInfo('password2', val)} required minLength={2} outline simple />
                </BlockRow>
              </div>
            </Block>
            <Block className="pt-0">
              <BlockTitle>{t('사용자 정보')}</BlockTitle>
              <div className="user-info-content">
                <UserPictureEditor
                  info={info}
                  onChangeImageData={(imageType, imageData) => {
                    const next = { ...info };
                    next.imageType = imageType;
                    next.imageData = imageData;
                    setInfo(next);
                  }}
                />
                <div>
                  <BlockRow>
                    <Label minWidth={labelMinWidth} required>
                      {t('별명')}
                    </Label>
                    <Input required minLength={1} type="text" size="md" value={info.alias} onChange={(val) => changeInfo('alias', val)} outline simple />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>
                      <span>{t('이름')}</span>
                    </Label>
                    <Input type="text" size="md" value={info.name} onChange={(val) => changeInfo('name', val)} outline simple />
                    <CheckBox
                      className="ml-2"
                      size="sm"
                      type="checkbox"
                      value={info.isNameOpened}
                      onChange={(val) => changeInfo('isNameOpened', val)}
                      label={t('이름을 공개합니다')}
                    />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('전화번호')}</Label>
                    <Input type="text" size="md" value={info.tel} onChange={(val) => changeInfo('tel', val)} outline simple />
                    <CheckBox
                      className="ml-2"
                      size="sm"
                      type="checkbox"
                      value={info.isTelOpened}
                      onChange={(val) => changeInfo('isTelOpened', val)}
                      label={t('전화번호를 공개합니다')}
                    />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('언어')}</Label>
                    <RadioButton
                      size="sm"
                      items={Object.keys(LANGUAGES).map((key) => {
                        return {
                          key,
                          value: LANGUAGES[key],
                        };
                      })}
                      value={info.language}
                      onClick={(val) => {
                        changeInfo('language', val);
                      }}
                    />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('지역')}</Label>
                    <RadioButton
                      size="sm"
                      items={Object.keys(COUNTRIES).map((key) => {
                        return {
                          key,
                          value: COUNTRIES[key],
                        };
                      })}
                      value={info.country}
                      onClick={(val) => {
                        changeInfo('country', val);
                      }}
                    />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('자동 로그인')}</Label>
                    <CheckBox size="sm" type="checkbox" value={info.autoLogin} onChange={(val) => changeInfo('autoLogin', val)} label={t('')} />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('타임존')}</Label>
                    <Selector
                      outline
                      size="md"
                      items={Object.keys(TIMEZONES).map((timezone) => {
                        return {
                          key: timezone,
                          value: TIMEZONES[timezone].name,
                        };
                      })}
                      value={info.timezone}
                      onChange={(val) => {
                        changeInfo('timezone', val);
                      }}
                      minWidth="100px"
                    />
                  </BlockRow>
                </div>
              </div>
            </Block>
            <Block className="general-info pt-0">
              <Liner className="preview-liner" height="1px" width="100%" color="rainbow" />
              <div className="user-card">
                <UserCard user={info} editable={{ role: false, member: false }} showAdmin={false} />
              </div>
            </Block>
          </div>
          <BottomButtons
            onCancel={() => {
              history.goBack();
            }}
            onSubmit
            onSubmitText={t('사용자 등록')}
            onCancelIcon=""
          />
        </Form>
      </PageContent>
    </Page>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setUserInfo: (user) => dispatch(setUserInfo(user)),
    setSpaceInfo: (space) => dispatch(setSpaceInfo(space)),
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withRouter, withTranslation())(Join);

Join.defaultProps = {};

Join.propTypes = {
  t: PropTypes.func,

  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
  setUserInfo: PropTypes.func,
  setSpaceInfo: PropTypes.func,
};
