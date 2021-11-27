import React from 'react';
import PropTypes from 'prop-types';
import './UserImage.scss';

const UserImage = ({ className, imageType, imageData, rounded, size }) => {
  return (
    <div
      className={`user-image-wrapper ${className}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {imageType === 'image' && <img className={`${rounded ? 'image-rounded' : ''}`} src={imageData} alt="USER" />}
      {imageType !== 'image' && <i className="fas fa-robot" />}
    </div>
  );
};

export default UserImage;

UserImage.defaultProps = {
  className: '',
  rounded: false,
};

UserImage.propTypes = {
  className: PropTypes.string,
  imageType: PropTypes.string,
  imageData: PropTypes.string,
  rounded: PropTypes.bool,
  size: PropTypes.string,
};
