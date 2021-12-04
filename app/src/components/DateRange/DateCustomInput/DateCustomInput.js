import React from 'react';
import PropTypes from 'prop-types';
import './DateCustomInput.scss';

class DateCustomInput extends React.PureComponent {
  render() {
    const { className, value, onClick } = this.props;

    return (
      <div className={`date-custom-input-wrapper g-no-select ${className}`} onClick={onClick}>
        <div className="calendar">
          <i className="far fa-calendar-alt" />
        </div>
        <div className="value">{value}</div>
        <div className="status">
          <i className="fas fa-chevron-down" />
        </div>
      </div>
    );
  }
}

DateCustomInput.defaultProps = {};

DateCustomInput.propTypes = {
  value: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
};

export default DateCustomInput;
