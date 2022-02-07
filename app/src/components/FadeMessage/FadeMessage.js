import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import './FadeMessage.scss';

const FadeMessage = ({ className, children, fadeIn, fadeOut, onComplete }) => {
  const [state, setState] = useState({
    show: true,
    className: '',
  });

  useEffect(() => {
    setState({
      show: true,
      className: 'fadein',
    });

    setTimeout(() => {
      setState({
        show: true,
        className: 'fadeout',
      });

      setTimeout(() => {
        setState({
          show: false,
          className: '',
        });
        if (onComplete) {
          onComplete();
        }
      }, fadeOut);
    }, fadeIn);
  }, []);

  return <>{state.show && <div className={`fade-message-wrapper ${className} ${state.className}`}>{children}</div>}</>;
};

export default FadeMessage;

FadeMessage.defaultProps = {
  className: '',
  fadeIn: 2500,
  fadeOut: 500,
};

FadeMessage.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  fadeIn: PropTypes.number,
  fadeOut: PropTypes.number,
  onComplete: PropTypes.func,
};
