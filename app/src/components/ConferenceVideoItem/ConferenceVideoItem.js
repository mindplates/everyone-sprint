import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { UserImage } from '@/components';
import './ConferenceVideoItem.scss';

class ConferenceVideoItem extends React.Component {
  video = createRef();

  canvas = createRef();

  isSetVideo = false;

  drawVisual = null;

  componentDidMount() {
    this.setVideo();
  }

  componentDidUpdate() {
    this.setVideo();
  }

  componentWillUnmount() {
    this.stopStreamAndVideo(this.video);
  }

  stopStreamAndVideo = (video) => {
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  setVideo = () => {
    const { stream } = this.props;
    if (!this.isSetVideo && this.video.current && stream) {
      this.isSetVideo = true;
      this.video.current.srcObject = stream;
      this.setVoiceAnalyser(stream);
    }
  };

  // https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
  setVoiceAnalyser = (stream) => {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    const { width, height } = this.canvas.current;
    const canvasCtx = this.canvas.current.getContext('2d');

    analyser.fftSize = 32;
    const bufferLengthAlt = analyser.frequencyBinCount;
    const dataArrayAlt = new Uint8Array(bufferLengthAlt);
    canvasCtx.clearRect(0, 0, width, height);

    const drawAlt = () => {
      this.drawVisual = requestAnimationFrame(drawAlt);
      analyser.getByteFrequencyData(dataArrayAlt);
      canvasCtx.clearRect(0, 0, width, height);
      canvasCtx.fillRect(0, 0, width, height);
      const barWidth = width / bufferLengthAlt;
      let barHeight;
      let x = 2;

      for (let i = 0; i < bufferLengthAlt; i += 1) {
        barHeight = (dataArrayAlt[i] * 150) / 255;
        canvasCtx.fillStyle = `rgba(255, 193, 7, ${(barHeight / 150) * 1.5} )`;
        canvasCtx.fillRect(x, height - barHeight * 0.8, barWidth - 2, barHeight * 0.8);
        x += barWidth + 4;
      }
    };
    drawAlt();
  };

  render() {
    const { t, className, controls, alias, muted, tracking, id, imageType, imageData, useVideoInfo } = this.props;

    return (
      <div className={`conference-video-item-wrapper ${className} ${useVideoInfo ? '' : 'disable-video-info'} ${tracking ? 'tracking' : ''}`}>
        <div className="video-element">
          <div className="voice-visualizer">
            <canvas ref={this.canvas} />
          </div>
          <video id={id} ref={this.video} autoPlay playsInline muted={muted} />
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
  stream: PropTypes.objectOf(PropTypes.any),
};
