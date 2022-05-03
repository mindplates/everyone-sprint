import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import './UserImage.scss';

const UserImage = ({ className, imageType, border, imageData, rounded, size, iconFontSize }) => {
  const userImageData = useMemo(() => {
    let result = imageData;
    if (imageType === 'icon' && imageData && typeof imageData === 'string') {
      result = JSON.parse(imageData);
    }

    return result;
  }, [imageType, imageData]);

  return (
    <div
      className={`user-image-wrapper ${className} ${rounded ? 'image-rounded' : ''} ${border ? 'has-border' : ''}`}
      style={{
        width: size,
        height: size,
      }}
    >
      {imageData && imageType === 'image' && <img src={imageData} alt="USER" />}
      {imageData && imageType === 'icon' && userImageData.type === 'fontAwesome' && (
        <span
          style={{
            fontSize: iconFontSize,
          }}
        >
          <span>
            <i className={userImageData.icon} />
          </span>
        </span>
      )}
      {imageData && imageType === 'text' && (
        <span
          style={{
            fontSize: iconFontSize,
          }}
        >
          <span>{userImageData}</span>
        </span>
      )}
      {!imageData && (
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
  imageData: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  rounded: PropTypes.bool,
  size: PropTypes.string,
  border: PropTypes.bool,
  iconFontSize: PropTypes.string,
};
