import React, { createRef } from 'react';
import PropTypes from 'prop-types';
import _, { throttle } from 'lodash';
import * as bodyPix from '@tensorflow-models/body-pix';
import { withResizeDetector } from 'react-resize-detector';
import { withTranslation } from 'react-i18next';
import { UserImage } from '@/components';
import { BODY_PIX } from '@/constants/constants';
import Spinner from '@/components/Spinner/Spinner';
import './ConferenceVideoItem.scss';

class ConferenceVideoItem extends React.Component {
  element = createRef();

  video = createRef();

  canvas = createRef();

  backgroundRef = createRef();

  isSetVideo = false;

  init = false;

  soundVisualizationFrame = null;

  filterData = {
    animationFrame: null,
    init: false,
    model: null,
    offCanvas: null,
    offCtx: null,
    ctx: null,
    width: null,
    height: null,
  };

  constructor(props) {
    super(props);

    this.setSoundsThrottle = throttle(this.setSounds, 100);

    this.state = {
      isLoading: false,
      sounds: [],
    };
  }

  async componentDidMount() {
    const { filter } = this.props;

    if (filter) {
      this.setState({
        isLoading: true,
      });

      this.filterData.model = await this.loadingModel();

      setTimeout(() => {
        this.setState({
          isLoading: false,
        });
      }, 1000);
    }
  }

  componentDidUpdate(prevProps) {
    const { pixInfo, stream, width, height } = this.props;

    if (!_.isEqual(pixInfo, prevProps.pixInfo) || !_.isEqual(stream, prevProps.stream)) {
      this.setVideo(stream?.id !== prevProps.stream?.id);
    }

    if (stream && !this.init) {
      this.setVideo();
    }

    if (this.init && width > 0 && height > 0 && (width !== prevProps.width || height !== prevProps.height)) {
      this.setVideo(false, true);
    }
  }

  componentWillUnmount() {
    this.setSoundsThrottle.cancel();
    this.stopStreamAndVideo(this.video);
    cancelAnimationFrame(this.soundVisualizationFrame);
    cancelAnimationFrame(this.filterData.animationFrame);
  }

  stopStreamAndVideo = (video) => {
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
  };

  setSounds = (array) => {
    const { sounds } = this.state;

    const nextSounds = [];
    const unit = Math.ceil(array.length / 4);
    const max = 255 * unit;

    for (let i = 0; i < array.length; i += 1) {
      const index = i === 0 ? 0 : Math.floor(i / unit);
      if (!nextSounds[index]) {
        nextSounds[index] = 0;
      }
      nextSounds[index] += array[i];
    }

    for (let i = 0; i < nextSounds.length; i += 1) {
      nextSounds[i] = Math.round(nextSounds[i] > 0 ? (nextSounds[i] / max) * 100 : 0);
    }

    if (!_.isEqual(nextSounds, sounds)) {
      this.setState({
        sounds: nextSounds,
      });
    }
  };

  loadingModel = () => {
    return bodyPix.load({
      architecture: BODY_PIX.MODELS.MobileNetV1,
      outputStride: BODY_PIX.OUTPUT_STRIDES['16'],
      multiplier: BODY_PIX.MULTIPLIERS['0.5'],
      quantBytes: BODY_PIX.QUANT_BYTES['1'],
    });
  };

  setVideo = async (streamChanged, sizeChanged) => {
    this.init = true;
    const { stream, pixInfo, supportInfo } = this.props;

    const canvas = this.canvas.current;
    const video = this.video.current;

    if (streamChanged || !this.isSetVideo) {
      this.isSetVideo = true;
      this.video.current.srcObject = stream;
      this.video.current.play();
      if (supportInfo?.enabledAudio) {
        this.setVoiceAnalyser(stream);
      }
    }

    if (pixInfo && pixInfo.enabled) {
      if (!this.filterData.init || sizeChanged) {
        if (!this.filterData.model) {
          this.filterData.model = await this.loadingModel();
        }

        const elementWidth = this.element.current.offsetWidth;
        const elementHeight = this.element.current.offsetHeight;

        this.filterData.init = true;
        this.filterData.ctx = this.canvas.current.getContext('2d');
        const rate = this.video.current.videoHeight / this.video.current.videoWidth;

        let videoWidth = elementWidth;
        let videoHeight = elementWidth * rate;

        if (videoHeight > elementHeight) {
          videoHeight = elementHeight;
          videoWidth = elementHeight / rate;
        }

        canvas.width = videoWidth;
        canvas.height = videoHeight;
        video.width = videoWidth;
        video.height = videoHeight;

        this.filterData.width = videoWidth; // this.video.current.videoWidth;
        this.filterData.height = videoHeight; // this.video.current.videoHeight;

        if (this.video.current) {
          this.video.current.play();
        }

        if (this.filterData.animationFrame) {
          cancelAnimationFrame(this.filterData.animationFrame);
        }

        this.filtering();
      }
    } else if (this.filterData.init) {
      this.filterData.init = false;
      if (this.filterData.animationFrame) {
        cancelAnimationFrame(this.filterData.animationFrame);
      }
      this.filterData.ctx = null;
    }
  };

  filtering = () => {
    const { pixInfo, setCanvasStream } = this.props;

    const canvas = this.canvas.current;
    const video = this.video.current;

    if (!canvas || !video) {
      this.filterData.animationFrame = requestAnimationFrame(this.filtering);
      return;
    }

    if (video && video.readyState === 0) {
      if (this.video.current) {
        this.video.current.play();
      }
      this.filterData.animationFrame = requestAnimationFrame(this.filtering);
      return;
    }

    if (!this.filterData.offCanvas) {
      this.filterData.offCanvas = new OffscreenCanvas(this.filterData.width, this.filterData.height);
      this.filterData.offCanvas.width = this.filterData.width;
      this.filterData.offCanvas.height = this.filterData.height;
      this.filterData.offCtx = this.filterData.offCanvas.getContext('2d');
      canvas.width = this.filterData.width;
      canvas.height = this.filterData.height;
      video.width = this.filterData.width;
      video.height = this.filterData.height;
      this.filterData.ctx = this.canvas.current.getContext('2d');
      this.filterData.ctx.clearRect(0, 0, this.filterData.width, this.filterData.height);

      if (setCanvasStream) {
        const stream = this.canvas.current.captureStream(25);
        setCanvasStream(stream);
      }
    }

    // https://github.com/tensorflow/tfjs-models/blob/master/body-pix/README.md
    if (this.filterData.model && video.readyState === 4) {
      this.filterData.model
        .segmentPerson(video, {
          internalResolution: 'medium',
          segmentationThreshold: 0.85,
          maxDetections: 1,
          scoreThreshold: 0.3,
          nmsRadius: 20,
        })
        .then((segmentation) => {
          if (pixInfo.type === 'effect' && pixInfo.key === 'blur') {
            bodyPix.drawBokehEffect(canvas, video, segmentation, pixInfo.value, 13, false);
          }

          if (pixInfo.type === 'image' && this.filterData.ctx) {
            const foregroundColor = { r: 0, g: 0, b: 0, a: 255 };
            const backgroundColor = { r: 0, g: 0, b: 0, a: 0 };
            const personMasked = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
            const image = this.backgroundRef.current;

            if (this.backgroundRef.current) {
              this.filterData.ctx.drawImage(image, 0, 0, this.filterData.width, this.filterData.height);
            }

            const originalOperation = this.filterData.offCtx.globalCompositeOperation;
            this.filterData.offCtx.clearRect(0, 0, this.filterData.width, this.filterData.height);
            this.filterData.offCtx.putImageData(personMasked, 0, 0);
            this.filterData.offCtx.globalCompositeOperation = 'source-in';
            if (this.video.current) {
              this.filterData.offCtx.drawImage(
                this.video.current,
                0,
                0,
                this.video.current.videoWidth,
                this.video.current.videoHeight,
                0,
                0,
                this.filterData.width,
                this.filterData.height,
              );
              this.filterData.offCtx.globalCompositeOperation = originalOperation;
              this.filterData.ctx.drawImage(this.filterData.offCanvas, 0, 0);
            }
          }

          this.filterData.animationFrame = requestAnimationFrame(this.filtering);
        });
    }
  };

  setVoiceAnalyser = (stream) => {
    if (this.soundVisualizationFrame) {
      cancelAnimationFrame(this.soundVisualizationFrame);
    }

    // https://developer.mozilla.org/ko/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
    // https://developer.mozilla.org/ko/docs/Web/API/AnalyserNode/minDecibels
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    // analyser.minDecibels = -55;
    analyser.minDecibels = -90;
    analyser.maxDecibels = -10;
    analyser.smoothingTimeConstant = 0.85;

    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0;

    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);
    analyser.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    analyser.fftSize = 32;
    const bufferLengthAlt = analyser.frequencyBinCount;
    const dataArrayAlt = new Uint8Array(bufferLengthAlt);

    const drawAlt = () => {
      analyser.getByteFrequencyData(dataArrayAlt);
      this.setSoundsThrottle(dataArrayAlt);
      this.soundVisualizationFrame = requestAnimationFrame(drawAlt);
    };
    drawAlt();
  };

  render() {
    const { t, className, controls, alias, muted, tracking, id, imageType, imageData, pixInfo } = this.props;
    const { isLoading, sounds } = this.state;

    return (
      <div className={`conference-video-item-wrapper g-no-select ${className}}`} ref={this.element}>
        {isLoading && (
          <div className="loading">
            <div>
              <Spinner />
            </div>
          </div>
        )}
        <div className="video-element">
          <div className="control-status">
            <div className="simple-voice-visualizer">
              <div className="icon">
                <div>
                  <i className="fas fa-volume-off" />
                </div>
              </div>
              <div className="values">
                {sounds.map((value, inx) => {
                  return (
                    <div key={inx}>
                      <div
                        style={{
                          height: `${value}%`,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
            {controls && (
              <>
                <div className="audio-status" data-tip={controls.audio ? '' : t('마이크 꺼짐')}>
                  <div className="icon audio">
                    <div>
                      <i className="fas fa-microphone" />
                      {!controls.audio && (
                        <div className="slash">
                          <div />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="video-status">
                  <div className="icon video">
                    <div>
                      <i className="fas fa-video" />
                      {!controls.video && (
                        <div className="slash">
                          <div />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="background-image d-none">
            <img
              src={pixInfo?.type === 'image' ? pixInfo?.key : ''}
              alt="background"
              height={this.filterData.height}
              width={this.filterData.width}
              ref={this.backgroundRef}
            />
          </div>
          <div className="video-canvas">
            <canvas ref={this.canvas} className={pixInfo?.enabled ? '' : 'd-none'} />
          </div>
          <video className={pixInfo?.enabled ? 'd-none' : ''} id={id} ref={this.video} autoPlay playsInline muted={muted} />
          {alias && (
            <div className="user-info">
              <span className="alias">{alias}</span>
            </div>
          )}
        </div>
        {!tracking && (
          <div className="no-tracking-info">
            <div>
              <UserImage border rounded size="60px" iconFontSize="24px" imageType={imageType} imageData={imageData} />
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withResizeDetector(withTranslation()(ConferenceVideoItem));

ConferenceVideoItem.defaultProps = {
  className: '',
  muted: false,
  tracking: true,
};

ConferenceVideoItem.propTypes = {
  id: PropTypes.string,
  t: PropTypes.func,
  className: PropTypes.string,
  filter: PropTypes.bool,
  controls: PropTypes.shape({
    audio: PropTypes.bool,
    video: PropTypes.bool,
  }),
  alias: PropTypes.string,
  muted: PropTypes.bool,
  tracking: PropTypes.bool,
  imageType: PropTypes.string,
  imageData: PropTypes.string,
  stream: PropTypes.objectOf(PropTypes.any),
  setCanvasStream: PropTypes.func,
  pixInfo: PropTypes.shape({
    enabled: PropTypes.bool,
    type: PropTypes.string,
    key: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  supportInfo: PropTypes.shape({
    enabledAudio: PropTypes.bool,
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
  width: PropTypes.number,
  height: PropTypes.number,
};
