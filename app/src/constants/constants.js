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
  timezone: 'Asia/Seoul',
};

const DATE_FORMATS_TYPES = {
  full: 'full',
  days: 'days',
  hours: 'hours',
  dayHours: 'dayHours',
};

const TIMEZONES = {
  'Asia/Seoul': {
    name: 'Asia/Seoul (GMT +9:00)',
    dir: +1,
    hours: 9,
    minutes: 0,
  },
  'US/HST': {
    name: 'US/HST (GMT -10:00)',
    dir: -1,
    hours: 10,
    minutes: 0,
  },
  'US/AKST': {
    name: 'US/AKST (GMT -9:00)',
    dir: -1,
    hours: 9,
    minutes: 0,
  },
  'US/PST': {
    name: 'US/PST (GMT -8:00)',
    dir: -1,
    hours: 8,
    minutes: 0,
  },
  'US/MST': {
    name: 'US/MST(GMT -7:00)',
    dir: -1,
    hours: 7,
    minutes: 0,
  },
  'US/CST': {
    name: 'US/CST(GMT -6:00)',
    dir: -1,
    hours: 6,
    minutes: 0,
  },
  'US/EST': {
    name: 'US/EST(GMT -5:00)',
    dir: -1,
    hours: 5,
    minutes: 0,
  },
};

const DATE_FORMATS = {
  ko_KR: {
    full: { moment: 'YYYY년 MM월 DD일 HH시 mm분', picker: 'yyyy년 MM월 dd일 HH시 mm분' },
    days: { moment: 'YYYY년 MM월 DD일', picker: 'yyyy년 MM월 dd일 (eee)' },
    dayHours: { moment: 'MM월 DD일 HH시 mm분', picker: 'MM월 dd일 HH시 mm분' },
    hours: { moment: 'HH시 mm분', picker: 'HH시 mm분' },
  },
  ko_US: {
    full: { moment: 'MM월/DD일/YYYY년 HH시 mm분', picker: 'MM월/dd일/yyyy년 HH시 mm분' },
    days: { moment: 'MM월/DD일/YYYY년', picker: 'MM월/dd일/yyyy년 (eee)' },
    dayHours: { moment: 'MM월/DD일 HH시 mm분', picker: 'MM월/dd일 HH시 mm분' },
    hours: { moment: 'HH시 mm분', picker: 'HH시 mm분' },
  },
  en_US: {
    full: { moment: 'MM/DD/YYYY HH:mm', picker: 'MM/dd/yyyy HH:mm' },
    days: { moment: 'MM/DD/YYYY', picker: 'MM/dd/yyyy (eee)' },
    dayHours: { moment: 'MM/DD HH:mm', picker: 'MM/dd HH:mm' },
    hours: { moment: 'HH:mm', picker: 'HH:mm' },
  },
  en_KR: {
    full: { moment: 'YYYY-MM-DD HH:mm', picker: 'yyyy-MM-dd HH:mm' },
    days: { moment: 'YYYY-MM-DD', picker: 'yyyy-MM-dd (eee)' },
    dayHours: { moment: 'DD-MM HH:mm', picker: 'dd-MM HH:mm' },
    hours: { moment: 'HH:mm', picker: 'HH:mm' },
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
  TIMEZONES,
};
