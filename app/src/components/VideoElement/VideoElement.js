import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Button, UserImage } from '@/components';
import images from '@/images';
import './VideoElement.scss';

class VideoElement extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      retrying: false,
    };
  }

  componentDidMount() {}

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
    } = this.props;

    const { retrying } = this.state;

    return (
      <div
        className={`video-element-wrapper ${className} ${useVideoInfo ? '' : 'disable-video-info'} ${tracking ? 'tracking' : ''}`}
        style={{
          width: useVideoInfo ? `${videoInfo.width}px` : null,
          height: useVideoInfo ? `${videoInfo.height}px` : null,
        }}
      >
        <div
          className={`video-element ${isCameraDenied ? 'is-camera-denied' : ''}`}
          style={{
            width: useVideoInfo ? `${videoInfo.videoWidth}px` : null,
            height: useVideoInfo ? `${videoInfo.videoHeight}px` : null,
          }}
        >
          <video
            id={id}
            ref={(d) => {
              if (onRef) {
                onRef(d);
              }
            }}
            autoPlay
            playsInline
            muted={muted}
            /*
            onLoadedMetadata={(e) => {
              console.log(e, e.target, e.target.videoWidth);
              console.log(e, e.target, e.target.videoHeight);
            }}
            onLoadedData={(e) => {
              console.log(e);
            }}
             */
          />
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
                <div>{t('카메라 및 오디오를 찾을 수 없거나, 지원하지 않는 브라우저입니다.')}</div>
                {supportInfo.deviceInfo.errorName && <div className="small">({supportInfo.deviceInfo.errorName})</div>}
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
      errorName: PropTypes.string,
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
};
