import React from 'react';
import PropTypes from 'prop-types';
import './Overlay.scss';

class Overlay extends React.PureComponent {
  render() {
    const { children, className, zIndex } = this.props;

    return (
      <div
        style={{
          zIndex,
        }}
        className={`overlay-wrapper ${className}`}
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
};

export default Overlay;
