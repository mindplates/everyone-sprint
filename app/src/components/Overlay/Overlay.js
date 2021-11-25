import React from 'react';
import PropTypes from 'prop-types';
import './Overlay.scss';

class Overlay extends React.PureComponent {
  render() {
    const { children, className, zIndex, onClick } = this.props;

    return (
      <div
        style={{
          zIndex,
        }}
        className={`overlay-wrapper ${className}`}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
      >
        <div>{children}</div>
      </div>
    );
  }
}

Overlay.defaultProps = {
  className: '',
  zIndex: 15,
};

Overlay.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
  zIndex: PropTypes.number,
  onClick: PropTypes.func,
};

export default Overlay;
