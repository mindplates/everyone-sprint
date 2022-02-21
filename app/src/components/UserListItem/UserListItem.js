import React from 'react';
import PropTypes from 'prop-types';
import './UserListItem.scss';
import { UserPropTypes } from '@/proptypes';
import { Button, ExitButton, UserImage } from '@/components';

class UserListItem extends React.PureComponent {
  render() {
    const { className, onClick, user, editable, onChange, userIndex, addCard, icon } = this.props;

    const CRUD = (user || {}).CRUD || 'S';

    return (
      <div
        className={`user-list-item-wrapper ${className} ${CRUD === 'D' ? 'deleted' : ''} ${addCard ? 'add-card' : ''}`}
        onClick={() => {
          if (onClick) {
            onClick();
          }
        }}
      >
        {addCard && (
          <div className="add-card-content">
            <div>
              <div className="icon">
                <i className="fas fa-plus" />
              </div>
              <div>새 멤버 추가</div>
            </div>
          </div>
        )}
        {!addCard && (
          <div>
            {CRUD === 'D' && (
              <div className="role">
                <span className="deleted">DELETED</span>
              </div>
            )}
            {editable.role && CRUD !== 'D' && (
              <div className="role">
                <span>{user.role}</span>
                <Button
                  rounded
                  size="xs"
                  outline
                  onClick={() => {
                    onChange(userIndex, 'role', user.role === 'ADMIN' ? 'MEMBER' : 'ADMIN');
                  }}
                >
                  <i className="fas fa-exchange-alt" />
                </Button>
              </div>
            )}
            {editable.member && (
              <>
                {CRUD === 'D' && (
                  <div className="redo-button">
                    <Button
                      rounded
                      size="sm"
                      color="white"
                      onClick={() => {
                        onChange(userIndex, 'CRUD', 'U');
                      }}
                    >
                      <i className="fas fa-retweet" />
                    </Button>
                  </div>
                )}
                {CRUD !== 'D' && (
                  <div className="remove-button">
                    <ExitButton
                      size="xxs"
                      color="black"
                      className="remove-image-button"
                      onClick={() => {
                        onChange(userIndex, 'CRUD', 'D');
                      }}
                    />
                  </div>
                )}
              </>
            )}
            {icon && (
              <div className="user-image">
                <UserImage border rounded size="36px" imageType={user.imageType} imageData={user.imageData} />
              </div>
            )}
            <div className="user-list-item-content">
              <div>
                <div className="alias">
                  <span className="alias-text">{user.alias}</span>
                  {user.name && <span className="name-text">{user.name}</span>}
                </div>
                <div className="email">{user.email}</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

UserListItem.defaultProps = {
  className: '',
  addCard: false,
  editable: {
    role: true,
    member: true,
  },
  icon: true,
};

UserListItem.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  user: UserPropTypes,
  userIndex: PropTypes.number,
  editable: PropTypes.shape({
    role: PropTypes.bool,
    member: PropTypes.bool,
  }),
  onChange: PropTypes.func,
  addCard: PropTypes.bool,
  icon: PropTypes.bool,
};

export default UserListItem;
