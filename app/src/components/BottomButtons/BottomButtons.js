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
    onDelete,
    onDeleteText,
    onDeleteIcon,
    onSubmit,
    onSubmitText,
    onSubmitIcon,
    onEdit,
    onEditText,
    onEditIcon,
  } = props;
  return (
    <div className={`bottom-buttons-wrapper ${className} ${border ? 'has-top-border' : ''}`}>
      {onDelete && (
        <div className="delete-buttons">
          <Button type="button" size={size} color="danger" onClick={onDelete}>
            {onDeleteIcon} {onDeleteText}
          </Button>
        </div>
      )}
      <div className="other-buttons">
        {onList && (
          <Button type="button" size={size} color="white" outline onClick={onList}>
            {onListIcon} {onListText}
          </Button>
        )}
        {onEdit && (
          <Button type="button" size={size} color="white" outline onClick={onEdit}>
            {onEditIcon} {onEditText}
          </Button>
        )}
        {onSubmit && (
          <Button type="submit" size={size} color="primary">
            {onSubmitIcon} {onSubmitText}
          </Button>
        )}
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
  onListIcon: <i className="fas fa-list" />,
  onDeleteText: '삭제',
  onDeleteIcon: <i className="far fa-trash-alt" />,
  onSubmitText: '등록',
  onSubmitIcon: <i className="far fa-paper-plane" />,
  onEditText: '변경',
  onEditIcon: <i className="fas fa-pen-nib" />,
};

BottomButtons.propTypes = {
  className: PropTypes.string,
  size: PropTypes.string,
  onList: PropTypes.func,
  onListText: PropTypes.string,
  onListIcon: PropTypes.node,
  onDelete: PropTypes.func,
  onDeleteText: PropTypes.string,
  onDeleteIcon: PropTypes.node,
  onSubmit: PropTypes.bool,
  onSubmitText: PropTypes.string,
  onSubmitIcon: PropTypes.node,
  onEdit: PropTypes.func,
  onEditText: PropTypes.string,
  onEditIcon: PropTypes.node,
  border: PropTypes.bool,
};
