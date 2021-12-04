import React from 'react';
import { registerLocale } from 'react-datepicker';
import PropTypes from 'prop-types';
import ko from 'date-fns/locale/ko';
import en from 'date-fns/locale/en-US';
import { DatePicker } from '@/components';
import { DATE_FORMATS } from '@/constants/constants';
import DateCustomInput from '@/components/DateRange/DateCustomInput/DateCustomInput';
import './DateRange.scss';

registerLocale('ko', ko);
registerLocale('en', en);

const DateRange = ({ className, language, startDate, endDate, onChange, size }) => {
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
          dateFormat={DATE_FORMATS[language]}
        />
      </div>
      <div className="dash">-</div>
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
          dateFormat={DATE_FORMATS[language]}
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
  language: PropTypes.string,
  startDate: PropTypes.number,
  endDate: PropTypes.number,
  onChange: PropTypes.func,
  size: PropTypes.string,
};
