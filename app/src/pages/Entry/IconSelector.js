import React, { useState } from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { Button } from '@/components';
import './IconSelector.scss';

const icons = [
  {
    type: 'fontAwesome',
    icon: 'fas fa-atom',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-helicopter',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-republican',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-directions',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-radiation-alt',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-graduation-cap',
  },
  {
    type: 'fontAwesome',
    icon: 'fab fa-connectdevelop',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-concierge-bell',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-wifi',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-plug',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-donate',
  },
  {
    type: 'fontAwesome',
    icon: 'far fa-sun',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-ice-cream',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-gamepad',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-fan',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-ethernet',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-socks',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-ruler-vertical',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-paint-roller',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-dumpster',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-brush',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-plane',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-plane-departure',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-plane-arrival',
  },
  {
    type: 'fontAwesome',
    icon: 'far fa-paper-plane',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-globe-asia',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-solar-panel',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-place-of-worship',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-seedling',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-spa',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-leaf',
  },
  {
    type: 'fontAwesome',
    icon: 'fab fa-canadian-maple-leaf',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-tree',
  },
  {
    type: 'fontAwesome',
    icon: 'fab fa-pagelines',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-holly-berry',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-map-marker-alt',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-bowling-ball',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-carrot',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-car',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-caravan',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-car-side',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-car-crash',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-vr-cardboard',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-car-battery',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-truck-moving',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-truck-pickup',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-truck',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-trailer',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-mask',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-stroopwafel',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-air-freshener',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-taxi',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-user-astronaut',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-user-tie',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-user-ninja',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-robot',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-child',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-snowman',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-shapes',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-baby-carriage',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-apple-alt',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-cookie',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-birthday-cake',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-mitten',
  },
  {
    type: 'fontAwesome',
    icon: 'fas fa-cookie-bite',
  },
];

const IconSelector = ({ t, close, onChange }) => {
  const [icon, setIcon] = useState('');

  const setData = () => {
    onChange(icon);
    close();
  };

  return (
    <div className="icon-selector-wrapper g-popup-wrapper g-no-select">
      <div className="g-popup-content">
        <div className="icon-list g-scrollbar">
          <ul>
            {icons.map((info) => {
              if (info.type === 'fontAwesome') {
                return (
                  <li className={info.type === icon.type && info.icon === icon.icon ? 'selected' : ''}>
                    <div
                      onClick={() => {
                        setIcon(info);
                      }}
                    >
                      <span>
                        <i className={info.icon} />
                      </span>
                    </div>
                  </li>
                );
              }

              return undefined;
            })}
          </ul>
        </div>
      </div>
      <div className="g-popup-bottom-button">
        <Button
          size="md"
          color="white"
          outline
          onClick={() => {
            close();
          }}
        >
          <i className="fas fa-times" /> 취소
        </Button>
        <Button type="submit" size="md" color="white" outline onClick={setData}>
          <i className="fas fa-vote-yea" /> {t('선택')}
        </Button>
      </div>
    </div>
  );
};

export default withTranslation()(IconSelector);

IconSelector.propTypes = {
  t: PropTypes.func,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
  close: PropTypes.func,
  onChange: PropTypes.func,
};
