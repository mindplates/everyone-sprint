import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import _ from 'lodash';
import TimeAgo from 'javascript-time-ago';
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
  Text,
  UserCard,
  UserPictureEditor,
  withLogin,
} from '@/components';
import storage from '@/utils/storage';
import dialog from '@/utils/dialog';
import { COUNTRIES, LANGUAGES, MESSAGE_CATEGORY, TIMEZONES } from '@/constants/constants';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes } from '@/proptypes';
import { setSpaceInfo, setUserInfo } from '@/store/actions';
import commonUtil from '@/utils/commonUtil';
import './EditMyInfo.scss';

const labelMinWidth = '140px';

const EditMyInfo = ({ t, history, setUserInfo: setUserInfoReducer, setSpaceInfo: setSpaceInfoReducer, i18n }) => {
  const [info, setInfo] = useState(null);

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  const getMyInfo = () => {
    request.get(
      '/api/users/my-info',
      null,
      (data) => {
        setInfo({
          ...data,
          imageData: data.imageType === 'icon' ? JSON.parse(data.imageData) : data.imageData,
        });
      },
      null,
      t('사용자의 정보를 가져오고 있습니다.'),
    );
  };

  useEffect(() => {
    getMyInfo();
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();

    const nextInfo = _.cloneDeep(info);
    if (nextInfo.imageType === 'icon') {
      nextInfo.imageData = JSON.stringify(nextInfo.imageData);
    }

    request.put(
      '/api/users/my-info',
      nextInfo,
      (data) => {
        const { autoLogin, ...last } = data;

        if (data.autoLogin) {
          storage.setItem('auth', 'token', data.loginToken);
        } else {
          storage.setItem('auth', 'token', null);
        }

        setUserInfoReducer(last);
        i18n.changeLanguage(data.language);
        TimeAgo.setDefaultLocale(data.language);
        setSpaceInfoReducer(commonUtil.getUserSpace(data.spaces));

        dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '정상적으로 변경되었습니다.', () => {
          history.push('/my-info');
        });
      },
      null,
      t('사용자 정보를 변경하고 있습니다.'),
    );
  };

  return (
    <Page className="edit-my-info-wrapper">
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
        {t('내 정보 변경')}
      </PageTitle>
      <PageContent className="d-flex" info>
        {info && (
          <Form className="join-content" onSubmit={onSubmit}>
            <div className="join-info">
              <Block className="general-info pt-0">
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
                      <Label minWidth={labelMinWidth}>{t('이메일')}</Label>
                      <Text>{info.email}</Text>
                    </BlockRow>
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
              onSubmitText={t('저장')}
              onCancelIcon=""
            />
          </Form>
        )}
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

export default compose(withLogin, connect(mapStateToProps, mapDispatchToProps), withRouter, withTranslation())(EditMyInfo);

EditMyInfo.defaultProps = {};

EditMyInfo.propTypes = {
  t: PropTypes.func,
  i18n: PropTypes.objectOf(PropTypes.any),
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
  setUserInfo: PropTypes.func,
  setSpaceInfo: PropTypes.func,
};
