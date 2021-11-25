import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import Webcam from 'webcam-easy';
import PropTypes from 'prop-types';
import { Button, CheckBox, Input, PageTitle, SubTitle } from '@/components';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import './Entry.scss';

const canvas = React.createRef();
const video = React.createRef();
let webcam = null;

const Entry = ({ t }) => {
  const [info, setInfo] = useState({
    email: '',
    password1: '',
    password2: '',
    alias: '',
    name: '',
    tel: '',
    openName: true,
    openTel: true,
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

  return (
    <div className="entry-wrapper g-content">
      <PageTitle>스프린터 등록</PageTitle>
      <div className="entry-content g-page-content">
        <div className="entry-info">
          <div className="layout-1">
            <div className="picture-info">
              <SubTitle>이미지</SubTitle>
              <video ref={video} playsinline autoPlay muted />
              <div className="user-picture">
                <div>
                  <canvas ref={canvas} />
                </div>
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
                    value={info.password1}
                    onChange={(val) => changeInfo('password1', val)}
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
                    className="mx-2"
                    size="sm"
                    type="checkbox"
                    value={info.openName}
                    onChange={(val) => changeInfo('openName', val)}
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
                    className="mx-2"
                    size="sm"
                    type="checkbox"
                    value={info.openTel}
                    onChange={(val) => changeInfo('openTel', val)}
                    label={t('전화번호를 공개합니다')}
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
      </div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(withTranslation()(Entry));

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
};
