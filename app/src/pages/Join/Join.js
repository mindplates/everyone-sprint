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
  Button,
  CheckBox,
  ExitButton,
  Form,
  IconSelector,
  ImageMaker,
  Input,
  Label,
  Liner,
  Page,
  PageContent,
  PageTitle,
  PictureMaker,
  Popup,
  Selector,
  TextMaker,
  UserCard,
} from '@/components';
import storage from '@/utils/storage';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY, TIMEZONES, USER_STUB } from '@/constants/constants';
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

  const [popup, setPopup] = useState({
    camera: false,
    imageMaker: false,
    textMaker: false,
    iconSelector: false,
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
            <Block className="general-info pt-0">
              <BlockTitle>{t('로그인 정보')}</BlockTitle>
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
            </Block>
            <Block className="general-info pt-0">
              <BlockTitle>{t('사용자 정보')}</BlockTitle>
              <div className="user-info-content">
                <div className="user-picture">
                  <div className="preview">
                    <div className="preview-content">
                      {info.imageType && (
                        <ExitButton
                          size="xxs"
                          color="black"
                          className="remove-image-button"
                          onClick={() => {
                            setInfo({ ...info, imageType: '', imageData: '' });
                          }}
                        />
                      )}
                      {!info.imageType && (
                        <div className="preview-image">
                          <i className="fas fa-robot" />
                        </div>
                      )}
                      {info.imageType && info.imageType === 'image' && (
                        <div className="preview-image">
                          <img src={info.imageData} alt="USER" />
                        </div>
                      )}
                      {info.imageType && info.imageType === 'text' && <div className="avatar-text">{info.imageData}</div>}
                      {info.imageType && info.imageType === 'icon' && (
                        <div className="avatar-icon">
                          <span>
                            <i className={info.imageData.icon} />
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="picture-controls">
                    <Button
                      size="sm"
                      color="white"
                      outline
                      rounded
                      onClick={() => {
                        setPopup({ ...popup, camera: true });
                      }}
                      data-tip={t('사진 찍기')}
                    >
                      <i className="fas fa-camera-retro" />
                    </Button>
                    <Button
                      size="sm"
                      color="white"
                      outline
                      rounded
                      onClick={() => {
                        setPopup({ ...popup, imageMaker: true });
                      }}
                      data-tip={t('이미지 업로드')}
                    >
                      <i className="fas fa-upload" />
                    </Button>
                    <Button
                      size="sm"
                      color="white"
                      outline
                      rounded
                      onClick={() => {
                        setPopup({ ...popup, iconSelector: true });
                      }}
                      data-tip={t('아이콘 선택')}
                    >
                      <i className="fas fa-icons" />
                    </Button>
                    <Button
                      size="sm"
                      color="white"
                      outline
                      rounded
                      onClick={() => {
                        setPopup({ ...popup, textMaker: true });
                      }}
                      data-tip={t('문자')}
                    >
                      <i className="fas fa-font" />
                    </Button>
                  </div>
                </div>
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
                      items={[
                        { key: 'ko', value: '한글' },
                        { key: 'en', value: 'English' },
                      ]}
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
                      items={[
                        { key: 'KR', value: '한국' },
                        { key: 'US', value: 'US' },
                      ]}
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
            onSubmitText="사용자 등록"
            onCancelIcon=""
          />
        </Form>
      </PageContent>
      {popup.camera && (
        <Popup
          title={t('사진 찍기')}
          open
          setOpen={() => {
            setPopup({ ...popup, camera: false });
          }}
        >
          <PictureMaker
            close={() => {
              setPopup({ ...popup, camera: false });
            }}
            onChange={(d) => {
              const next = { ...info };
              next.imageType = 'image';
              next.imageData = d;
              setInfo(next);
            }}
          />
        </Popup>
      )}
      {popup.imageMaker && (
        <Popup
          title={t('이미지 등록')}
          open
          setOpen={() => {
            setPopup({ ...popup, imageMaker: false });
          }}
        >
          <ImageMaker
            close={() => {
              setPopup({ ...popup, imageMaker: false });
            }}
            onChange={(d) => {
              const next = { ...info };
              next.imageType = 'image';
              next.imageData = d;
              setInfo(next);
            }}
          />
        </Popup>
      )}
      {popup.textMaker && (
        <Popup
          title={t('텍스트 입력')}
          size="sm"
          open
          setOpen={() => {
            setPopup({ ...popup, textMaker: false });
          }}
        >
          <TextMaker
            close={() => {
              setPopup({ ...popup, textMaker: false });
            }}
            onChange={(d) => {
              const next = { ...info };
              next.imageType = 'text';
              next.imageData = d;
              setInfo(next);
            }}
          />
        </Popup>
      )}
      {popup.iconSelector && (
        <Popup
          title={t('아이콘 선택')}
          open
          setOpen={() => {
            setPopup({ ...popup, iconSelector: false });
          }}
        >
          <IconSelector
            close={() => {
              setPopup({ ...popup, iconSelector: false });
            }}
            onChange={(d) => {
              const next = { ...info };
              next.imageType = 'icon';
              next.imageData = d;
              setInfo(next);
            }}
          />
        </Popup>
      )}
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

Join.propTypes = {
  t: PropTypes.func,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
  setUserInfo: PropTypes.func,
  setSpaceInfo: PropTypes.func,
};
