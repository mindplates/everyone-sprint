import React from 'react';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { Block, BlockRow, Label, Popup, Selector } from '@/components';
import './MediaDeviceConfigPopup.scss';

const labelMinWidth = '150px';

class MediaDeviceConfigPopup extends React.Component {
  constructor(props) {
    super(props);
    const { t } = props;

    this.state = {
      configTabs: [
        {
          key: 'audio',
          value: t('오디오'),
        },
        {
          key: 'video',
          value: t('영상'),
        },
      ],
      tab: 'audio',
      resolutions: [
        {
          key: 360,
          value: '360p',
        },
        {
          key: 720,
          value: '720p',
        },
      ],
    };
  }

  onChangeMediaConfig = (key, value) => {
    const { mediaConfig, setMediaConfig } = this.props;
    const next = { ...mediaConfig };
    _.set(next, key, value);
    setMediaConfig(next);
  };

  getDeviceList = (devices, kind) => {
    const { t } = this.props;
    const list = devices.filter((device) => device.deviceId && device.kind === kind && device.deviceId);

    if (list.length > 0) {
      return devices
        .filter((device) => device.deviceId && device.kind === kind && device.deviceId)
        .map((device) => {
          return {
            key: device.deviceId,
            value: device.label,
          };
        });
    }

    return [
      {
        key: null,
        value: t('디바이스 없음'),
      },
    ];
  };

  render() {
    const { devices, mediaConfig, setOpen, t } = this.props;
    const { configTabs, tab, resolutions } = this.state;

    return (
      <Popup
        title={t('설정')}
        className="device-config-popup-wrapper"
        size="md"
        open
        setOpen={() => {
          setOpen(false);
        }}
      >
        <div className="device-config-popup">
          <div>
            <div className="tabs">
              {configTabs.map((d) => {
                return (
                  <div
                    key={d.key}
                    className={tab === d.key ? 'selected' : ''}
                    onClick={() => {
                      this.setState({
                        tab: d.key,
                      });
                    }}
                  >
                    {d.value}
                  </div>
                );
              })}
            </div>
            <div className="config-content">
              {tab === 'audio' && (
                <Block>
                  <BlockRow className="mb-1 mb-md-3">
                    <Label minWidth={labelMinWidth}>{t('마이크')}</Label>
                    <Selector
                      className="selector"
                      outline
                      size="md"
                      items={this.getDeviceList(devices, 'audioinput')}
                      value={mediaConfig.audio.deviceId}
                      onChange={(val) => {
                        this.onChangeMediaConfig('audio.deviceId', val);
                      }}
                    />
                  </BlockRow>
                  <BlockRow className="d-none">
                    <Label minWidth={labelMinWidth}>{t('스피커')}</Label>
                    <Selector
                      className="selector"
                      outline
                      size="md"
                      items={this.getDeviceList(devices, 'audiooutput')}
                      value={mediaConfig.speaker.deviceId}
                      onChange={(val) => {
                        this.onChangeMediaConfig('speaker.deviceId', val);
                      }}
                    />
                  </BlockRow>
                </Block>
              )}
              {tab === 'video' && (
                <Block>
                  <BlockRow className="mb-1 mb-md-3">
                    <Label minWidth={labelMinWidth}>{t('카메라')}</Label>
                    <Selector
                      className="selector"
                      outline
                      size="md"
                      items={this.getDeviceList(devices, 'videoinput')}
                      value={mediaConfig.video.deviceId}
                      onChange={(val) => {
                        this.onChangeMediaConfig('video.deviceId', val);
                      }}
                    />
                  </BlockRow>
                  <BlockRow className="mb-1 mb-md-3">
                    <Label minWidth={labelMinWidth}>{t('전송 시 해상도 (최대)')}</Label>
                    <Selector
                      className="selector"
                      outline
                      size="md"
                      items={resolutions}
                      value={mediaConfig.sendResolution}
                      onChange={(val) => {
                        this.onChangeMediaConfig('sendResolution', val);
                      }}
                    />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('수신 시 해상도 (최대)')}</Label>
                    <Selector
                      className="selector"
                      outline
                      size="md"
                      items={resolutions}
                      value={mediaConfig.receiveResolution}
                      onChange={(val) => {
                        this.onChangeMediaConfig('receiveResolution', val);
                      }}
                    />
                  </BlockRow>
                </Block>
              )}
            </div>
          </div>
        </div>
      </Popup>
    );
  }
}

export default compose(withTranslation())(MediaDeviceConfigPopup);

MediaDeviceConfigPopup.propTypes = {
  t: PropTypes.func,
  setMediaConfig: PropTypes.func,
  setOpen: PropTypes.func,
  devices: PropTypes.arrayOf(
    PropTypes.shape({
      deviceId: PropTypes.string,
      groupId: PropTypes.string,
      kind: PropTypes.string,
      label: PropTypes.string,
    }),
  ),
  mediaConfig: PropTypes.shape({
    speaker: PropTypes.shape({
      deviceId: PropTypes.string,
    }),
    audio: PropTypes.shape({
      deviceId: PropTypes.string,
      settings: PropTypes.objectOf(PropTypes.any),
      capabilities: PropTypes.arrayOf(PropTypes.any),
    }),
    video: PropTypes.shape({
      deviceId: PropTypes.string,
      settings: PropTypes.objectOf(PropTypes.any),
      capabilities: PropTypes.arrayOf(PropTypes.any),
    }),
    sendResolution: PropTypes.number,
    receiveResolution: PropTypes.number,
  }),
};
