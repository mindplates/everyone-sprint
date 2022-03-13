import React from 'react';
import PropTypes from 'prop-types';
import './BottomButtons.scss';
import { Button } from '@/components';

const BottomButtons = (props) => {
  const { className, size, border } = props;
  const {
    onList,
    onListText,
    onListIcon,
    onInfo,
    onInfoText,
    onInfoIcon,
    onDelete,
    onDeleteText,
    onDeleteIcon,
    onClose,
    onCloseText,
    onCloseIcon,
    onSubmit,
    onSubmitText,
    onSubmitIcon,
    onEdit,
    onEditText,
    onEditIcon,
    onCancel,
    onCancelText,
    onCancelIcon,
  } = props;
  return (
    <div className={`bottom-buttons-wrapper ${className} ${border ? 'has-border' : ''}`}>
      <div className="bottom-liner" />
      <div className="button-content">
        {onDelete && (
          <div className="delete-buttons">
            <Button className="delete-button" type="button" size={size} color="danger" outline onClick={onDelete}>
              <div>
                {onDeleteIcon && (
                  <div className="icon delete-icon">
                    <span>{onDeleteIcon}</span>
                  </div>
                )}
                <div>{onDeleteText}</div>
              </div>
            </Button>
          </div>
        )}
        {onClose && (
          <div className={`close-buttons ${onDelete ? 'ml-3' : ''}`}>
            <Button className="close-button" type="button" size={size} color="warning" outline onClick={onClose}>
              <div>
                {onCloseIcon && (
                  <div className="icon close-icon">
                    <span>{onCloseIcon}</span>
                  </div>
                )}
                <div>{onCloseText}</div>
              </div>
            </Button>
          </div>
        )}
        <div className="other-buttons">
          {onCancel && (
            <Button type="button" size={size} color="white" outline onClick={onCancel}>
              <div>
                {onCancelIcon && (
                  <div className="icon">
                    <span>{onCancelIcon}</span>
                  </div>
                )}
                <div>{onCancelText}</div>
              </div>
            </Button>
          )}
          {onList && (
            <Button type="button" size={size} color="white" outline onClick={onList}>
              <div>
                {onListIcon && (
                  <div className="icon">
                    <span>{onListIcon}</span>
                  </div>
                )}
                <div>{onListText}</div>
              </div>
            </Button>
          )}
          {onInfo && (
            <Button type="button" size={size} color="white" outline onClick={onInfo}>
              <div>
                {onInfoIcon && (
                  <div className="icon">
                    <span>{onInfoIcon}</span>
                  </div>
                )}
                <div>{onInfoText}</div>
              </div>
            </Button>
          )}
          {onEdit && (
            <Button type="button" size={size} color="white" outline onClick={onEdit}>
              <div>
                {onEditIcon && (
                  <div className="icon">
                    <span>{onEditIcon}</span>
                  </div>
                )}
                <div>{onEditText}</div>
              </div>
            </Button>
          )}
          {onSubmit && (
            <Button type="submit" size={size} color="primary">
              <div>
                {onSubmitIcon && (
                  <div className="icon">
                    <span>{onSubmitIcon}</span>
                  </div>
                )}
                <div>{onSubmitText}</div>
              </div>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BottomButtons;

BottomButtons.defaultProps = {
  className: '',
  size: 'md',
  border: true,
  onListText: '목록',
  onListIcon: '', // <i className="far fa-file-alt" />,
  onInfoText: '정보',
  onInfoIcon: '', // <i className="far fa-file-alt" />,
  onDeleteText: '삭제',
  onDeleteIcon: '', // <i className="far fa-trash-alt" />,
  onCloseText: '닫기',
  onCloseIcon: '', // <i className="far fa-trash-alt" />,
  onSubmitText: '등록',
  onSubmitIcon: '', // <i className="far fa-paper-plane" />,
  onEditText: '변경',
  onEditIcon: '', // <i className="fas fa-pen-nib" />,
  onCancelText: '취소',
  onCancelIcon: '', // <i className="fas fa-chevron-left" />,
};

BottomButtons.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  onList: PropTypes.func,
  onListText: PropTypes.string,
  onListIcon: PropTypes.node,
  onInfo: PropTypes.func,
  onInfoText: PropTypes.string,
  onInfoIcon: PropTypes.node,
  onDelete: PropTypes.func,
  onDeleteText: PropTypes.string,
  onDeleteIcon: PropTypes.node,
  onClose: PropTypes.func,
  onCloseText: PropTypes.string,
  onCloseIcon: PropTypes.node,
  onSubmit: PropTypes.bool,
  onSubmitText: PropTypes.string,
  onSubmitIcon: PropTypes.node,
  onEdit: PropTypes.func,
  onEditText: PropTypes.string,
  onEditIcon: PropTypes.node,
  onCancel: PropTypes.func,
  onCancelText: PropTypes.string,
  onCancelIcon: PropTypes.node,
  border: PropTypes.bool,
};
