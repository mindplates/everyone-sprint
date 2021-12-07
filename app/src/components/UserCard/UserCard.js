import React from 'react';
import PropTypes from 'prop-types';
import './UserCard.scss';
import { UserPropTypes } from '@/proptypes';
import { Button, ExitButton, UserImage } from '@/components';

class UserCard extends React.PureComponent {
  render() {
    const { className, onClick, user, editable } = this.props;

    console.log(user);

    return (
      <div
        className={`user-card-wrapper ${className}`}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
      >
        <div>
          <div className="role">
            <span>{user.role}</span>
            {editable && (
              <Button rounded size="xs" outline onClick={() => {}}>
                <i className="fas fa-exchange-alt" />
              </Button>
            )}
          </div>
          {editable && (
            <div className="remove-button">
              <ExitButton size="xxs" color="black" className="remove-image-button" onClick={() => {}} />
            </div>
          )}
          <div className="user-image">
            <UserImage border rounded size="50px" imageType={user.imageType} imageData={user.imageData} />
          </div>
          <div className="user-card-content">
            <div className="email">{user.email}</div>
            <div className="alias">
              <span className="alias-text">{user.alias}</span>
              <span className="name-text">{user.name}</span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

UserCard.defaultProps = {
  className: '',
  editable: false,
};

UserCard.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  user: UserPropTypes,
  editable: PropTypes.bool,
};

export default UserCard;
