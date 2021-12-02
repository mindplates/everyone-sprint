import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { PageTitle } from '@/components';
import './Scrums.scss';

const Scrums = () => {
  return (
    <div className="scrums-wrapper g-content">
      <PageTitle>스크럼</PageTitle>
      <div className="g-page-content">컨텐츠</div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(Scrums);

Scrums.propTypes = {
  systemInfo: PropTypes.shape({
    version: PropTypes.string,
  }),
};
