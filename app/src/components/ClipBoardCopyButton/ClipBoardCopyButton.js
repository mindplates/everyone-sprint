import React, { useState } from 'react';
import PropTypes from 'prop-types';
import copy from 'copy-to-clipboard';
import { Button } from '@/components';

const ClipBoardCopyButton = ({ className, data, text, successText, size, color }) => {
  const [copyText, setCopyText] = useState(text);

  return (
    <Button
      className={className}
      size={size}
      color={color}
      outline
      onClick={() => {
        copy(data);
        if (successText) {
          setCopyText(successText);
        } else {
          setCopyText(
            <span>
              <i className="fas fa-check mr-2" />
              {text}
            </span>,
          );
        }

        setTimeout(() => {
          setCopyText(text);
        }, 1000);
      }}
    >
      {copyText}
    </Button>
  );
};

export default ClipBoardCopyButton;

ClipBoardCopyButton.defaultProps = {
  className: '',
  text: '복사',
  color: 'point',
  successText: '',
  size: 'xs',
};

ClipBoardCopyButton.propTypes = {
  className: PropTypes.string,
  data: PropTypes.string,
  text: PropTypes.string,
  successText: PropTypes.string,
  size: PropTypes.string,
  color: PropTypes.string,
};
