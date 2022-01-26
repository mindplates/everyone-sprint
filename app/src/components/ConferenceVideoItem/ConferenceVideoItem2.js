import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { useResizeDetector } from 'react-resize-detector';
import * as bodyPix from '@tensorflow-models/body-pix';
import _, { throttle } from 'lodash';
import PropTypes from 'prop-types';
import Spinner from '@/components/Spinner/Spinner';
import { UserImage } from '@/components';
import './ConferenceVideoItem.scss';

import { BODY_PIX } from '@/constants/constants';

const ConferenceVideoItem2 = (props) => {
  const { t, className, controls, alias, muted, tracking, id, imageType, imageData, pixInfo, filter, stream, supportInfo, setCanvasStream } = props;

  const video = useRef();

  const canvas = useRef();

  const image = useRef();

  const isSetVideo = useRef(false);

  const soundVisualizationFrame = useRef();

  const [isLoading, setIsLoading] = useState(false);

  const [isLoaded, setIsLoaded] = useState(false);

  const [sounds, setSounds] = useState([]);

  const filterData = useRef({
    animationFrame: null,
    filteringReady: false,
    model: null,
    hiddenCanvas: null,
    hiddenCanvasContext: null,
    canvasContext: null,
    width: null,
    height: null,
  });

  const setSoundsThrottled = useMemo(
    () =>
      throttle((array) => {
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

        if (!_.isEqual(sounds, nextSounds)) {
          setSounds(nextSounds);
        }
      }, 100),
    [],
  );

  const loadingModel = () => {
    return bodyPix.load({
      architecture: BODY_PIX.MODELS.MobileNetV1,
      outputStride: BODY_PIX.OUTPUT_STRIDES['16'],
      multiplier: BODY_PIX.MULTIPLIERS['0.5'],
      quantBytes: BODY_PIX.QUANT_BYTES['1'],
    });
  };

  const onResize = useCallback(() => {
    console.log('resize');
  }, []);

  const { ref: element, width, height } = useResizeDetector({ onResize });

  if (1 > 2) {
    console.log(element, width, height, stream);
  }

  const startVideoAnimationFrame = (handler) => {
    if (!filterData.current.animationFrame && filterData.current.animationFrame !== false && handler) {
      filterData.current.animationFrame = requestAnimationFrame(handler);
    }
  };

  const stopVideoAnimationFrame = () => {
    cancelAnimationFrame(filterData.current.animationFrame);
    filterData.current.animationFrame = false;
  };

  const filtering = useCallback(() => {
    filterData.current.animationFrame = null;

    if (!canvas.current || !video.current) {
      startVideoAnimationFrame(filtering);
      return;
    }

    if (video && video.current.readyState === 0) {
      if (video.current) {
        video.current.play();
      }
      startVideoAnimationFrame(filtering);
      return;
    }

    if (!canvas.current || !video.current) {
      startVideoAnimationFrame(filtering);
      return;
    }

    /* RESIZE에서 대체해야함
    if (!filterData.current.hiddenCanvas) {
      filterData.current.hiddenCanvas = new OffscreenCanvas(filterData.current.width, filterData.current.height);
      filterData.current.hiddenCanvasContext = filterData.current.hiddenCanvas.getContext('2d');
      canvas.current.width = filterData.current.width;
      canvas.current.height = filterData.current.height;
      video.current.width = filterData.current.width;
      video.current.height = filterData.current.height;
      filterData.current.canvasContext = canvas.current.getContext('2d');
      filterData.current.canvasContext.clearRect(0, 0, filterData.current.width, filterData.current.height);

      if (setCanvasStream) {
        setCanvasStream(canvas.current.captureStream(25));
      }
    }

     */

    // https://github.com/tensorflow/tfjs-models/blob/master/body-pix/README.md
    if (filterData.current.model && video.current.readyState === 4) {
      filterData.current.model
        .segmentPerson(video.current, {
          internalResolution: 'medium',
          segmentationThreshold: 0.85,
          maxDetections: 1,
          scoreThreshold: 0.3,
          nmsRadius: 20,
        })
        .then((segmentation) => {
          if (pixInfo.type === 'effect' && pixInfo.key === 'blur') {
            if (canvas.current && video.current) {
              bodyPix.drawBokehEffect(canvas.current, video.current, segmentation, pixInfo.value, 13, false);
            }
          }

          if (pixInfo.type === 'image' && filterData.current.canvasContext) {
            const foregroundColor = { r: 0, g: 0, b: 0, a: 255 };
            const backgroundColor = { r: 0, g: 0, b: 0, a: 0 };
            const personMasked = bodyPix.toMask(segmentation, foregroundColor, backgroundColor);
            const maskImage = image.current;

            if (image.current) {
              filterData.current.canvasContext.drawImage(maskImage, 0, 0, filterData.current.width, filterData.current.height);
            }

            const originalOperation = filterData.current.hiddenCanvasContext.globalCompositeOperation;
            filterData.current.hiddenCanvasContext.clearRect(0, 0, filterData.current.width, filterData.current.height);
            filterData.current.hiddenCanvasContext.putImageData(personMasked, 0, 0);
            filterData.current.hiddenCanvasContext.globalCompositeOperation = 'source-in';
            if (video.current) {
              filterData.current.hiddenCanvasContext.drawImage(
                video.current,
                0,
                0,
                video.current.videoWidth,
                video.current.videoHeight,
                0,
                0,
                filterData.current.width,
                filterData.current.height,
              );
              filterData.current.hiddenCanvasContext.globalCompositeOperation = originalOperation;
              filterData.current.canvasContext.drawImage(filterData.current.hiddenCanvas, 0, 0);
            }
          }

          startVideoAnimationFrame(filtering);
        });
    }
  }, [filterData, pixInfo]);

  const setVoiceAnalyser = useCallback(() => {
    if (soundVisualizationFrame.current) {
      cancelAnimationFrame(soundVisualizationFrame.current);
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
      setSoundsThrottled(dataArrayAlt.slice(0));
      soundVisualizationFrame.current = requestAnimationFrame(drawAlt);
    };
    drawAlt();
  }, [stream]);

  const startVideoStream333333 = useCallback(
    async (streamChanged, sizeChanged) => {
      if (stream && (streamChanged || !isSetVideo.current)) {
        isSetVideo.current = true;
        video.current.srcObject = stream;
        video.current.play();
        if (supportInfo?.enabledAudio) {
          setVoiceAnalyser(stream);
        }
      }

      if (pixInfo && pixInfo.enabled) {
        if (!filterData.current.filteringReady || sizeChanged) {
          if (!filterData.current.model) {
            filterData.current.model = await loadingModel();
          }

          const elementWidth = element.current.offsetWidth;
          const elementHeight = element.current.offsetHeight;

          filterData.current.filteringReady = true;
          filterData.current.canvasContext = canvas.current.getContext('2d');
          const rate = video.current.videoHeight / video.current.videoWidth;

          let videoWidth = elementWidth;
          let videoHeight = elementWidth * rate;

          if (videoHeight > elementHeight) {
            videoHeight = elementHeight;
            videoWidth = elementHeight / rate;
          }

          canvas.current.width = videoWidth;
          canvas.current.height = videoHeight;
          video.current.width = videoWidth;
          video.current.height = videoHeight;

          filterData.current.width = videoWidth; // this.video.current.videoWidth;
          filterData.current.height = videoHeight; // this.video.current.videoHeight;

          if (video.current) {
            video.current.play();
          }
        }

        filterData.current.animationFrame = null;
        startVideoAnimationFrame(filtering);
      } else if (filterData.current.filteringReady) {
        filterData.current.filteringReady = false;
        stopVideoAnimationFrame();
      }
    },
    [pixInfo, supportInfo, stream],
  );

  if (1 > 2) {
    console.log(startVideoStream333333);
  }

  const manageAudioVideoAnimationFrame = useCallback(() => {
    if (!isLoaded) {
      return;
    }

    if (!stream) {
      return;
    }

    const getModel = async () => {
      const model = await loadingModel();
      filterData.current.model = model;
    };

    if (supportInfo?.enabledAudio) {
      setVoiceAnalyser();
    }

    if (supportInfo?.enabledVideo && pixInfo?.enabled) {
      if (!filterData.current.model) {
        getModel();
      }

      const elementWidth = element.current.offsetWidth;
      const elementHeight = element.current.offsetHeight;

      filterData.current.canvasContext = canvas.current.getContext('2d');
      const rate = video.current.videoHeight / video.current.videoWidth;

      let videoWidth = elementWidth;
      let videoHeight = elementWidth * rate;

      if (videoHeight > elementHeight) {
        videoHeight = elementHeight;
        videoWidth = elementHeight / rate;
      }

      filterData.current.width = videoWidth;
      filterData.current.height = videoHeight;
      video.current.width = videoWidth;
      video.current.height = videoHeight;
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;

      if (video.current) {
        video.current.play();
      }

      filterData.current.hiddenCanvas = new OffscreenCanvas(videoWidth, videoHeight);
      filterData.current.hiddenCanvasContext = filterData.current.hiddenCanvas.getContext('2d');
      canvas.current.width = videoWidth;
      canvas.current.height = videoHeight;
      video.current.width = videoWidth;
      video.current.height = videoHeight;
      filterData.current.canvasContext = canvas.current.getContext('2d');
      filterData.current.canvasContext.clearRect(0, 0, videoWidth, videoHeight);

      if (setCanvasStream) {
        setCanvasStream(canvas.current.captureStream(25));
      }

      filterData.current.filteringReady = true;

      console.log('START FILTERING');
      stopVideoAnimationFrame();

      setTimeout(() => {
        filterData.current.animationFrame = null;
        startVideoAnimationFrame(filtering);
      }, 100);
    }

    if ((!supportInfo?.enabledVideo || !pixInfo?.enabled) && filterData.current.filteringReady) {
      console.log('STOP FILTERING');
      if (setCanvasStream) {
        setCanvasStream(null);
      }

      if (filterData.current.filteringReady) {
        filterData.current.filteringReady = false;
        stopVideoAnimationFrame();
      }
    }
  }, [pixInfo, supportInfo, stream]);

  useEffect(() => {
    manageAudioVideoAnimationFrame();
  }, [pixInfo, supportInfo, stream, isLoaded]);

  const loaded = () => {
    setIsLoaded(true);
  };

  const startVideoStream = useCallback(() => {
    if (stream) {
      video.current.srcObject = stream;
      video.current.play();
      video.current.removeEventListener('loadeddata', loaded);
      video.current.addEventListener('loadeddata', loaded);
    }
  }, [stream]);

  useEffect(() => {
    startVideoStream();
  }, [stream]);

  useEffect(() => {
    const getModel = async () => {
      const model = await loadingModel();
      filterData.current.model = model;
    };

    if (filter) {
      setIsLoading(true);
      getModel();

      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    }

    return () => {
      setSoundsThrottled.cancel();

      if (video.current && video.current.srcObject) {
        video.current.srcObject.getTracks().forEach((track) => track.stop());
        video.current.srcObject = null;
      }

      stopVideoAnimationFrame();

      cancelAnimationFrame(soundVisualizationFrame.current);
    };
  }, []);

  return (
    <div className={`conference-video-item-wrapper g-no-select ${className}}`} ref={element}>
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
          <img src={pixInfo?.type === 'image' ? pixInfo?.key : ''} alt="background" ref={image} />
        </div>
        <div className="video-canvas">
          <canvas ref={canvas} className={pixInfo?.enabled ? '' : 'd-none'} />
        </div>
        <video className={pixInfo?.enabled ? 'd-none' : ''} id={id} ref={video} autoPlay playsInline muted={muted} />
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
};

export default withTranslation()(ConferenceVideoItem2);

ConferenceVideoItem2.defaultProps = {
  className: '',
  muted: false,
  tracking: true,
};

ConferenceVideoItem2.propTypes = {
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
    enabledVideo: PropTypes.bool,
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
};
