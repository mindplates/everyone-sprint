import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { HistoryPropTypes } from '@/proptypes';
import './Header.scss';

const Header = (props) => {
  const { systemInfo } = props;

  useEffect(() => {}, []);

  return (
    <div className="main-wrapper">
      Header
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(Header);

Header.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      promotionId: PropTypes.string,
      couponId: PropTypes.string,
    }),
  }),
  history: HistoryPropTypes,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
};
