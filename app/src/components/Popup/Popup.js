import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { ExitButton } from '@/components';
import './Popup.scss';

class Popup extends React.PureComponent {
  overflow = null;

  componentDidMount() {
    this.overflow = document.querySelector('body').style.overflow;
    document.querySelector('body').style.overflow = 'hidden';
  }

  componentWillUnmount() {
    document.querySelector('body').style.overflow = this.overflow;
  }

  render() {
    const { className, open, children, title, setOpen, full, onClick } = this.props;

    return (
      <div
        className={`popup-wrapper g-overlay scrollbar ${className} ${open ? 'd-flex' : 'd-none'} ${full ? 'full' : ''}`}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
      >
        <div>
          <div className="popup-title-content">
            <div className='popup-title'>{title}</div>
            <div className='popup-button'>
              <ExitButton
                size="xxs"
                color="color"
                className="remove-image-button"
                onClick={() => {
                  if (setOpen) {
                    setOpen(false);
                  }
                }}
              />
            </div>
          </div>
          <div className="popup-content">{children}</div>
        </div>
      </div>
    );
  }
}

Popup.defaultProps = {
  className: '',
  title: '',
  full: false,
};

Popup.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  className: PropTypes.string,
  open: PropTypes.bool,
  setOpen: PropTypes.func,
  full: PropTypes.bool,
  onClick: PropTypes.func,
};

export default withTranslation()(Popup);
