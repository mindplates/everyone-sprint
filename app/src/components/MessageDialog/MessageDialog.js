import React from 'react';
import { withTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Button, Overlay } from '@/components';
import dialog from '@/utils/dialog';
import { MESSAGE_CATEGORY } from '@/constants/constants';
import './MessageDialog.scss';

class MessageDialog extends React.PureComponent {
  componentDidMount() {
    if (document.activeElement) {
      document.activeElement.blur();
    }
    document.addEventListener('keydown', this.onKeyDown);
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this.onKeyDown);
  }

  onKeyDown = (e) => {
    if (e.keyCode === 13) {
      this.onEnter();
    }

    if (e.keyCode === 27) {
      this.onESC();
    }
  };

  onEnter = () => {
    this.onOkButtonClick();
  };

  onESC = () => {
    this.onNoButtonClick();
  };

  getMessageCategoryIcon = (category) => {
    switch (category) {
      case MESSAGE_CATEGORY.ERROR: {
        return <i className="fas fa-exclamation-triangle" />;
      }

      case MESSAGE_CATEGORY.WARNING: {
        return <i className="fas fa-exclamation-triangle" />;
      }

      case MESSAGE_CATEGORY.INFO: {
        return <i className="fas fa-exclamation-circle" />;
      }

      default: {
        return null;
      }
    }
  };

  onOkButtonClick = () => {
    const { type, okHandler } = this.props;

    if (okHandler) {
      okHandler();
    }

    if (type === 'message') {
      dialog.clearMessage();
    } else {
      dialog.clearConfirm();
    }
  };

  onNoButtonClick = () => {
    const { type, noHandler } = this.props;

    if (noHandler) {
      noHandler();
    }

    if (type === 'message') {
      dialog.clearMessage();
    } else {
      dialog.clearConfirm();
    }
  };

  render() {
    const { t, className } = this.props;
    const { type, category, title, message, noHandler } = this.props;

    return (
      <Overlay>
        <div className={`message-dialog-wrapper ${className}`}>
          <div>
            <div className={`title ${category}`}>
              <span>
                <span className="category">{this.getMessageCategoryIcon(category)}</span>
                {title}
              </span>
            </div>
            <div className="message">{message}</div>
            <div>
              {(noHandler || type === 'confirm') && (
                <Button className="px-4 mx-1" color="white" outline onClick={this.onNoButtonClick}>
                  {t('취소')}
                </Button>
              )}
              <Button className="px-4 mx-1" color="primary" onClick={this.onOkButtonClick}>
                {t('확인')}
              </Button>
            </div>
          </div>
        </div>
      </Overlay>
    );
  }
}

export default compose(withTranslation())(MessageDialog);

MessageDialog.defaultProps = {
  className: '',
  type: 'message',
};

MessageDialog.propTypes = {
  type: PropTypes.string,
  className: PropTypes.string,
  t: PropTypes.func,
  category: PropTypes.string,
  title: PropTypes.string,
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  okHandler: PropTypes.func,
  noHandler: PropTypes.func,
};
