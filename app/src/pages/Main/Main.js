import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import './Main.scss';

const Main = () => {
  useEffect(() => {}, []);

  return <div className="main-wrapper">컨텐츠</div>;
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(Main);

Main.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      promotionId: PropTypes.string,
      couponId: PropTypes.string,
    }),
  }),

  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
};
