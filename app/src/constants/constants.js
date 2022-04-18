const PORTS = {
  LOCAL_WEB_PORT: 5000,
  LOCAL_API_PORT: 15000,
};

const LANGUAGES = {
  ko: '한글',
  en: 'English',
};

const COUNTRIES = {
  KR: '한국',
  US: 'US',
};

const locales = (window.navigator.language || '').split('-');
const defaultLanguage = locales[0];
const defaultCountry = locales[1];

const language = Object.keys(LANGUAGES).includes(defaultLanguage) ? defaultLanguage : 'en';
const country = Object.keys(COUNTRIES).includes(defaultCountry) ? defaultCountry : 'US';

const USER_STUB = {
  id: null,
  alias: '',
  autoLogin: false,
  language,
  country,
  email: '',
  imageData: '',
  imageType: '',
  loginToken: '',
  name: '',
  tel: '',
  timezone: 'Asia/Seoul',
  tried: false,
};

const DATE_FORMATS_TYPES = {
  full: 'full',
  yearsDays: 'yearsDays',
  days: 'days',
  hoursMinutes: 'hoursMinutes',
  hours: 'hours',
  dayHours: 'dayHours',
  minutes: 'minutes',
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
    yearsDays: { moment: 'YYYY년 MM월 DD일', picker: 'yyyy년 MM월 dd일 (eee)' },
    days: { moment: 'MM월 DD일', picker: 'MM월 dd일 (eee)' },
    dayHours: { moment: 'MM월 DD일 HH시 mm분', picker: 'MM월 dd일 HH시 mm분' },
    hoursMinutes: { moment: 'HH시 mm분', picker: 'HH시 mm분' },
    hours: { moment: 'HH시', picker: 'HH시' },
    minutes: { moment: 'mm분 ss초', picker: 'mm시 ss초' },
  },
  ko_US: {
    full: { moment: 'MM월/DD일/YYYY년 HH시 mm분', picker: 'MM월/dd일/yyyy년 HH시 mm분' },
    yearsDays: { moment: 'MM월/DD일/YYYY년', picker: 'MM월/dd일/yyyy년 (eee)' },
    days: { moment: 'MM월/DD일', picker: 'MM월/dd일 (eee)' },
    dayHours: { moment: 'MM월/DD일 HH시 mm분', picker: 'MM월/dd일 HH시 mm분' },
    hoursMinutes: { moment: 'HH시 mm분', picker: 'HH시 mm분' },
    hours: { moment: 'HH시', picker: 'HH시' },
    minutes: { moment: 'mm분 ss초', picker: 'mm시 ss초' },
  },
  en_US: {
    full: { moment: 'MM/DD/YYYY HH:mm', picker: 'MM/dd/yyyy HH:mm' },
    yearsDays: { moment: 'MM/DD/YYYY', picker: 'MM/dd/yyyy (eee)' },
    days: { moment: 'MM/DD', picker: 'MM/dd (eee)' },
    dayHours: { moment: 'MM/DD HH:mm', picker: 'MM/dd HH:mm' },
    hoursMinutes: { moment: 'HH:mm', picker: 'HH:mm' },
    hours: { moment: 'HH', picker: 'HH' },
    minutes: { moment: 'mm:ss', picker: 'mm:ss' },
  },
  en_KR: {
    full: { moment: 'YYYY-MM-DD HH:mm', picker: 'yyyy-MM-dd HH:mm' },
    yearsDays: { moment: 'YYYY-MM-DD', picker: 'yyyy-MM-dd (eee)' },
    days: { moment: 'MM-DD', picker: 'MM-dd (eee)' },
    dayHours: { moment: 'DD-MM HH:mm', picker: 'dd-MM HH:mm' },
    hoursMinutes: { moment: 'HH:mm', picker: 'HH:mm' },
    hours: { moment: 'HH', picker: 'HH' },
    minutes: { moment: 'mm:ss', picker: 'mm:ss' },
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

const ACTIVATES = [
  {
    key: true,
    value: '활성',
  },
  {
    key: false,
    value: '비활성',
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

const CAPABILITIES = [
  {
    key: 'brightness',
    name: '밝기',
    enabled: true,
  },
  {
    key: 'saturation',
    name: '채도',
    enabled: true,
  },
  {
    key: 'contrast',
    name: '대조',
    enabled: true,
  },
  {
    key: 'colorTemperature',
    name: '색 온도',
    enabled: true,
  },
  {
    key: 'sharpness',
    name: '예리함',
    enabled: true,
  },
  {
    key: 'aspectRatio',
    name: '화면 비율',
    enabled: false,
  },
  {
    key: 'frameRate',
    name: '초당 프레임',
    enabled: false,
  },
  {
    key: 'exposureCompensation',
    name: '노출 보정',
    enabled: true,
  },
  {
    key: 'exposureMode',
    name: '노출 모드',
    enabled: true,
  },
  {
    key: 'exposureTime',
    name: '노출 시간',
    enabled: true,
  },
  {
    key: 'facingMode',
    name: '마주 보기',
    enabled: false,
  },
  {
    key: 'focusDistance',
    name: '포커스 거리',
    enabled: true,
  },
  {
    key: 'focusMode',
    name: '포커스 모드',
    enabled: true,
  },
  {
    key: 'resizeMode',
    name: '리사이즈 모드',
    enabled: false,
  },
  {
    key: 'whiteBalanceMode',
    name: '화이트밸런스 모드',
    enabled: true,
  },
];

const BODY_PIX = {
  MODELS: {
    ResNet50: 'ResNet50',
    MobileNetV1: 'MobileNetV1',
  },
  OUTPUT_STRIDES: {
    8: 8,
    16: 16,
    32: 32,
  },
  MULTIPLIERS: {
    1.0: 1.0,
    0.75: 0.75,
    0.5: 0.5,
  },

  QUANT_BYTES: {
    1: 1,
    2: 2,
    4: 4,
  },
};

const MEETING_TYPES = [
  {
    key: 'MEETING',
    value: '미팅',
    supportType: 'new',
  },
  {
    key: 'SMALLTALK',
    value: '스몰톡 미팅',
    type: '',
    supportType: 'new',
  },
  {
    key: 'SCRUM',
    value: '스크럼 미팅',
  },
];

const SYSTEM_PATHS = ['login', 'spaces', 'home', 'public-park'];

const CONFERENCE_URL_PATTERN = /^\/[A-Za-z0-9]*\/meets|talks\/[A-Za-z0-9]*/;

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
  CAPABILITIES,
  BODY_PIX,
  ACTIVATES,
  MEETING_TYPES,
  CONFERENCE_URL_PATTERN,
  SYSTEM_PATHS,
};
