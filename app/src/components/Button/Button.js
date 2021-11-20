import React from 'react';
import PropTypes from 'prop-types';
import { Button as ReactButton } from 'reactstrap';
import ReactTooltip from 'react-tooltip';

class Button extends React.PureComponent {
  componentDidMount() {
    ReactTooltip.rebuild();
  }

  componentDidUpdate() {
    ReactTooltip.rebuild();
  }

  render() {
    const { className, children, shadow, color, rounded, isInherit, ...rest } = this.props;

    return (
      <ReactButton
        color={color}
        {...rest}
        className={`${isInherit ? 'position-relative' : ''} ${className} ${shadow ? '' : 'shadow-none'} ${
          rounded ? 'rounded' : ''
        }`}
      >
        {isInherit && (
          <div className="g-is-inherit">
            <div />
          </div>
        )}
        {children}
      </ReactButton>
    );
  }
}

Button.defaultProps = {
  className: '',
  children: null,
  shadow: true,
  color: 'primary',
  rounded: false,
  size: 'md',
  isInherit: false,
};

Button.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  shadow: PropTypes.bool,
  color: PropTypes.string,
  rounded: PropTypes.bool,
  size: PropTypes.string,
  isInherit: PropTypes.bool,
};

export default Button;
