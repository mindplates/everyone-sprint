import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Block, BlockRow, Label, Popup, Selector } from '@/components';
import './MediaDeviceConfigPopup.scss';

const labelMinWidth = '140px';

class MediaDeviceConfigPopup extends React.Component {
  permissions = {
    microphone: null,
    camera: null,
  };

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
    next[key] = value;

    setMediaConfig(next);
  };

  getDeviceList = (devices, kind) => {
    if (devices.filter((device) => device.deviceId && device.kind === kind).length > 0) {
      return devices
        .filter((device) => device.deviceId && device.kind === kind)
        .map((device) => {
          return {
            key: device.deviceId,
            value: device.label,
          };
        });
    }

    return [
      {
        deviceId: null,
        label: '디바이스 없음',
      },
    ];
  };

  render() {
    const { devices, mediaConfig, setOpen, t } = this.props;
    const { configTabs, tab, resolutions } = this.state;

    return (
      <Popup
        title="설정"
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
                  <BlockRow className="mb-3">
                    <Label minWidth={labelMinWidth}>{t('마이크')}</Label>
                    <Selector
                      outline
                      size="md"
                      items={this.getDeviceList(devices, 'audioinput')}
                      value={mediaConfig.audioinput}
                      onChange={(val) => {
                        this.onChangeMediaConfig('audioinput', val);
                      }}
                      minWidth="200px"
                    />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('스피커')}</Label>
                    <Selector
                      outline
                      size="md"
                      items={this.getDeviceList(devices, 'audiooutput')}
                      value={mediaConfig.audiooutput}
                      onChange={(val) => {
                        this.onChangeMediaConfig('audiooutput', val);
                      }}
                      minWidth="200px"
                    />
                  </BlockRow>
                </Block>
              )}
              {tab === 'video' && (
                <Block>
                  <BlockRow className="mb-3">
                    <Label minWidth={labelMinWidth}>{t('카메라')}</Label>
                    <Selector
                      outline
                      size="md"
                      items={this.getDeviceList(devices, 'videoinput')}
                      value={mediaConfig.videoinput}
                      onChange={(val) => {
                        this.onChangeMediaConfig('videoinput', val);
                      }}
                      minWidth="200px"
                    />
                  </BlockRow>
                  <BlockRow className="mb-3">
                    <Label minWidth={labelMinWidth}>{t('전송 시 해상도 (최대)')}</Label>
                    <Selector
                      outline
                      size="md"
                      items={resolutions}
                      value={mediaConfig.sendResolution}
                      onChange={(val) => {
                        this.onChangeMediaConfig('sendResolution', val);
                      }}
                      minWidth="200px"
                    />
                  </BlockRow>
                  <BlockRow>
                    <Label minWidth={labelMinWidth}>{t('수신 시 해상도 (최대)')}</Label>
                    <Selector
                      outline
                      size="md"
                      items={resolutions}
                      value={mediaConfig.receiveResolution}
                      onChange={(val) => {
                        this.onChangeMediaConfig('receiveResolution', val);
                      }}
                      minWidth="200px"
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

export default withTranslation()(MediaDeviceConfigPopup);

MediaDeviceConfigPopup.propTypes = {
  t: PropTypes.func,
  devices: PropTypes.arrayOf(
    PropTypes.shape({
      deviceId: PropTypes.string,
      groupId: PropTypes.string,
      kind: PropTypes.string,
      label: PropTypes.string,
    }),
  ),
  mediaConfig: PropTypes.shape({
    audiooutput: PropTypes.string,
    audioinput: PropTypes.string,
    videoinput: PropTypes.string,
    sendResolution: PropTypes.number,
    receiveResolution: PropTypes.number,
  }),
  setMediaConfig: PropTypes.func,
  setOpen: PropTypes.func,
};
