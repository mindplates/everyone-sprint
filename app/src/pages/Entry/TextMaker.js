import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Button, Input } from '@/components';
import './TextMaker.scss';

const TextMaker = ({ t, close, onChange }) => {
  const [text, setText] = useState('');
  const [validation, setValidation] = useState(0);

  const setData = () => {
    if (!text || (text && text.length < 1)) {
      setValidation(1);
      return;
    }

    if (text && text.length > 3) {
      setValidation(2);
      return;
    }
    setValidation(0);
    onChange(text);
    close();
  };

  return (
    <div className="text-maker-wrapper g-no-select">
      <div className="text-maker-content">
        <div className="preview">
          <Input
            type="text"
            className="text-input"
            size="lg"
            value={text}
            onChange={(val) => {
              if (text && text.length > 0 && text.length < 4) {
                if (validation > 0) {
                  setValidation(0);
                }
              }
              setText(val);
            }}
            onEnter={setData}
            minLength={1}
            maxLength={3}
            required
            simple
          />
        </div>
        <div className="message">{t('아이콘에 표시할 문자를 입력해주세요.')}</div>
        {validation === 1 && <div className="text-danger message">{t('최소 하나의 문자는 입력되어야 합니다.')}</div>}
        {validation === 2 && <div className="text-danger message">{t('세 글자 이하의 문자만 입력 가능합니다.')}</div>}
        <div className="submit-buttons">
          <Button
            size="md"
            color="white"
            outline
            onClick={() => {
              close();
            }}
          >
            <i className="fas fa-angle-left" /> 취소
          </Button>
          <Button type="submit" size="md" color="primary" onClick={setData}>
            <i className="fas fa-pencil-alt" /> 입력
          </Button>
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(TextMaker);

TextMaker.propTypes = {
  t: PropTypes.func,
  match: PropTypes.shape({
    params: PropTypes.shape({
      promotionId: PropTypes.string,
      couponId: PropTypes.string,
    }),
  }),
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  close: PropTypes.func,
  onChange: PropTypes.func,
};
