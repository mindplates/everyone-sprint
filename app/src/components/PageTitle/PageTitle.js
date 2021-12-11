import React from 'react';
import PropTypes from 'prop-types';
import './PageTitle.scss';
import { Button, Liner } from '@/components';

const PageTitle = ({ className, children, control, buttons }) => {
  return (
    <div className={`page-title-wrapper ${className}`}>
      <div className="bullet">
        <span />
      </div>
      <div className="text">
        <span>{children}</span>
      </div>
      {control && (
        <div className="control">
          <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
          {control}
        </div>
      )}
      {buttons && (
        <div className="control">
          <Liner display="inline-block" width="1px" height="10px" color="light" margin="0 0.5rem" />
          {buttons.map((button, inx) => {
            return (
              <Button key={inx} size="xs" color="white" outline onClick={button.handler}>
                {button.icon && <span>{button.icon}</span>} {button.text}
              </Button>
            );
          })}
          {control}
        </div>
      )}
    </div>
  );
};

export default PageTitle;

PageTitle.defaultProps = {
  className: '',
};

PageTitle.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
  control: PropTypes.node,
  buttons: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node,
      text: PropTypes.string,
      handler: PropTypes.func,
    }),
  ),
};
