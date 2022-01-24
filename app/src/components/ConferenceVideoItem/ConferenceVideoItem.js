import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import * as bodyPix from '@tensorflow-models/body-pix';
import { withTranslation } from 'react-i18next';
import { UserImage } from '@/components';
import './ConferenceVideoItem.scss';

class ConferenceVideoItem extends React.Component {
  video = createRef();

  canvas = createRef();

  backgroundRef = createRef();

  videoVisualizationCanvas = createRef();

  isSetVideo = false;

  drawVisual = null;

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

  componentDidMount() {
    this.setVideo();
  }

  async componentDidUpdate() {
    this.setVideo();
  }

  componentWillUnmount() {
    this.stopStreamAndVideo(this.video);
    cancelAnimationFrame(this.drawVisual);
    cancelAnimationFrame(this.maskInfo.animationFrame);
  }

  stopStreamAndVideo = (video) => {
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  setVideo = () => {
    const { stream, pixInfo } = this.props;
    if (!this.isSetVideo && this.video.current && stream) {
      this.isSetVideo = true;
      this.video.current.srcObject = stream;
      this.setVoiceAnalyser(stream);
    }

    if (pixInfo && pixInfo.enabled) {
      console.log(pixInfo);
      if (!this.maskInfo.init) {
        this.maskInfo.init = true;
        bodyPix
          .load({
            architecture: 'MobileNetV1',
            outputStride: 16,
            quantBytes: 2,
          })
          .then((model) => {
            this.maskInfo.model = model;

            this.maskInfo.ctx = this.canvas.current.getContext('2d');
            this.maskInfo.width = this.video.current.videoWidth;
            this.maskInfo.height = this.video.current.videoHeight;

            if (this.video.current) {
              this.video.current.play();
            }

            cancelAnimationFrame(this.maskInfo.animationFrame);
            this.renderVideo();
          });
      }
    } else if (this.maskInfo.init) {
      cancelAnimationFrame(this.maskInfo.animationFrame);
      this.maskInfo.init = false;
      this.maskInfo.model = null;
      this.maskInfo.ctx = null;
    }
  };

  replaceNonHumanWithTransparency = (
    personOrPartSegmentation,
    foreground = {
      r: 0,
      g: 0,
      b: 0,
      a: 0,
    },
    background = {
      r: 0,
      g: 0,
      b: 0,
      a: 255,
    },
    foregroundIds = [1],
  ) => {
    if (Array.isArray(personOrPartSegmentation) && personOrPartSegmentation.length === 0) {
      return null;
    }

    let multiPersonOrPartSegmentation;

    if (!Array.isArray(personOrPartSegmentation)) {
      multiPersonOrPartSegmentation = [personOrPartSegmentation];
    } else {
      multiPersonOrPartSegmentation = personOrPartSegmentation;
    }

    const { width, height } = multiPersonOrPartSegmentation[0];

    // eslint-disable-next-line no-undef
    const bytes = new Uint8ClampedArray(width * height * 4);

    for (let i = 0; i < height; i += 1) {
      for (let j = 0; j < width; j += 1) {
        const n = i * width + j;

        bytes[4 * n + 0] = background.r; // background.r;
        bytes[4 * n + 1] = background.g; // background.g;
        bytes[4 * n + 2] = background.b; // background.b;
        bytes[4 * n + 3] = background.a; // background.a;
        for (let k = 0; k < multiPersonOrPartSegmentation.length; k += 1) {
          if (foregroundIds.some((id) => id === multiPersonOrPartSegmentation[k].data[n])) {
            bytes[4 * n] = foreground.r;
            bytes[4 * n + 1] = foreground.g;
            bytes[4 * n + 2] = foreground.b;
            bytes[4 * n + 3] = foreground.a;
          }
        }
      }
    }
    // eslint-disable-next-line no-undef
    return new ImageData(bytes, width, height);
  };

  renderVideo = () => {
    const { pixInfo, setCanvasStream } = this.props;

    if (!this.maskInfo.offCanvas) {
      this.maskInfo.offCanvas = new OffscreenCanvas(this.maskInfo.width, this.maskInfo.height);
      this.maskInfo.offCtx = this.maskInfo.offCanvas.getContext('2d');
      this.canvas.current.width = this.maskInfo.width;
      this.canvas.current.height = this.maskInfo.height;
      this.video.current.width = this.maskInfo.width;
      this.video.current.height = this.maskInfo.height;
      this.maskInfo.ctx = this.canvas.current.getContext('2d');
      this.maskInfo.ctx.clearRect(0, 0, this.maskInfo.width, this.maskInfo.height);

      if (setCanvasStream) {
        const stream = this.canvas.current.captureStream(25);
        setCanvasStream(stream);
      }
    }

    if (pixInfo.enabled && this.video.current && this.maskInfo.model) {
      if (pixInfo.type === 'effect' && pixInfo.key === 'blur') {
        this.maskInfo.model
          .segmentPerson(this.video.current, {
            internalResolution: 'medium',
            segmentationThreshold: 0.85,
            maxDetections: 5,
            scoreThreshold: 0.3,
            nmsRadius: 20,
          })
          .then((segmentation) => {
            if (this.canvas.current && this.video.current) {
              bodyPix.drawBokehEffect(this.canvas.current, this.video.current, segmentation, pixInfo.value, 13, false);
            }

            this.maskInfo.animationFrame = requestAnimationFrame(this.renderVideo);
          });
      } else if (pixInfo.type === 'image') {
        this.maskInfo.model
          .segmentPerson(this.video.current, {
            internalResolution: 'medium',
            segmentationThreshold: 0.7,
            maxDetections: 5,
            scoreThreshold: 0.7,
            nmsRadius: 20,
          })
          .then((segmentation) => {
            if (1 > 2) {
              const foregroundColor = { r: 0, g: 0, b: 0, a: 0 };
              const backgroundColor = { r: 0, g: 0, b: 0, a: 255 };
              const personMasked = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);

              // https://github.com/tensorflow/tfjs-models/blob/master/body-pix/README.md
              // 마스크 블러링

              if (this.backgroundRef.current) {
                this.backgroundRef.current.width = this.maskInfo.width;
                this.backgroundRef.current.height = this.maskInfo.height;
                bodyPix.drawMask(this.canvas.current, this.video.current, personMasked, 1, 10, false);
              }
            }

            // Draw background first if any

            if (2 > 1) {
              const foregroundColor = { r: 0, g: 0, b: 0, a: 255 };
              const backgroundColor = { r: 0, g: 0, b: 0, a: 0 };
              const personMasked = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);

              if (this.backgroundRef.current) {
                this.maskInfo.ctx.drawImage(this.backgroundRef.current, 0, 0, this.maskInfo.width, this.maskInfo.height);
              }

              const oldGCO = this.maskInfo.offCtx.globalCompositeOperation;
              this.maskInfo.offCtx.clearRect(0, 0, this.maskInfo.width, this.maskInfo.height);

              this.maskInfo.offCtx.putImageData(personMasked, 0, 0);

              this.maskInfo.offCtx.globalCompositeOperation = 'source-in';
              if (this.video.current) {
                this.maskInfo.offCtx.drawImage(this.video.current, 0, 0);
                // Restore GCO
                this.maskInfo.offCtx.globalCompositeOperation = oldGCO;

                // Copy video with mask on top of background
                this.maskInfo.ctx.drawImage(this.maskInfo.offCanvas, 0, 0);
              }
            }

            this.maskInfo.animationFrame = requestAnimationFrame(this.renderVideo);
          });
      }
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

    const { width, height } = this.videoVisualizationCanvas.current;
    const canvasCtx = this.videoVisualizationCanvas.current.getContext('2d');

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
    const { t, className, controls, alias, muted, tracking, id, imageType, imageData, useVideoInfo, pixInfo } = this.props;

    return (
      <div className={`conference-video-item-wrapper ${className} ${useVideoInfo ? '' : 'disable-video-info'} ${tracking ? 'tracking' : ''}`}>
        <div className="video-element">
          <div className="voice-visualizer">
            <canvas ref={this.videoVisualizationCanvas} />
          </div>
          <div className="background-image d-none">
            <img src={pixInfo?.type === 'image' ? pixInfo?.key : ''} alt="background" height={400} width={400} ref={this.backgroundRef} />
          </div>
          <div className="video-canvas">
            <canvas ref={this.canvas} className={pixInfo?.enabled ? '' : 'd-none'} />
          </div>
          <video className={pixInfo?.enabled ? 'd-none' : ''} id={id} ref={this.video} autoPlay playsInline muted={muted} />
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
  pixInfo: PropTypes.shape({
    enabled: PropTypes.bool,
    type: PropTypes.string,
    key: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  setCanvasStream: PropTypes.func,
};
