import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import Webcam from 'webcam-easy';
import PropTypes from 'prop-types';
import { Button, CheckBox, ExitButton, Form, Input, PageTitle, SubTitle } from '@/components';
import storage from '@/utils/storage';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import './Entry.scss';
import request from '@/utils/request';
import RadioButton from '@/components/RadioButton/RadioButton';
import { HistoryPropTypes } from '@/proptypes';
import { setUserInfo } from '@/store/actions';

const canvas = React.createRef();
const video = React.createRef();
let webcam = null;

const Entry = ({ t, history, setUserInfo: setUserInfoReducer }) => {
  const [info, setInfo] = useState({
    email: '',
    password: '',
    password2: '',
    alias: '',
    name: '',
    tel: '',
    imageType: '',
    imageData: '',
    isNameOpened: true,
    isTelOpened: true,
    autoLogin: false,
    language: 'ko',
    country: 'KR',
  });
  const [supported, setSupported] = useState({ camera: false });

  const camera = async () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then((stream) => {
        window.stream = stream; // make stream available to browser console
        video.current.srcObject = stream;
      })
      .catch((error) => {
        console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
      });

    if (false && supported.camera) {
      if (1 > 2) {
        webcam = new Webcam(video.current, 'user', canvas.current, null);
        webcam
          .start()
          // .stream()
          .then((result) => {
            console.log('webcam started', result);
          })
          .catch((err) => {
            console.log(err);
            dialog.setMessage(
              MESSAGE_CATEGORY.ERROR,
              '디바이스 없음',
              '카메라 디바이스를 찾을 수 없거나, 허용되지 않았습니다.',
            );
          });
        console.log(webcam);
      }
    }
  };

  useEffect(() => {
    if (1 > 2) {
      const cameraSupported = 'mediaDevices' in navigator;
      setSupported({
        ...supported,
        camera: cameraSupported,
      });
    }

    // camera();
  }, []);

  const changeInfo = (key, value) => {
    const next = { ...info };
    next[key] = value;
    setInfo(next);
  };

  const takePhoto = () => {
    // const picture = webcam.snap();
    // dialog.setMessage(MESSAGE_CATEGORY.ERROR, '디바이스 없음', picture);
    canvas.current.width = video.current.videoWidth;
    canvas.current.height = video.current.videoHeight;
    canvas.current.getContext('2d').drawImage(video.current, 0, 0, canvas.current.width, canvas.current.height);

    // document.querySelector('#download-photo').href = picture;
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (info.password !== info.password2) {
      dialog.setMessage(MESSAGE_CATEGORY.INFO, t('validation.badInput'), t('validation.notEqualPassword'));
      return;
    }

    request.post('/api/users', info, (data) => {

      const { autoLogin, ...last } = data;
      if (data.autoLogin) {
        storage.setItem('auth', 'token', data.loginToken);
      }



      setUserInfoReducer(last);

      dialog.setMessage(MESSAGE_CATEGORY.INFO, '성공', '정상적으로 등록되었습니다.', () => {
        history.push('/');
      });
    });
  };

  return (
    <div className="entry-wrapper g-content">
      <PageTitle>스프린터 등록</PageTitle>
      <Form className="entry-content g-page-content" onSubmit={onSubmit}>
        <div className="entry-info">
          <div className="layout-1">
            <div className="general-info picture-info">
              <SubTitle>이미지 & 아이콘</SubTitle>
              <div className="user-picture">
                <div className="preview">
                  <div className="preview-content">
                    {info.imageType && (
                      <ExitButton size="xxs" color="black" className="remove-image-button" onClick={() => {}} />
                    )}
                    <div className="preview-image">
                      <i className="fas fa-robot" />
                    </div>
                  </div>
                </div>
                <div className="picture-controls">
                  <Button size="sm" color="white" outline rounded onClick={camera} data-tip="사진 찍기">
                    <i className="fas fa-camera-retro" />
                  </Button>
                  <Button disabled size="sm" color="white" outline rounded onClick={camera} data-tip="이미지 업로드">
                    <i className="fas fa-upload" />
                  </Button>
                  <Button disabled size="sm" color="white" outline rounded onClick={camera} data-tip="아이콘 선택">
                    <i className="fas fa-icons" />
                  </Button>
                  <Button disabled size="sm" color="white" outline rounded onClick={camera} data-tip="문자">
                    <i className="fas fa-font" />
                  </Button>
                </div>
              </div>
              <div className="camera-box">
                <video ref={video} playsInline autoPlay muted />
                <div>
                  <canvas ref={canvas} />
                </div>
                <div className="picture-buttons">
                  <Button size="sm" color="white" outline rounded onClick={camera}>
                    <i className="fas fa-camera-retro" />
                  </Button>
                  <Button size="sm" color="white" outline rounded onClick={takePhoto}>
                    <i className="fas fa-camera" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          <div className="layout-2">
            <div />
          </div>
          <div className="layout-3">
            <div className="general-info">
              <SubTitle>로그인 정보</SubTitle>
              <div className="row-input">
                <div>
                  <span>
                    이메일
                    <span className="required">
                      <i className="fas fa-star" />
                    </span>
                  </span>
                </div>
                <div>
                  <Input
                    type="email"
                    size="md"
                    value={info.email}
                    onChange={(val) => changeInfo('email', val)}
                    required
                    outline
                    simple
                  />
                </div>
              </div>
              <div className="row-input">
                <div>
                  <span>
                    비밀번호
                    <span className="required">
                      <i className="fas fa-star" />
                    </span>
                  </span>
                </div>
                <div>
                  <Input
                    type="password"
                    value={info.password}
                    onChange={(val) => changeInfo('password', val)}
                    required
                    minLength={4}
                    outline
                    simple
                  />
                </div>
              </div>
              <div className="row-input">
                <div>
                  <span>
                    비밀번호 확인
                    <span className="required">
                      <i className="fas fa-star" />
                    </span>
                  </span>
                </div>
                <div>
                  <Input
                    type="password"
                    value={info.password2}
                    onChange={(val) => changeInfo('password2', val)}
                    required
                    minLength={4}
                    outline
                    simple
                  />
                </div>
              </div>
            </div>
            <div className="general-info">
              <SubTitle>사용자 정보</SubTitle>
              <div className="row-input">
                <div>
                  <span>
                    별명
                    <span className="required">
                      <i className="fas fa-star" />
                    </span>
                  </span>
                </div>
                <div>
                  <Input
                    required
                    minLength={1}
                    type="text"
                    size="md"
                    value={info.alias}
                    onChange={(val) => changeInfo('alias', val)}
                    outline
                    simple
                  />
                </div>
              </div>
              <div className="row-input">
                <div>
                  <span>이름</span>
                </div>
                <div>
                  <Input
                    type="name"
                    size="md"
                    value={info.name}
                    onChange={(val) => changeInfo('name', val)}
                    outline
                    simple
                  />
                </div>
                <div>
                  <CheckBox
                    size="sm"
                    type="checkbox"
                    value={info.isNameOpened}
                    onChange={(val) => changeInfo('isNameOpened', val)}
                    label={t('이름을 공개합니다')}
                  />
                </div>
              </div>
              <div className="row-input">
                <div>
                  <span>전화번호</span>
                </div>
                <div>
                  <Input
                    type="text"
                    size="md"
                    value={info.tel}
                    onChange={(val) => changeInfo('tel', val)}
                    outline
                    simple
                  />
                </div>
                <div>
                  <CheckBox
                    size="sm"
                    type="checkbox"
                    value={info.isTelOpened}
                    onChange={(val) => changeInfo('isTelOpened', val)}
                    label={t('전화번호를 공개합니다')}
                  />
                </div>
              </div>
              <div className="row-input">
                <div>
                  <span>언어</span>
                </div>
                <div>
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
                </div>
              </div>
              <div className="row-input">
                <div>
                  <span>지역</span>
                </div>
                <div>
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
                </div>
              </div>
              <div className="row-input">
                <div>
                  <span>자동 로그인</span>
                </div>
                <div className="g-line-height-0">
                  <CheckBox
                    size="sm"
                    type="checkbox"
                    value={info.autoLogin}
                    onChange={(val) => changeInfo('autoLogin', val)}
                    label={t('')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="submit-buttons">
          <Button size="md" color="white" outline>
            <i className="fas fa-angle-left" /> 취소
          </Button>
          <Button size="md" color="primary">
            <i className="fas fa-address-card" /> 스프린터 등록
          </Button>
        </div>
      </Form>
    </div>
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(withRouter(Entry)));

Entry.propTypes = {
  t: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      promotionId: PropTypes.string,
      couponId: PropTypes.string,
    }),
  }),
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  history: HistoryPropTypes,
  setUserInfo: PropTypes.func,
};
