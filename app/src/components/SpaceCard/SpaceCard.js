import React from 'react';
import PropTypes from 'prop-types';
import { SpacePropTypes } from '@/proptypes';
import './SpaceCard.scss';

const SpaceCard = ({ className, space, description }) => {
  return (
    <div className={`space-card-wrapper ${className}`}>
      <div className="space-name-code">
        <div className="space-label">
          <span>SPACE</span>
        </div>
        <div className="name">{space.name}</div>
        <div className="code">{space.code}</div>
      </div>
      <div className={`user-info ${description ? 'mb-0' : ''}`}>
        <div className="icon">
          <i className="fas fa-medal" />
        </div>
        <div className="tags">
          {space.isAdmin && <div className="is-admin">{space.isAdmin ? 'ADMIN' : ''}</div>}
          {space.isMember && <div className="is-member">{space.isAdmin ? 'MEMBER' : ''}</div>}
          {!space.isMember && !space.isAdmin && <div className="is-no-auth">NOT AUTHORIZED</div>}
        </div>
      </div>
      <div className="activated">{space.activated ? '' : 'DISABLED'}</div>
      {description && (
        <div className="description">
          <div>{space.description}</div>
        </div>
      )}
    </div>
  );
};

export default SpaceCard;

SpaceCard.defaultProps = {
  className: '',
  description: true,
};

SpaceCard.propTypes = {
  className: PropTypes.string,
  space: SpacePropTypes,
  description: PropTypes.bool,
};
