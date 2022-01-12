import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import RadioButton from '@/components/RadioButton/RadioButton';
import { Button, ExitButton, Input } from '@/components';
import './CapabilitiesEditor.scss';

const CapabilitiesEditor = ({ className, metas, capabilities, onChange, t, setOpened }) => {
  const getName = (capability) => {
    if (capability.options?.max) {
      return `${capability.name} (${capability.options?.min} - ${capability.options?.max})`;
    }

    return capability.name;
  };
  const getCapabilityOptions = (capability) => {
    const current = capabilities.find((d) => d.key === capability.key);

    if (Array.isArray(capability.options)) {
      return (
        <div>
          <div>
            <RadioButton
              className="radio"
              size="sm"
              items={capability.options.map((d) => {
                return { key: d, value: t(d) };
              })}
              value={current?.value}
              onClick={(val) => {
                onChange(capability.key, val);
              }}
            />
          </div>
          <div className="clear d-none">
            <Button
              size="sm"
              color="white"
              outline
              rounded
              onClick={() => {
                onChange(capability.key, null);
              }}
            >
              <i className="fas fa-times" />
            </Button>
          </div>
        </div>
      );
    }

    if (!Number.isNaN(capability.options?.max)) {
      return (
        <div>
          <div className="control">
            <Input
              className="range"
              simple
              outline
              type="range"
              size="md"
              value={current?.value}
              onChange={(val) => onChange(capability.key, val)}
              min={Math.round(capability.options?.min)}
              max={Math.round(capability.options?.max)}
              step={capability.options?.step}
              debounce={100}
            />
          </div>
          <div className="clear d-none">
            <Button
              size="sm"
              color="white"
              outline
              rounded
              onClick={() => {
                onChange(capability.key, '');
              }}
            >
              <i className="fas fa-times" />
            </Button>
          </div>
        </div>
      );
    }

    return undefined;
  };

  return (
    <div className={`capabilities-editor-wrapper ${className}`}>
      <div className="title">
        <div className="text">카메라 설정</div>
        <div className="exit-button">
          <ExitButton
            size="xxs"
            color="black"
            onClick={() => {
              setOpened(false);
            }}
          />
        </div>
      </div>
      <div className="content">
        <ul>
          {metas.map((capability) => {
            return (
              <li key={capability.key}>
                <div className="name">{getName(capability)}</div>
                <div className="options">{getCapabilityOptions(capability)}</div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default withTranslation()(CapabilitiesEditor);

CapabilitiesEditor.defaultProps = {
  className: '',
};

CapabilitiesEditor.propTypes = {
  className: PropTypes.string,
  metas: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      name: PropTypes.string,
      options: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.any), PropTypes.objectOf(PropTypes.any)]),
    }),
  ),
  capabilities: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ),
  onChange: PropTypes.func,
  setOpened: PropTypes.func,
  t: PropTypes.func,
};
