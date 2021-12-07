import React from 'react';
import PropTypes from 'prop-types';
import './UserList.scss';
import { UserPropTypes } from '@/proptypes';
import { UserCard } from '@/components';

const UserList = ({ className, users, editable }) => {
  return (
    <div className={`user-list-wrapper ${className}`}>
      {users.length < 1 && (
        <div className="sprint-user-list">
          <div>등록된 멤버가 없습니다.</div>
        </div>
      )}
      {users.length > 0 && (
        <div className="sprint-user-list">
          {users.map((u) => {
            return (
              <div key={u.id} className="user-card">
                <UserCard user={u} editable={editable} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserList;

UserList.defaultProps = {
  className: '',
  editable: false,
};

UserList.propTypes = {
  className: PropTypes.string,
  users: PropTypes.arrayOf(UserPropTypes),
  editable: PropTypes.bool,
};
