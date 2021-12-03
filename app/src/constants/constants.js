const USER_STUB = {
  id: null,
  alias: '',
  autoLogin: false,
  language: 'ko',
  country: 'KR',
  email: '',
  imageData: '',
  imageType: '',
  loginToken: '',
  name: '',
  tel: '',
};

const THEMES = {
  WHITE: 'WHITE',
  BLACK: 'BLACK',
};

const MESSAGE_CATEGORY = {
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO',
};

const VALIDATIONS = ['valueMissing', 'typeMismatch', 'patternMismatch', 'tooLong', 'tooShort', 'rangeUnderflow', 'rangeOverflow', 'stepMismatch', 'badInput', 'customError', 'valid'];

const DEFAULT_INPUT_VALIDATION_MESSAGE = {
  valueMissing: 'validation.valueMissing',
  typeMismatch: 'validation.typeMismatch',
  patternMismatch: 'validation.patternMismatch',
  tooLong: 'validation.tooLong',
  tooShort: 'validation.tooShort',
  rangeUnderflow: 'validation.rangeUnderflow',
  rangeOverflow: 'validation.rangeOverflow',
  stepMismatch: 'validation.stepMismatch',
  badInput: 'validation.badInput',
  customError: 'validation.customError',
  valid: 'validation.valid',
};

const USER_ROLES = {
  ADMIN: '어드민',
  MEMBER: '사용자',
};

const DATE_FORMATS = {
  kr: 'YYYY-MM-DD HH:mm',
  us: 'MM/DD/YYYY HH:mm',
};

const LANGUAGES = {
  ko: '한국어',
  en: 'English',
};

const VENDORS = {
  kakao: '카카오',
  naver: '네이버',
  facebook: '페이스북',
  google: '구글',
};

export { USER_STUB, THEMES, MESSAGE_CATEGORY, DEFAULT_INPUT_VALIDATION_MESSAGE, VALIDATIONS, USER_ROLES, DATE_FORMATS, LANGUAGES, VENDORS };
