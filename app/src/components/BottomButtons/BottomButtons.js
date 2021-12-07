import React from 'react';
import PropTypes from 'prop-types';
import './BottomButtons.scss';
import { Button } from '@/components';

const BottomButtons = (props) => {
  const { className, size, border } = props;
  const { onList, onListText, onListIcon, onDelete, onDeleteText, onDeleteIcon, onSubmit, onSubmitText, onSubmitIcon } =
    props;
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
  border: PropTypes.bool,
};
