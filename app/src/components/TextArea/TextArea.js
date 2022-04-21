import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { DEFAULT_INPUT_VALIDATION_MESSAGE, VALIDATIONS } from '@/constants/constants';
import './TextArea.scss';

class TextArea extends React.Component {
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
    };
    this.control = React.createRef();
  }

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

  render() {
    const {
      color,
      className,
      componentClassName,
      label,
      placeholderMessage,
      onChange,
      value,
      required,
      t,
      height,
      // eslint-disable-next-line react/prop-types
      tReady,
      simple,
      customInputValidationMessage,
      externalValidationMessage,
      rows,
      showLength,
      maxLength,
      ...last
    } = this.props;
    const { focus, valid, message } = this.state;

    return (
      <div
        className={`text-area-wrapper text-${color} ${className} ${focus ? 'focus' : ''} ${value ? 'has-value' : ''} ${valid ? 'valid' : 'in-valid'} ${
          simple ? 'simple' : ''
        }`}
        onClick={() => {
          if (this.control.current) this.control.current.focus();
        }}
        style={{
          height,
        }}
      >
        <div className="input-info">
          {label && <div className="label">{label}</div>}
          {placeholderMessage && <div className="placeholder-message">{placeholderMessage}</div>}
          {(externalValidationMessage || message) && <div className="invalid-message">{externalValidationMessage || message}</div>}
        </div>
        {showLength && (
          <div className="length-info">
            <div className="icon">
              <span>
                <i className="fas fa-calculator" />
              </span>
            </div>
            <div>
              <span>{value.length}</span>
            </div>
            {maxLength && (
              <div>
                <span className="slash">/</span>
                <span>{maxLength}</span>
              </div>
            )}
          </div>
        )}
        <textarea
          ref={this.control}
          rows={rows}
          className={`${componentClassName} scrollbar`}
          {...last}
          onFocus={() => {
            this.setFocus(true);
          }}
          onBlur={() => {
            this.setFocus(false);
          }}
          onChange={(e) => {
            if (!maxLength || (maxLength && maxLength >= e.target.value.length)) {
              onChange(e.target.value);
            }

            this.setValid(this.control.current.validity);
          }}
          value={value}
          required={required}
          style={{
            height: height || 'auto',
          }}
        >
          {value}
        </textarea>
      </div>
    );
  }
}

TextArea.defaultProps = {
  className: '',
  color: 'black',
  componentClassName: '',
  label: '',
  placeholderMessage: '',
  onChange: null,
  value: '',
  required: false,
  simple: false,
  height: '',
  rows: 2,
  showLength: false,
};

TextArea.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  color: PropTypes.string,
  componentClassName: PropTypes.string,
  label: PropTypes.string,
  placeholderMessage: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
  required: PropTypes.bool,
  customInputValidationMessage: PropTypes.objectOf(PropTypes.any),
  externalValidationMessage: PropTypes.string,
  simple: PropTypes.bool,
  height: PropTypes.string,
  rows: PropTypes.number,
  showLength: PropTypes.bool,
  maxLength: PropTypes.number,
};

export default compose(withTranslation())(TextArea);
