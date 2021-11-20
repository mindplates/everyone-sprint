const storageKey = 'config';

export function clearStorage() {
  window.localStorage.removeItem(storageKey);
}

export function setItem(category, key, value) {
  const configString = window.localStorage.getItem(storageKey);
  let config = {};
  if (configString) {
    config = JSON.parse(configString);
  } else {
    config = {};
  }

  if (!config[category]) {
    config[category] = {};
  }

  config[category][key] = value;

  if (window.localStorage) {
    window.localStorage.setItem(storageKey, JSON.stringify(config));
  }
}

export function getItem(category, key) {
  const configString = window.localStorage.getItem(storageKey);
  let config = {};
  if (configString) {
    config = JSON.parse(configString);
  }

  if (!config[category]) {
    config[category] = {};
  }

  return config[category][key];
}

export function getCategory(category) {
  const configString = window.localStorage.getItem(storageKey);
  let config = {};
  if (configString) {
    config = JSON.parse(configString);
  }

  if (!config[category]) {
    config[category] = {};
  }

  return config[category];
}

const storage = {
  clearStorage,
  setItem,
  getItem,
  getCategory,
};

export default storage;
