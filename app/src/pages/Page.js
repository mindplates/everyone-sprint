import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';

import PropTypes from 'prop-types';
import { PageTitle } from '@/components';
import './Page.scss';

const Page = () => {
  const [info, setInfo] = useState('');

  useEffect(() => {
    setInfo('sample');
    console.log(info);
  }, []);

  return (
    <div className="page-wrapper">
      <PageTitle>페이지 타이틀</PageTitle>
      <div className="page-content">컨텐츠</div>
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    systemInfo: state.systemInfo,
  };
};

export default connect(mapStateToProps, undefined)(Page);

Page.propTypes = {
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
