import PropTypes from 'prop-types';

const HistoryPropTypes = PropTypes.shape({
  goBack: PropTypes.func,
  goForward: PropTypes.func,
  push: PropTypes.func,
});

const LocationPropTypes = PropTypes.shape({
  pathname: PropTypes.string,
  search: PropTypes.string,
});

const SettingPropTypes = PropTypes.shape({
  footer: PropTypes.bool,
  collapsed: PropTypes.bool,
});

const UserPropTypes = PropTypes.shape({
  id: PropTypes.number,
  alias: PropTypes.string,
  autoLogin: PropTypes.bool,
  language: PropTypes.string,
  country: PropTypes.string,
  email: PropTypes.string,
  imageData: PropTypes.string,
  imageType: PropTypes.string,
  loginToken: PropTypes.string,
  name: PropTypes.string,
  tel: PropTypes.string,
});

export { HistoryPropTypes, SettingPropTypes, UserPropTypes, LocationPropTypes };
