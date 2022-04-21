import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { withTranslation } from 'react-i18next';
import { ExitButton } from '@/components';
import filters from '@/images/filters';
import './PixInfoEditor.scss';

const PixInfoEditor = ({ className, pixInfo, onChange, t, setOpened }) => {
  const options = {
    effect: {
      name: '배경 흐리게',
      items: [
        {
          key: 'none',
          name: t('효과 및 블러 없음'),
          icon: <i className="fas fa-ban" />,
          value: null,
        },
        {
          key: 'blur',
          name: t('배경 흐리게'),
          icon: <i className="fas fa-hand-sparkles" />,
          value: 3,
        },
        {
          key: 'blur',
          name: t('배경 흐리게'),
          icon: <i className="fas fa-hand-sparkles" />,
          value: 10,
        },
      ],
    },
    image: {
      name: '배경 이미지',
      items: [...filters],
    },
  };

  return (
    <div className={`pix-info-editor-wrapper ${className}`}>
      <div className="title">
        <div className="text">시각 효과</div>
        <div className="exit-button">
          <ExitButton
            size="xxs"
            color="black"
            onClick={() => {
              setOpened(false);
            }}
          />
        </div>
      </div>
      <div className="content">
        <div>
          {Object.keys(options).map((typeKey) => {
            return (
              <div className="category" key={typeKey}>
                <div className="category-title">{options[typeKey].name}</div>
                <div className="item-list">
                  <ul>
                    {options[typeKey].items.map((item) => {
                      if (typeKey !== 'image') {
                        return (
                          <li
                            key={`${typeKey}-${item.key}-${item.value}`}
                            className={pixInfo.type === typeKey && pixInfo.key === item.key && pixInfo.value === item.value ? 'selected' : ''}
                            onClick={() => {
                              onChange(typeKey, item.key, item.value);
                            }}
                          >
                            <div className="name">{item.icon}</div>
                          </li>
                        );
                      }

                      return (
                        <li
                          key={`${typeKey}-${item.key}`}
                          className={pixInfo.type === typeKey && pixInfo.key === item.key ? 'selected' : ''}
                          onClick={() => {
                            onChange(typeKey, item.key, null);
                          }}
                        >
                          <div className="image">
                            <img src={item.value} alt={item.name} />
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default compose(withTranslation())(PixInfoEditor);

PixInfoEditor.defaultProps = {
  className: '',
};

PixInfoEditor.propTypes = {
  className: PropTypes.string,
  pixInfo: PropTypes.shape({
    enabled: PropTypes.bool,
    type: PropTypes.string,
    key: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }),
  onChange: PropTypes.func,
  setOpened: PropTypes.func,
  t: PropTypes.func,
};
