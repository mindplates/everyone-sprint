import React from 'react';
import { registerLocale } from 'react-datepicker';
import PropTypes from 'prop-types';
import ko from 'date-fns/locale/ko';
import en from 'date-fns/locale/en-US';
import { DatePicker, Liner } from '@/components';
import { DATE_FORMATS } from '@/constants/constants';
import DateCustomInput from '@/components/DateRange/DateCustomInput/DateCustomInput';
import './DateRange.scss';

registerLocale('ko', ko);
registerLocale('en', en);

const DateRange = ({ className, country, language, startDate, endDate, onChange, size }) => {
  return (
    <div className={`date-range-wrapper ${className} size-${size}`}>
      <div>
        <DatePicker
          className="date-picker start-date-picker"
          selected={new Date(startDate)}
          showTimeSelect
          onChange={(date) => {
            onChange('startDate', date.getTime());
          }}
          locale={language}
          customInput={<DateCustomInput />}
          dateFormat={DATE_FORMATS[country || 'KR'].full.picker}
        />
      </div>
      <Liner className='dash' width="10px" height="1px" display="inline-block" color="black" margin="0 0.75rem 0 0.5rem" />
      <div>
        <DatePicker
          className="date-picker end-date-picker"
          selected={new Date(endDate)}
          showTimeSelect
          onChange={(date) => {
            onChange('endDate', date.getTime());
          }}
          locale={language}
          customInput={<DateCustomInput />}
          dateFormat={DATE_FORMATS[country || 'KR'].full.picker}
        />
      </div>
    </div>
  );
};

export default DateRange;

DateRange.defaultProps = {
  className: '',
  size: 'md',
};

DateRange.propTypes = {
  className: PropTypes.string,
  country: PropTypes.string,
  language: PropTypes.string,
  startDate: PropTypes.number,
  endDate: PropTypes.number,
  onChange: PropTypes.func,
  size: PropTypes.string,
};
