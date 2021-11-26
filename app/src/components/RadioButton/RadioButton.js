import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';
import { Button } from '@/components';
import './RadioButton.scss';

class RadioButton extends React.PureComponent {
  componentDidMount() {
    ReactTooltip.rebuild();
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  render() {
    const { onClick, className, items, value, rounded, size, outline, disabled } = this.props;

    return (
      <div className={`radio-button-wrapper ${className} ${outline ? 'outline' : ''} ${rounded ? 'rounded' : ''}`}>
        {items.map((item) => {
          return (
            <Button
              size={size}
              key={item.key}
              type="button"
              className={`${value === item.key ? 'selected' : ''} `}
              onClick={() => {
                onClick(item.key);
              }}
              data-tip={(item.tooltip || {}).text}
              data-place={(item.tooltip || {}).place}
              rounded={rounded}
              outline
              color="white"
              disabled={disabled}
            >
              {item.value}
              <div className="liner" />
            </Button>
          );
        })}
      </div>
    );
  }
}

export default RadioButton;

RadioButton.defaultProps = {
  className: '',
  items: [],
  size: 'md',
  outline: false,
  rounded: false,
};

RadioButton.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
      tooltip: PropTypes.shape({
        text: PropTypes.string,
        place: PropTypes.string,
      }),
    }),
  ),
  onClick: PropTypes.func,
  className: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.bool, PropTypes.number, PropTypes.string]),
  size: PropTypes.string,
  outline: PropTypes.bool,
  rounded: PropTypes.bool,
  disabled: PropTypes.bool,
};
