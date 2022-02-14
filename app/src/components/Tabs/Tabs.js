import React from 'react';
import PropTypes from 'prop-types';
import './Tabs.scss';

const Tabs = ({ className, tabs, tab, rounded, onChange, border, size, width, height, cornered, content }) => {
  return (
    <div
      className={`tabs-wrapper g-no-select ${className} ${cornered ? 'cornered' : ''} ${rounded ? 'rounded' : ''} ${border ? 'has-board' : ''} size-${size}`}
    >
      <div className="tabs-content">
        <div className="tab-controls">
          {tabs.map((d) => {
            return (
              <span
                key={d.key}
                style={{
                  width,
                  height,
                }}
                className={`${d.key === tab ? 'selected' : ''}`}
                onClick={() => {
                  if (onChange) {
                    onChange(d.key);
                  }
                }}
              >
                <span>{d.value}</span>
              </span>
            );
          })}
        </div>
        {content && <div className="tab-side-content">{content}</div>}
      </div>
      {border && <div className="tabs-liner" />}
    </div>
  );
};

export default Tabs;

Tabs.defaultProps = {
  className: '',
  rounded: false,
  border: true,
  cornered: false,
  size: 'md',
};

Tabs.propTypes = {
  className: PropTypes.string,
  rounded: PropTypes.bool,
  cornered: PropTypes.bool,
  size: PropTypes.string,
  width: PropTypes.string,
  height: PropTypes.string,
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      value: PropTypes.string,
    }),
  ),
  tab: PropTypes.string,
  onChange: PropTypes.func,
  border: PropTypes.bool,
  content: PropTypes.node,
};
