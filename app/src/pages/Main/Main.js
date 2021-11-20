import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { HistoryPropTypes } from '@/proptypes';
import './Main.scss';

const Main = (props) => {
  const { systemInfo } = props;

  useEffect(() => {}, []);

  return <div className="main-wrapper"></div>;
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
  history: HistoryPropTypes,
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
};
