const PORTS = {
  LOCAL_WEB_PORT: 5000,
  LOCAL_API_PORT: 15000,
};

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

const DATE_FORMATS_TYPES = {
  full: 'full',
  days: 'days',
  hours: 'hours',
  dayHours: 'dayHours',
};

const DATE_FORMATS = {
  US: {
    full: { moment: 'MM/DD/YYYY HH:mm', picker: 'MM/dd/yyyy HH:mm' },
    days: { moment: 'MM/DD/YYYY', picker: 'MM/dd/yyyy' },
    dayHours: { moment: 'MM/DD HH:mm', picker: 'MM/dd HH:mm' },
    hours: { moment: 'HH:mm', picker: 'HH:mm' },
  },
  KR: {
    full: { moment: 'YYYY년 MM월 DD일 HH시 mm분', picker: 'yyyy년 MM월 dd일 HH시 mm분' },
    days: { moment: 'YYYY년 MM월 DD일', picker: 'yyyy년 MM월 dd일' },
    dayHours: { moment: 'MM월 DD일 HH시 mm분', picker: 'MM월 dd일 HH시 mm분' },
    hours: { moment: 'HH시 mm분', picker: 'HH시 mm분' },
  },
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
  ko: '한글',
  en: 'English',
};

const COUNTRIES = {
  KR: '한국',
  US: 'US',
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

const COLORS = ['#FFAEBC', '#A0E7E5', '#B4F8C8', '#FBE7C6', '#F8EA8C', '#4CD7D0', '#A49393', '#E8B4B8'];

export {
  PORTS,
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
  COUNTRIES,
  DATE_FORMATS_TYPES,
  COLORS,
};
