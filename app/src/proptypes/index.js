import PropTypes from 'prop-types';

const HistoryPropTypes = PropTypes.shape({
  goBack: PropTypes.func,
  goForward: PropTypes.func,
  push: PropTypes.func,
});

export { HistoryPropTypes };
