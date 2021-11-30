import React, { useEffect, useState } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Button } from '@/components';
import './PictureMaker.scss';

const frameBorderWidth = 3;

const canvas = React.createRef();
const image = React.createRef();
const video = React.createRef();

const moveInfo = {
  isMoveStarted: false,
  start: {
    top: 0,
    left: 0,
  },
};

const sizerInfo = {
  isMoveStarted: false,
  start: {
    top: 0,
    left: 0,
  },
};

const PictureMaker = ({ t, close, onChange }) => {
  const [supported, setSupported] = useState(false);
  const [allowed, setAllowed] = useState(true);
  const [step, setStep] = useState(0);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [frameInfo, setFrameInfo] = useState({ top: 0, left: 0, width: 120, height: 120 });

  const camera = async () => {
    navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: true,
      })
      .then((stream) => {
        video.current.srcObject = stream;
      })
      .catch(() => {
        setAllowed(false);
      });
  };

  const makeImage = () => {
    image.current.width = frameInfo.width;
    image.current.height = frameInfo.height;
    image.current
      .getContext('2d')
      .drawImage(
        canvas.current,
        frameInfo.left + frameBorderWidth,
        frameInfo.top + frameBorderWidth,
        frameInfo.width,
        frameInfo.height,
        0,
        0,
        frameInfo.width,
        frameInfo.height,
      );
  };

  useEffect(() => {
    if (step === 2) {
      makeImage();
    }
  }, [step, frameInfo, imageSize]);

  const takePhoto = () => {
    const rect = video.current.getBoundingClientRect();
    canvas.current.width = rect.width;
    canvas.current.height = rect.height;
    canvas.current.getContext('2d').drawImage(video.current, 0, 0, canvas.current.width, canvas.current.height);
    setImageSize({
      width: rect.width,
      height: rect.height,
    });

    setFrameInfo({
      width: 120,
      height: 120,
      top: rect.height / 2 - 60,
      left: rect.width / 2 - 60,
    });
    setStep(1);
  };

  const onMouseUp = () => {
    moveInfo.isMoveStarted = false;
    document.removeEventListener('mouseup', onMouseUp);
    document.removeEventListener('touchend', onMouseUp);
  };

  const onMouseDown = (e) => {
    moveInfo.isMoveStarted = true;
    moveInfo.start.x = e.pageX || (e.touches && e.touches[0].pageX) || frameInfo.left;
    moveInfo.start.y = e.pageY || (e.touches && e.touches[0].pageY) || frameInfo.top;
    moveInfo.start.left = frameInfo.left;
    moveInfo.start.top = frameInfo.top;

    document.addEventListener('mouseup', onMouseUp);
    document.addEventListener('touchend', onMouseUp);
  };

  const onMouseMove = (e) => {
    if (moveInfo.isMoveStarted) {
      const currentX = e.pageX || (e.touches && e.touches[0].pageX);
      const currentY = e.pageY || (e.touches && e.touches[0].pageY);
      const varX = currentX - moveInfo.start.x;
      const varY = currentY - moveInfo.start.y;
      let nextLeft = moveInfo.start.left + varX;
      let nextTop = moveInfo.start.top + varY;

      if (nextLeft < -frameBorderWidth) {
        nextLeft = -frameBorderWidth;
      } else if (nextLeft > imageSize.width - frameInfo.width - frameBorderWidth) {
        nextLeft = imageSize.width - frameInfo.width - frameBorderWidth;
      }

      if (nextTop < -frameBorderWidth) {
        nextTop = -frameBorderWidth;
      } else if (nextTop > imageSize.height - frameInfo.height - frameBorderWidth) {
        nextTop = imageSize.height - frameInfo.height - frameBorderWidth;
      }

      setFrameInfo({
        ...frameInfo,
        left: nextLeft,
        top: nextTop,
      });
    }
  };

  const onSizerMove = (e) => {
    e.stopPropagation();
    if (sizerInfo.isMoveStarted) {
      const currentX = e.pageX || (e.touches && e.touches[0].pageX);
      const currentY = e.pageY || (e.touches && e.touches[0].pageY);
      const varX = currentX - sizerInfo.start.x;
      const varY = currentY - sizerInfo.start.y;
      const nextChangeValue = varX > varY ? varX : varY;
      const minSize = imageSize.width > imageSize.height ? imageSize.height : imageSize.width;

      let nextWidth = sizerInfo.start.width + nextChangeValue;
      let nextHeight = sizerInfo.start.height + nextChangeValue;

      if (nextWidth < 50) {
        nextWidth = 50;
      } else if (minSize < nextWidth) {
        nextWidth = minSize;
      }

      if (nextHeight < 50) {
        nextHeight = 50;
      } else if (minSize < nextHeight) {
        nextHeight = minSize;
      }

      setFrameInfo({
        ...frameInfo,
        width: nextWidth,
        height: nextHeight,
      });
    }
  };

  const onSizerUp = () => {
    sizerInfo.isMoveStarted = false;
    document.removeEventListener('mouseup', onSizerUp);
    document.removeEventListener('touchend', onSizerUp);
    document.removeEventListener('mousemove', onSizerMove);
    document.removeEventListener('touchmove', onSizerMove);
  };

  useEffect(() => {
    const isSupported = 'mediaDevices' in navigator;
    setSupported(isSupported);

    if (isSupported) {
      setTimeout(() => {
        camera();
      }, 100);
    }

    return () => {
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchend', onMouseUp);
      document.removeEventListener('mouseup', onSizerUp);
      document.removeEventListener('touchend', onSizerUp);
    };
  }, []);

  const changeStep = (nextStep) => {
    setStep(nextStep);
    if (nextStep === 2) {
      setTimeout(() => {
        // makeImage();
      }, 100);
    }
  };

  const onSizerDown = (e) => {
    e.stopPropagation();
    sizerInfo.isMoveStarted = true;
    sizerInfo.start.x = e.pageX || (e.touches && e.touches[0].pageX);
    sizerInfo.start.y = e.pageY || (e.touches && e.touches[0].pageY);
    sizerInfo.start.width = frameInfo.width;
    sizerInfo.start.height = frameInfo.height;

    document.addEventListener('mousemove', onSizerMove);
    document.addEventListener('touchmove', onSizerMove);

    document.addEventListener('mouseup', onSizerUp);
    document.addEventListener('touchend', onSizerUp);
  };

  return (
    <div className="picture-maker-wrapper g-no-select">
      {!supported && (
        <div className="not-support-content">
          <div className="message">카메라 API를 찾을 수 없습니다.</div>
          <div>
            <Button
              size="md"
              color="white"
              outline
              onClick={() => {
                close();
              }}
            >
              {t('닫기')}
            </Button>
          </div>
        </div>
      )}
      {!allowed && (
        <div className="not-support-content">
          <div className="message">웹브라우저에서 접근할 수 있는 카메라가 없거나, 접근 권한이 허용되지 않았습니다.</div>
          <div>
            <Button
              size="md"
              color="white"
              outline
              onClick={() => {
                close();
              }}
            >
              {t('닫기')}
            </Button>
          </div>
        </div>
      )}
      {allowed && supported && (
        <div className="picture-maker-content">
          <div className="picture-maker-menu">
            <ul>
              <li
                className={step === 0 ? 'selected' : ''}
                onClick={() => {
                  changeStep(0);
                }}
              >
                <span>카메라 세팅</span>
              </li>
              <li className={step === 1 ? 'selected' : ''}>
                <span>이미지 확인</span>
              </li>
              <li className={step === 2 ? 'selected' : ''}>
                <span>위치 조정</span>
              </li>
            </ul>
          </div>
          <div className="preview-content">
            <div className={`video-content ${step === 0 ? 'live' : 'hide'}`}>
              <video ref={video} playsInline autoPlay muted />
            </div>
            <div className="canvas-content">
              <canvas ref={canvas} />
            </div>
            {step === 2 && (
              <div className="frame-content">
                <div
                  style={{
                    width: imageSize.width,
                    height: imageSize.height,
                  }}
                >
                  <div
                    className="frame"
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onTouchStart={onMouseDown}
                    onTouchMove={onMouseMove}
                    style={{
                      top: frameInfo.top,
                      left: frameInfo.left,
                      width: frameInfo.width + 6,
                      height: frameInfo.height + 6,
                    }}
                  >
                    <div className="sizer" onMouseDown={onSizerDown} onTouchStart={onSizerDown} />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="picture-buttons">
            {step === 0 && (
              <div>
                <div className="message">
                  <i className="fas fa-info-circle" /> 카메라 영역을 확인하고, 촬영 버튼을 클릭해주세요.
                </div>
                <div className="buttons">
                  <Button size="sm" color="white" outline onClick={takePhoto}>
                    <i className="fas fa-camera" /> 촬영
                  </Button>
                </div>
              </div>
            )}
            {step === 1 && (
              <div>
                <div className="message">
                  <i className="fas fa-info-circle" /> 이미지를 확인해주세요.
                </div>
                <div className="buttons">
                  <Button
                    size="sm"
                    color="white"
                    outline
                    onClick={() => {
                      changeStep(0);
                    }}
                  >
                    <i className="fas fa-redo" /> 다시 촬영
                  </Button>
                  <Button
                    size="sm"
                    color="white"
                    outline
                    onClick={() => {
                      changeStep(2);
                    }}
                  >
                    <i className="fas fa-arrow-right" /> 다음으로
                  </Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div>
                <div className="message">
                  <i className="fas fa-info-circle" /> 박스의 크기를 조절하거나 이동하여 사진 영역을 선택해주세요.
                </div>
                <div className="crop-preview">
                  <div>
                    <canvas
                      ref={image}
                      style={{
                        width: 120,
                        height: 120,
                      }}
                    />
                  </div>
                </div>
                <div className="buttons px-0 mt-3">
                  <Button
                    size="sm"
                    color="white"
                    outline
                    onClick={() => {
                      changeStep(0);
                    }}
                  >
                    <i className="fas fa-redo" /> 다시 촬영
                  </Button>
                  <Button
                    size="sm"
                    color="white"
                    outline
                    onClick={() => {
                      const imgBase64 = image.current.toDataURL('image/jpeg', 'image/octet-stream');
                      onChange(imgBase64);
                      close();
                    }}
                  >
                    <i className="fas fa-check" /> 선택 완료
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default withTranslation()(PictureMaker);

PictureMaker.propTypes = {
  t: PropTypes.func,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  close: PropTypes.func,
  onChange: PropTypes.func,
};
