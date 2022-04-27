import { PORTS } from '@/constants/constants';

function getBaseUrl() {
  const local = process.env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].some((d) => d === window.location.hostname);
  return local ? `${window.location.protocol}//${window.location.hostname}:${PORTS.LOCAL_API_PORT}` : '';
}

const configUtil = {
  getBaseUrl,
};

export default configUtil;
