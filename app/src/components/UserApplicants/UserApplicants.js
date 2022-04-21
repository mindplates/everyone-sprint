import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { compose } from 'recompose';
import { withRouter } from 'react-router-dom';
import { UserPropTypes } from '@/proptypes';
import { Button, UserImage } from '@/components';

import withLoader from '@/components/Common/withLoader';
import './UserApplicants.scss';

const UserApplicants = ({ className, t, applicants, icon, onReject, onApprove }) => {
  return (
    <div className={`user-applicants-wrapper ${className}`}>
      {applicants.length < 1 && (
        <div className="empty-message">
          <div>{t('참여 요청한 사용자가 없습니다.')}</div>
        </div>
      )}
      {applicants.length > 0 && (
        <div className="user-list">
          {applicants.map((user, index) => {
            return (
              <div key={index} className="user-card">
                {icon && (
                  <div className="user-image">
                    <UserImage border rounded size="36px" imageType={user.imageType} imageData={user.imageData} iconFontSize="18px" />
                  </div>
                )}
                <div className="user-list-item-content">
                  <div className="item-content">
                    <div className="alias">
                      <span className="alias-text">{user.alias}</span>
                      {user.name && <span className="name-text">{user.name}</span>}
                    </div>
                    <div className="email">{user.email}</div>
                  </div>
                  {onReject && (
                    <div className="on-reject-button">
                      <Button
                        size="sm"
                        color="danger"
                        outline
                        onClick={() => {
                          onReject(user.id);
                        }}
                      >
                        {t('거절')}
                      </Button>
                    </div>
                  )}
                  {onApprove && (
                    <div>
                      <Button
                        size="sm"
                        color="point"
                        outline
                        onClick={() => {
                          onApprove(user.id);
                        }}
                      >
                        {t('승인')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default compose(withLoader, withRouter, withTranslation())(UserApplicants, 'applicants');

UserApplicants.defaultProps = {
  className: '',
  icon: true,
};

UserApplicants.propTypes = {
  className: PropTypes.string,
  t: PropTypes.func,
  applicants: PropTypes.arrayOf(UserPropTypes),
  icon: PropTypes.bool,
  onReject: PropTypes.func,
  onApprove: PropTypes.func,
};
