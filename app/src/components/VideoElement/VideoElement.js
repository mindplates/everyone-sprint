import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Button, UserImage } from '@/components';
import images from '@/images';
import './VideoElement.scss';

class VideoElement extends React.Component {
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
      isDenied,
    } = this.props;

    return (
      <div
        className={`video-element-wrapper ${className} ${useVideoInfo ? '' : 'disable-video-info'} ${tracking ? 'tracking' : ''}`}
        style={{
          width: useVideoInfo ? `${videoInfo.width}px` : null,
          height: useVideoInfo ? `${videoInfo.height}px` : null,
        }}
      >
        <div
          className="video-element"
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
        {supportInfo && supportInfo.supportUserMedia !== null && !supportInfo.supportUserMedia && (
          <div className="not-supported-user-media">
            <div>
              <div className="message">
                미디어를 사용할 수 없습니다
                {supportInfo.retrying && (
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
        {isDenied && <div className="need-permission">{t('카메라 또는 마이크가 차단되었습니다')}</div>}
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
  isDenied: false,
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
    supportUserMedia: PropTypes.bool,
    retrying: PropTypes.bool,
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
  isDenied: PropTypes.bool,
};
