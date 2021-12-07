import React from 'react';
import PropTypes from 'prop-types';
import { Liner, Text } from '@/components';
import './DateRangeText.scss';
import dateUtil from '@/utils/dateUtil';

const DateRangeText = ({ className, startDate, endDate, size }) => {
  return (
    <div className={`date-range-text-wrapper ${className} size-${size}`}>
      <div>
        <Text>{dateUtil.getDateString(startDate)}</Text>
      </div>
      <Liner width="10px" height="1px" display="inline-block" color="black" margin="0 0.75rem 0 0.5rem" />
      <div>
        <Text>{dateUtil.getDateString(endDate)}</Text>
      </div>
    </div>
  );
};

export default DateRangeText;

DateRangeText.defaultProps = {
  className: '',
  size: 'md',
};

DateRangeText.propTypes = {
  className: PropTypes.string,
  startDate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  endDate: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  size: PropTypes.string,
};