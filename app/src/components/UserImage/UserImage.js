import React from 'react';
import PropTypes from 'prop-types';
import './UserImage.scss';

const UserImage = ({ className, imageType, border, imageData, rounded, size, iconFontSize }) => {
  return (
    <div
      className={`user-image-wrapper ${className} ${rounded ? 'image-rounded' : ''} ${border ? 'has-border' : ''}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {imageType === 'image' && <img src={imageData} alt="USER" />}
      {imageType !== 'image' && (
        <div className="icon-text bg-white">
          <div
            style={{
              fontSize: iconFontSize,
            }}
          >
            <i className="fas fa-robot" />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserImage;

UserImage.defaultProps = {
  className: '',
  rounded: false,
  border: false,
  iconFontSize: '25px',
};

UserImage.propTypes = {
  className: PropTypes.string,
  imageType: PropTypes.string,
  imageData: PropTypes.string,
  rounded: PropTypes.bool,
  size: PropTypes.string,
  border: PropTypes.bool,
  iconFontSize: PropTypes.string,
};
