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

const DATE_FORMATS = {
  US: { moment: 'MM/DD/YYYY HH:mm', picker: 'MM/dd/yyyy HH:mm' },
  KR: { moment: 'YYYY년 MM월 DD일 HH시 mm분', picker: 'yyyy년 MM월 dd일 HH시 mm분' },
};

const MESSAGE_CATEGORY = {
  ERROR: 'ERROR',
  WARNING: 'WARNING',
  INFO: 'INFO',
};

const VALIDATIONS = [
  'valueMissing',
  'typeMismatch',
  'patternMismatch',
  'tooLong',
  'tooShort',
  'rangeUnderflow',
  'rangeOverflow',
  'stepMismatch',
  'badInput',
  'customError',
  'valid',
];

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

const ALLOW_SEARCHES = [
  {
    key: true,
    value: '검색 허용',
  },
  {
    key: false,
    value: '초대 혹은 링크만 허용',
  },
];

const JOIN_POLICIES = [
  {
    key: true,
    value: '누구나 참여',
  },
  {
    key: false,
    value: '승인 후 참여',
  },
];

export {
  USER_STUB,
  MESSAGE_CATEGORY,
  DEFAULT_INPUT_VALIDATION_MESSAGE,
  VALIDATIONS,
  USER_ROLES,
  DATE_FORMATS,
  LANGUAGES,
  VENDORS,
  ALLOW_SEARCHES,
  JOIN_POLICIES,
};
