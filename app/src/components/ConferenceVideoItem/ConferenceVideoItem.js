import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { UserImage } from '@/components';
import './ConferenceVideoItem.scss';

class ConferenceVideoItem extends React.Component {
  componentDidMount() {}

  render() {
    const {
      t,
      className,
      onRef,
      controls,

      alias,
      muted,
      tracking,
      id,
      imageType,
      imageData,

      useVideoInfo,
    } = this.props;

    return (
      <div className={`conference-video-item-wrapper ${className} ${useVideoInfo ? '' : 'disable-video-info'} ${tracking ? 'tracking' : ''}`}>
        <div className="video-element">
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
          />
          {controls && (
            <div className="control-status">
              <span className="audio-status" tip={t('aa')}>
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

        <div className="no-tracking-info">
          <div>
            <UserImage border rounded size="60px" iconFontSize="24px" imageType={imageType} imageData={imageData} />
          </div>
        </div>
      </div>
    );
  }
}

export default withTranslation()(ConferenceVideoItem);

ConferenceVideoItem.defaultProps = {
  className: '',
  muted: false,
  tracking: true,
};

ConferenceVideoItem.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  onRef: PropTypes.func,
  controls: PropTypes.shape({
    audio: PropTypes.bool,
    video: PropTypes.bool,
  }),

  alias: PropTypes.string,
  muted: PropTypes.bool,
  tracking: PropTypes.bool,
  id: PropTypes.string,
  imageType: PropTypes.string,
  imageData: PropTypes.string,
  useVideoInfo: PropTypes.bool,
};
