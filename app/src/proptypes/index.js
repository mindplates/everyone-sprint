import PropTypes from 'prop-types';

const HistoryPropTypes = PropTypes.shape({
  goBack: PropTypes.func,
  goForward: PropTypes.func,
  push: PropTypes.func,
});

const SettingPropTypes = PropTypes.shape({
  footer: PropTypes.bool,
  collapsed: PropTypes.bool,
});

export { HistoryPropTypes, SettingPropTypes };
