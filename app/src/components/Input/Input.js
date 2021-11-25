import React from 'react';
import PropTypes from 'prop-types';
import { debounce as debounceFunc } from 'lodash';
import { withTranslation } from 'react-i18next';
import { DEFAULT_INPUT_VALIDATION_MESSAGE, VALIDATIONS } from '@/constants/constants';
import './Input.scss';

class Input extends React.Component {
  control = null;

  static getDerivedStateFromProps(props, state) {
    if (JSON.stringify(props.customInputValidationMessage) !== JSON.stringify(state.customInputValidationMessage)) {
      return {
        customInputValidationMessage: props.customInputValidationMessage,
        inputValidationMessage: { ...DEFAULT_INPUT_VALIDATION_MESSAGE, ...props.customInputValidationMessage },
      };
    }

    return null;
  }

  constructor(props) {
    super(props);
    this.state = {
      focus: false,
      valid: true,
      message: null,
      customInputValidationMessage: {},
      inputValidationMessage: {},
      innerValue: '',
    };
    this.control = React.createRef();
  }

  componentDidMount() {
    const { debounce, onChange, value } = this.props;
    if (debounce > 0) {
      this.onChangeDebounced = debounceFunc(onChange, debounce);
      this.setInnerValue(value);
    }
  }

  componentDidUpdate(prevProps) {
    const { value } = this.props;
    if (prevProps.value !== value) {
      this.setInnerValue(value);
    }
  }

  componentWillUnmount() {
    const { debounce } = this.props;
    if (debounce > 0) {
      this.onChangeDebounced.cancel();
    }
  }

  setInnerValue = (value) => {
    const { innerValue } = this.state;

    if (innerValue !== value) {
      this.setState({
        innerValue: value,
      });
    }
  };

  setFocus = (focus) => {
    this.setState({
      focus,
    });
  };

  setValid = (validity) => {
    const { t } = this.props;
    const { inputValidationMessage } = this.state;

    const invalids = VALIDATIONS.filter((key) => key !== 'valid' && validity[key]);
    this.setState({
      valid: invalids.length < 1,
      message: invalids.length > 0 ? t(inputValidationMessage[invalids[0]]) : null,
    });
  };

  onKeyDown = (e) => {
    if (e.keyCode === 13) {
      const { onEnter } = this.props;
      if (onEnter) onEnter();
    }

    if (e.keyCode === 27) {
      const { onESC } = this.props;
      if (onESC) onESC();
    }
  };

  render() {
    const {
      color,
      className,
      componentClassName,
      label,
      placeholderMessage,
      outline,
      value,
      required,
      type,
      border,
      t,
      tReady,
      customInputValidationMessage,
      externalValidationMessage,
      simple,
      onEnter,
      onESC,
      disabled,
      size,
      spinButton,
      isInherit,
      debounce,
      onChange,
      ...last
    } = this.props;
    const { focus, valid, message, innerValue } = this.state;

    return (
      <div
        className={`input-wrapper text-${color} ${className} ${focus ? 'focus' : ''} ${value ? 'has-value' : ''} ${
          valid ? 'valid' : 'in-valid'
        } ${simple ? 'simple' : ''} ${border ? 'has-border' : ''} ${disabled ? 'disabled' : ''} ${size} ${
          spinButton ? '' : 'no-spin-button'
        } ${outline ? 'outline' : ''}`}
        onClick={() => {
          if (this.control.current) this.control.current.focus();
        }}
      >
        {isInherit && (
          <div className="g-is-inherit">
            <div />
          </div>
        )}
        <div className="input-info">
          {label && <div className="label">{label}</div>}
          {placeholderMessage && <div className="placeholder-message">{placeholderMessage}</div>}
          {(externalValidationMessage || message) && (
            <div className="invalid-message">{externalValidationMessage || message}</div>
          )}
        </div>
        <input
          ref={this.control}
          type={type}
          className={componentClassName}
          disabled={disabled}
          {...last}
          onFocus={() => {
            this.setFocus(true);
          }}
          onBlur={() => {
            this.setFocus(false);
          }}
          onChange={(e) => {
            if (debounce > 0) {
              this.setState({
                innerValue: e.target.value,
              });
              this.onChangeDebounced(e.target.value);
            } else {
              if (onChange) {
                onChange(e.target.value);
              }

              this.setValid(this.control.current.validity);
            }
          }}
          onKeyDown={this.onKeyDown}
          value={debounce > 0 ? innerValue : value}
          required={required}
        />
        <div className="liner" />
      </div>
    );
  }
}

Input.defaultProps = {
  className: '',
  color: 'black',
  componentClassName: '',
  label: '',
  placeholderMessage: '',
  onChange: null,
  value: '',
  required: false,
  type: 'text',
  simple: false,
  border: false,
  size: 'md',
  spinButton: true,
  isInherit: false,
  debounce: 0,
  outline: false,
};

Input.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  color: PropTypes.string,
  componentClassName: PropTypes.string,
  label: PropTypes.string,
  placeholderMessage: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  required: PropTypes.bool,
  type: PropTypes.string,
  customInputValidationMessage: PropTypes.objectOf(PropTypes.any),
  externalValidationMessage: PropTypes.string,
  simple: PropTypes.bool,
  border: PropTypes.bool,
  onEnter: PropTypes.func,
  onESC: PropTypes.func,
  disabled: PropTypes.bool,
  size: PropTypes.string,
  spinButton: PropTypes.bool,
  isInherit: PropTypes.bool,
  debounce: PropTypes.number,
  tReady: PropTypes.bool,
  outline: PropTypes.bool,
};

export default withTranslation()(Input);
