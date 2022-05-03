import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { compose } from 'recompose';
import PropTypes from 'prop-types';
import { Button, ExitButton, IconSelector, ImageMaker, PictureMaker, Popup, TextMaker } from '@/components';
import { UserPropTypes } from '@/proptypes';
import './UserPictureEditor.scss';

const UserPictureEditor = ({ t, info, onChangeImageData }) => {
  const [iconMakerType, setIconMakerType] = useState(null);

  return (
    <>
      <div className="user-picture-editor-wrapper">
        <div className="preview">
          <div className="preview-content">
            {info.imageType && (
              <ExitButton
                size="xxs"
                color="black"
                className="remove-image-button"
                onClick={() => {
                  onChangeImageData('', '');
                }}
              />
            )}
            {!info.imageType && (
              <div className="preview-image">
                <i className="fas fa-robot" />
              </div>
            )}
            {info.imageType && info.imageType === 'image' && (
              <div className="preview-image">
                <img src={info.imageData} alt="USER" />
              </div>
            )}
            {info.imageType && info.imageType === 'text' && <div className="avatar-text">{info.imageData}</div>}
            {info.imageType && info.imageType === 'icon' && (
              <div className="avatar-icon">
                <span>
                  <i className={info.imageData.icon} />
                </span>
              </div>
            )}
          </div>
        </div>
        <div className="picture-controls">
          <Button
            size="sm"
            color="white"
            outline
            rounded
            onClick={() => {
              setIconMakerType('camera');
            }}
            data-tip={t('사진 찍기')}
          >
            <i className="fas fa-camera-retro" />
          </Button>
          <Button
            size="sm"
            color="white"
            outline
            rounded
            onClick={() => {
              setIconMakerType('imageMaker');
            }}
            data-tip={t('이미지 업로드')}
          >
            <i className="fas fa-upload" />
          </Button>
          <Button
            size="sm"
            color="white"
            outline
            rounded
            onClick={() => {
              setIconMakerType('iconSelector');
            }}
            data-tip={t('아이콘 선택')}
          >
            <i className="fas fa-icons" />
          </Button>
          <Button
            size="sm"
            color="white"
            outline
            rounded
            onClick={() => {
              setIconMakerType('textMaker');
            }}
            data-tip={t('문자')}
          >
            <i className="fas fa-font" />
          </Button>
        </div>
      </div>
      {iconMakerType === 'camera' && (
        <Popup
          title={t('사진 찍기')}
          open
          setOpen={() => {
            setIconMakerType(null);
          }}
        >
          <PictureMaker
            close={() => {
              setIconMakerType(null);
            }}
            onChange={(d) => {
              onChangeImageData('image', d);
            }}
          />
        </Popup>
      )}
      {iconMakerType === 'imageMaker' && (
        <Popup
          title={t('이미지 등록')}
          open
          setOpen={() => {
            setIconMakerType(null);
          }}
        >
          <ImageMaker
            close={() => {
              setIconMakerType(null);
            }}
            onChange={(d) => {
              onChangeImageData('image', d);
            }}
          />
        </Popup>
      )}
      {iconMakerType === 'textMaker' && (
        <Popup
          title={t('텍스트 입력')}
          size="sm"
          open
          setOpen={() => {
            setIconMakerType(null);
          }}
        >
          <TextMaker
            close={() => {
              setIconMakerType(null);
            }}
            onChange={(d) => {
              onChangeImageData('text', d);
            }}
          />
        </Popup>
      )}
      {iconMakerType === 'iconSelector' && (
        <Popup
          title={t('아이콘 선택')}
          open
          setOpen={() => {
            setIconMakerType(null);
          }}
        >
          <IconSelector
            close={() => {
              setIconMakerType(null);
            }}
            onChange={(d) => {
              onChangeImageData('icon', d);
            }}
          />
        </Popup>
      )}
    </>
  );
};

export default compose(withRouter, withTranslation())(UserPictureEditor);

UserPictureEditor.defaultProps = {};

UserPictureEditor.propTypes = {
  t: PropTypes.func,
  info: UserPropTypes,
  onChangeImageData: PropTypes.func,
};
