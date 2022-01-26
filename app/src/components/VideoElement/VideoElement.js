import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import * as bodyPix from '@tensorflow-models/body-pix';
import { withTranslation } from 'react-i18next';
import { Button, UserImage } from '@/components';
import images from '@/images';
import backgroundSrc from './milky-way-2695569-1920.jpg';
import './VideoElement.scss';

class VideoElement extends React.Component {
  video = createRef();

  canvas = createRef();

  backgroundRef = createRef();

  maskInfo = {
    animationFrame: null,
    init: false,
    model: null,
    offCanvas: null,
    offCtx: null,
    ctx: null,
    width: null,
    height: null,
  };

  // https://storage.googleapis.com/tfjs-models/demos/body-pix/index.html
  constructor(props) {
    super(props);

    this.state = {
      retrying: false,
    };
  }

  componentDidMount() {}

  componentWillUnmount() {
    cancelAnimationFrame(this.maskInfo.animationFrame);
  }

  async componentDidUpdate() {

    const {
      pixInfo,
    } = this.props;

    if (!this.maskInfo.init && this.video && pixInfo.enabled) {
      this.maskInfo.init = true;
      await this.prepareMasking();
      this.video.addEventListener('loadeddata', async (e) => {
        console.log(e.target.offsetWidth);
        this.maskInfo.width = '640'; // e.target.offsetWidth;
        this.maskInfo.height = '480'; // e.target.offsetHeight;
        e.target.width = '640';
        e.target.height = '480';
        console.log('LOADEDDATA', this.maskInfo.width, this.maskInfo.height);
        await this.renderVideo2();
      });
    }
  }

  prepareMasking = async () => {
    this.maskInfo.model = await bodyPix.load({
      architecture: 'ResNet50',
      outputStride: 32,
      quantBytes: 2,
    });

    this.maskInfo.ctx = this.canvas.current.getContext('2d');
  };

  renderVideo = async () => {
    const foregroundColor = { r: 0, g: 0, b: 0, a: 255 };
    const backgroundColor = { r: 0, g: 0, b: 0, a: 0 };
    const background = this.backgroundRef.current;
    const canvas = this.canvas.current;

    if (!this.maskInfo.offCanvas) {
      this.maskInfo.offCanvas = new OffscreenCanvas(this.maskInfo.width, this.maskInfo.height);
      this.maskInfo.offCtx = this.maskInfo.offCanvas.getContext('2d');
      canvas.width = this.maskInfo.width;
      canvas.height = this.maskInfo.height;
    }

    const segmentation = await this.maskInfo.model.segmentPerson(this.video, {
      flipHorizontal: false,
      internalResolution: 'medium',
      segmentationThreshold: 0.7,
    });

    const personMasked = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
    // Draw background first if any
    if (background) {
      this.maskInfo.ctx.drawImage(background, 0, 0, this.maskInfo.width, this.maskInfo.height);
    }

    const oldGCO = this.maskInfo.offCtx.globalCompositeOperation;
    this.maskInfo.offCtx.clearRect(0, 0, this.maskInfo.width, this.maskInfo.height);
    this.maskInfo.offCtx.putImageData(personMasked, 0, 0);
    this.maskInfo.offCtx.globalCompositeOperation = 'source-in';
    this.maskInfo.offCtx.drawImage(this.video, 0, 0);
    // Restore GCO
    this.maskInfo.offCtx.globalCompositeOperation = oldGCO;

    // Copy video with mask on top of background
    this.maskInfo.ctx.drawImage(this.maskInfo.offCanvas, 0, 0);

    // Next frame
    this.maskInfo.animationFrame = requestAnimationFrame(this.renderVideo);
  };

  renderVideo2 = async () => {
    console.log(1);
    const canvas = this.canvas.current;

    if (!this.maskInfo.offCanvas) {
      this.maskInfo.offCanvas = new OffscreenCanvas(this.maskInfo.width, this.maskInfo.height);
      this.maskInfo.offCtx = this.maskInfo.offCanvas.getContext('2d');
      console.log(this.maskInfo.width);
      this.canvas.current.width = this.maskInfo.width;
      this.canvas.current.height = this.maskInfo.height;
      this.maskInfo.ctx = this.canvas.current.getContext('2d');
      this.maskInfo.ctx.clearRect(0, 0, this.maskInfo.width, this.maskInfo.height);
    }

    const segmentation = await this.maskInfo.model.segmentPerson(this.video, {
      internalResolution: 'medium',
      segmentationThreshold: 0.7,
      maxDetections: 5,
      scoreThreshold: 0.3,
      nmsRadius: 20,
    });

    this.video.play();

    bodyPix.drawBokehEffect(canvas, this.video, segmentation, 10, 3, false);

    this.maskInfo.animationFrame = requestAnimationFrame(this.renderVideo2);
  };

  getErrorName = (errorMessage) => {
    const { t } = this.props;

    if (errorMessage.indexOf('NotReadableError') > -1) {
      return t('카메라 및 오디오가 이미 사용중이거나, 찾을 수 없습니다.');
    }

    if (errorMessage.indexOf('NotAllowedError') > -1) {
      return t('카메라와 마이크에 엑세스가 거부 되었습니다. 브라우저 주소 표시줄에서 차단된 카메라 아이콘을 클릭해주세요.');
    }

    return errorMessage;
  };

  // 비디오 필터링 https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Manipulating_video_using_canvas
  // https://www.linkedin.com/pulse/realtime-webcam-background-replacement-browser-nhu-trinh/
  render() {
    const {
      t,
      className,
      videoInfo,
      onRef,
      controls,
      supportInfo,
      alias,
      muted,
      tracking,
      id,
      imageType,
      imageData,
      setUpUserMedia,
      useVideoInfo,
      isPrompt,
      isCameraDenied,
      isMicrophoneDenied,
      pixInfo,
    } = this.props;

    const { retrying } = this.state;

    return (
      <div
        className={`video-element-wrapper ${className} ${useVideoInfo ? '' : 'disable-video-info'} ${tracking ? 'tracking' : ''}`}
        style={{
          width: useVideoInfo ? `${videoInfo.width}px` : null,
          height: useVideoInfo ? `${videoInfo.height}px` : null,
        }}
        ref={this.element}
      >
        <div
          className={`video-element ${isCameraDenied ? 'is-camera-denied' : ''}`}
          style={{
            width: useVideoInfo ? `${videoInfo.videoWidth}px` : null,
            height: useVideoInfo ? `${videoInfo.videoHeight}px` : null,
          }}
        >
          <img src={backgroundSrc} className="d-none" alt="background" height={400} width={400} ref={this.backgroundRef} />
          <video
            id={id}
            className={pixInfo.enabled ? 'd-none' : ''}
            ref={(d) => {
              this.video = d;
              if (onRef) {
                onRef(d);
              }
            }}
            autoPlay
            playsInline
            muted={muted}
            style={{
              width: '640px',
              height: '480px',
            }}
          />
          {pixInfo.enabled && <canvas ref={this.canvas} />}
          {controls && (
            <div className="control-status">
              <span className="audio-status">
                <span>
                  {controls.audio && <i className="fas fa-microphone" />}
                  {!controls.audio && <i className="fas fa-microphone-slash" />}
                </span>
              </span>
              <span className="video-status">
                <span>
                  {controls.video && <i className="fas fa-video" />}
                  {!controls.video && <i className="fas fa-video-slash" />}
                </span>
              </span>
            </div>
          )}
          {alias && (
            <div className="user-info">
              <span className="alias">{alias}</span>
            </div>
          )}
        </div>
        {(!supportInfo || !supportInfo.deviceInfo.supported) && (
          <div className="not-supported-user-media">
            <div>
              <div className="message">
                <div>{this.getErrorName(supportInfo.deviceInfo.errorMessage)}</div>
                {retrying && (
                  <div className="loading">
                    <img src={images.spinner} alt="loading" />
                  </div>
                )}
              </div>
              <Button
                size="sm"
                color="white"
                outline
                onClick={() => {
                  this.setState(
                    {
                      retrying: true,
                    },
                    () => {
                      setTimeout(() => {
                        this.setState({
                          retrying: false,
                        });
                      }, 500);
                    },
                  );
                  setUpUserMedia(true);
                }}
              >
                <i className="fas fa-retweet" /> 다시 시도
              </Button>
            </div>
          </div>
        )}
        {isPrompt && (
          <div className="need-prompt">
            <div>{t('카메라 및 마이크를 허용해주세요.')}</div>
          </div>
        )}
        {(isMicrophoneDenied || isCameraDenied) && (
          <>
            {isMicrophoneDenied && isCameraDenied && <div className="need-permission">{t('카메라와 마이크가 차단되었습니다')}</div>}
            {isMicrophoneDenied && !isCameraDenied && <div className="need-permission">{t('마이크가 차단되었습니다')}</div>}
            {!isMicrophoneDenied && isCameraDenied && <div className="need-permission">{t('카메라가 차단되었습니다')}</div>}
          </>
        )}
        <div className="no-tracking-info">
          <div>
            <UserImage border rounded size="60px" iconFontSize="24px" imageType={imageType} imageData={imageData} />
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(VideoElement);

VideoElement.defaultProps = {
  className: '',
  muted: false,
  tracking: true,
  isPrompt: false,
  isMicrophoneDenied: false,
  isCameraDenied: false,
};

VideoElement.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  onRef: PropTypes.func,
  videoInfo: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
    videoWidth: PropTypes.number,
    videoHeight: PropTypes.number,
  }),
  controls: PropTypes.shape({
    audio: PropTypes.bool,
    video: PropTypes.bool,
  }),
  supportInfo: PropTypes.shape({
    deviceInfo: PropTypes.shape({
      supported: PropTypes.bool,
      errorMessage: PropTypes.string,
      devices: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string,
          name: PropTypes.name,
        }),
      ),
    }),
  }),
  alias: PropTypes.string,
  muted: PropTypes.bool,
  tracking: PropTypes.bool,
  id: PropTypes.string,
  imageType: PropTypes.string,
  imageData: PropTypes.string,
  setUpUserMedia: PropTypes.func,
  useVideoInfo: PropTypes.bool,
  isPrompt: PropTypes.bool,
  isMicrophoneDenied: PropTypes.bool,
  isCameraDenied: PropTypes.bool,
  pixInfo: PropTypes.shape({
    enabled: PropTypes.bool,
    type: PropTypes.string,
    key: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
};
