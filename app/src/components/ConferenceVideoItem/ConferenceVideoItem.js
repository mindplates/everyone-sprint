import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { withTranslation } from 'react-i18next';
import { useResizeDetector } from 'react-resize-detector';
import * as bodyPix from '@tensorflow-models/body-pix';
import _, { debounce, throttle } from 'lodash';
import PropTypes from 'prop-types';
import Spinner from '@/components/Spinner/Spinner';
import { UserImage } from '@/components';
import './ConferenceVideoItem.scss';

import { BODY_PIX } from '@/constants/constants';

const spokenDetectionLimit = 80;
const spokenSensitive = 2000;

const ConferenceVideoItem = (props) => {
  const {
    t,
    className,
    controls,
    alias,
    muted,
    tracking,
    id,
    imageType,
    imageData,
    pixInfo,
    filter,
    stream,
    state,
    supportInfo,
    setCanvasStream,
    addSpeak,
    my,
  } = props;

  const video = useRef();

  const canvas = useRef();

  const image = useRef();

  const startSpeakTime = useRef(null);

  const isStopSpoken = useRef(false);

  const soundVisualizationFrame = useRef();

  const [isLoading, setIsLoading] = useState(false);

  const [loadedTime, setLoadedTime] = useState(null);

  const [isLoaded, setIsLoaded] = useState(false);

  const [sounds, setSounds] = useState([]);

  const currentSounds = useRef([]);

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

  const stopSpeak = () => {
    if (startSpeakTime.current) {
      addSpeak(1, Date.now() - startSpeakTime.current);
    }

    startSpeakTime.current = null;
    isStopSpoken.current = false;
  };

  const addSpeakTime = () => {
    if (startSpeakTime.current) {
      addSpeak(0, Date.now() - startSpeakTime.current);
      startSpeakTime.current = Date.now();
    }
  };

  const stopSpeakDebounce = useMemo(() => debounce(stopSpeak, spokenSensitive), []);
  const addSpeakThrottle = useMemo(() => throttle(addSpeakTime, 1000), []);

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

        const sum = nextSounds.reduce((prev, current) => {
          return prev + current;
        });

        if (addSpeak) {
          if (sum > spokenDetectionLimit) {
            if (!startSpeakTime.current) {
              startSpeakTime.current = Date.now();
            } else {
              addSpeakThrottle();
            }
            stopSpeakDebounce.cancel();
            isStopSpoken.current = false;
          }

          if (sum < spokenDetectionLimit && startSpeakTime.current && isStopSpoken.current === false) {
            isStopSpoken.current = true;
            stopSpeakDebounce();
          }
        }

        if (!_.isEqual(currentSounds.current, nextSounds)) {
          currentSounds.current = nextSounds;
          setSounds(nextSounds);
        }
      }, 100),
    [addSpeak],
  );

  useEffect(() => {
    stopSpeakDebounce.cancel();
    if (addSpeak && !controls.audio && startSpeakTime.current) {
      stopSpeak();
    }
  }, [addSpeak, controls.audio]);

  const loadingModel = () => {
    return bodyPix.load({
      architecture: BODY_PIX.MODELS.MobileNetV1,
      outputStride: BODY_PIX.OUTPUT_STRIDES['16'],
      multiplier: BODY_PIX.MULTIPLIERS['0.5'],
      quantBytes: BODY_PIX.QUANT_BYTES['1'],
    });
  };

  const onResize = useCallback(
    (width, height) => {
      if (!filter) {
        return;
      }

      if (!isLoaded) {
        return;
      }

      if (!stream) {
        return;
      }

      if (supportInfo?.enabledVideo && pixInfo?.enabled && filterData.current.filteringReady) {
        const elementWidth = width;
        const elementHeight = height;

        const { width: settingWidth, height: settingHeight } = supportInfo.mediaConfig.video.settings;

        let rate;
        if (settingWidth && settingHeight) {
          rate = settingHeight / settingWidth;
        } else if (video.current.videoHeight > 40 && video.current.videoWidth > 40) {
          rate = video.current.videoHeight / video.current.videoWidth;
        } else {
          rate = 480 / 640;
        }

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
        if (filterData.current.canvasContext) {
          filterData.current.canvasContext.clearRect(0, 0, videoWidth, videoHeight);
        }
      }
    },
    [filter, supportInfo, isLoaded, stream, supportInfo, pixInfo],
  );

  const {
    width,
    height,
    ref: element,
  } = useResizeDetector({
    refreshMode: 'debounce',
    refreshRate: 200,
    onResize,
  });

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
        // video.current.play();
      }
      startVideoAnimationFrame(filtering);
      return;
    }

    if (!canvas.current || !video.current) {
      startVideoAnimationFrame(filtering);
      return;
    }

    if (video.current.width < 40 || video.current.height < 40) {
      startVideoAnimationFrame(filtering);
      return;
    }

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
              if (canvas.current.width > 0 && canvas.current.height > 0) {
                bodyPix.drawBokehEffect(canvas.current, video.current, segmentation, pixInfo.value, 13, false);
              }
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

    if (filter && supportInfo?.enabledVideo && pixInfo?.enabled) {
      if (!filterData.current.model) {
        getModel();
      }

      const elementWidth = element.current.offsetWidth;
      const elementHeight = element.current.offsetHeight;

      filterData.current.canvasContext = canvas.current.getContext('2d');

      const { width: settingWidth, height: settingHeight } = supportInfo.mediaConfig.video.settings;

      let rate;
      if (settingWidth && settingHeight) {
        rate = settingHeight / settingWidth;
      } else if (video.current.videoHeight > 40 && video.current.videoWidth > 40) {
        rate = video.current.videoHeight / video.current.videoWidth;
      } else {
        rate = 480 / 640;
      }

      if (video.current) {
        video.current.play();
      }

      let videoWidth = elementWidth;
      let videoHeight = elementWidth * rate;

      if (videoHeight > elementHeight) {
        videoHeight = elementHeight;
        videoWidth = elementHeight / rate;
      }

      filterData.current.width = videoWidth;
      filterData.current.height = videoHeight;

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

      stopVideoAnimationFrame();

      setTimeout(() => {
        filterData.current.animationFrame = null;
        startVideoAnimationFrame(filtering);
      }, 100);
    }

    if (filter && (!supportInfo?.enabledVideo || !pixInfo?.enabled) && filterData.current.filteringReady) {
      if (setCanvasStream) {
        setCanvasStream(null);
      }

      if (filterData.current.filteringReady) {
        filterData.current.filteringReady = false;
        stopVideoAnimationFrame();
      }
    }
  }, [pixInfo, supportInfo, stream, filter, isLoaded]);

  useEffect(() => {
    manageAudioVideoAnimationFrame();
  }, [pixInfo, supportInfo, stream, isLoaded, filter]);

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

      if (filter && video.current && video.current.srcObject) {
        video.current.srcObject.getTracks().forEach((track) => track.stop());
        video.current.srcObject = null;
      }

      if (filter) {
        stopVideoAnimationFrame();
      }

      cancelAnimationFrame(soundVisualizationFrame.current);
    };
  }, [filter]);

  const size = useMemo(() => {
    if (width < 200) {
      return 'xs';
    }

    if (width < 400) {
      return 'sm';
    }

    if (width < 600) {
      return 'md';
    }

    return 'lg';
  }, [width]);

  const controlPosition = useMemo(() => {
    const result = {
      top: 8,
      right: 8,
    };

    let videoWidth = 0;
    let videoHeight = 0;

    if (video.current) {
      videoWidth = width;
      videoHeight = videoWidth * (video.current.videoHeight / video.current.videoWidth);
      if (videoHeight > height) {
        videoHeight = height;
        videoWidth = videoHeight * (video.current.videoWidth / video.current.videoHeight);
      }
    }

    if (width > videoWidth) {
      result.right = (width - videoWidth) / 2 + 8;
    } else {
      result.right = 8;
    }

    if (videoHeight < height) {
      result.top = (height - videoHeight) / 2 + 8;
    } else {
      result.top = 8;
    }

    return result;
  }, [width, height, loadedTime]);

  return (
    <div className={`conference-video-item-wrapper g-no-select ${className} size-${size}`} ref={element}>
      <div
        className="state-info"
        style={{
          position: 'absolute',
          top: `${controlPosition.top}px`,
          left: `${controlPosition.right}px`,
        }}
      >
        {state}
      </div>
      {isLoading && (
        <div className="loading">
          <div>
            <Spinner />
          </div>
        </div>
      )}
      <div className="video-element">
        {loadedTime && (
          <div
            className="control-status"
            style={{
              position: 'absolute',
              top: `${controlPosition.top}px`,
              right: `${controlPosition.right}px`,
            }}
          >
            <div className="simple-voice-visualizer">
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
            {!my && controls && (
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
        )}
        <div className="background-image d-none">
          <img src={pixInfo?.type === 'image' ? pixInfo?.key : ''} alt="background" ref={image} />
        </div>
        <div className="video-canvas">
          <canvas
            ref={canvas}
            className={pixInfo?.enabled ? '' : 'd-none'}
            onLoadedData={() => {
              setLoadedTime(Date.now());
            }}
          />
        </div>
        <video
          className={pixInfo?.enabled ? 'd-none' : ''}
          id={id}
          ref={video}
          autoPlay
          playsInline
          muted={muted}
          onLoadedData={() => {
            setLoadedTime(Date.now());
          }}
        />
        {alias && (
          <div
            className="user-info"
            style={{
              position: 'absolute',
              bottom: `${controlPosition.top}px`,
            }}
          >
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

export default withTranslation()(ConferenceVideoItem);

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
    mediaConfig: PropTypes.shape({
      video: PropTypes.shape({
        settings: PropTypes.shape({
          width: PropTypes.number,
          height: PropTypes.number,
        }),
      }),
    }),
  }),
  addSpeak: PropTypes.func,
  state: PropTypes.string,
  my: PropTypes.bool,
};
