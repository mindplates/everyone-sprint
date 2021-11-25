import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import Webcam from 'webcam-easy';
import PropTypes from 'prop-types';
import { Button, Input, PageTitle } from '@/components';
import './Entry.scss';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';

const canvas = React.createRef();
const video = React.createRef();
let webcam = null;

const Entry = () => {
  const [info, setInfo] = useState({ email: '', password: '' });
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
      <PageTitle className="d-none">사용자 등록</PageTitle>
      <div className="entry-content g-page-content">
        <div className="entry-info">
          <div className="message">새로운 참가자 등록</div>
          <video ref={video} playsInline autoPlay muted>
            1
          </video>
          <div className="user-picture">
            <div>
              <canvas ref={canvas} />
            </div>
          </div>

          <div className="picture-buttons">
            <Button size="sm" color="primary" rounded onClick={camera}>
              <i className="fas fa-camera-retro" />
            </Button>
            <Button size="sm" color="primary" rounded onClick={takePhoto}>
              <i className="fas fa-camera" />
            </Button>
          </div>
          <div className="inputs">
            <Input type="text" value={info.email} onChange={(val) => changeInfo('email', val)} />
            <Input type="password" value={info.password} onChange={(val) => changeInfo('password', val)} />
          </div>
          <div className="buttons">
            <Button size="sm" color="primary">
              <i className="fas fa-address-card" /> 사용자 등록
            </Button>
          </div>
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

export default connect(mapStateToProps, undefined)(Entry);

Entry.propTypes = {
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
