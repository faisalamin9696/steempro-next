import moment from 'moment';

const TODAY = new Date();
const ONE_DAY = new Date(TODAY.getTime() - 24 * 60 * 60 * 1000);
const SEVEN_DAY = new Date(TODAY.getTime() - 7 * 24 * 60 * 60 * 1000);

const MINUTE = 60;
const HOUR = 60 * 60;
const DAY = 60 * 60 * 24;
const WEEK = 60 * 60 * 24 * 7;
const MONTH = 60 * 60 * 24 * 30;
const YEAR = 60 * 60 * 24 * 365;

// TODO: once hermes has Intl support, enable native version
export const getTimeFromNowNative = d => {
  if (!d) {
    return null;
  }
  const dateIn = new Date(`${d}.000Z`);
  const dateNow = new Date();
  let future = false;

  if (dateIn > dateNow) {
    future = true;
  }

  const diff = Math.abs((dateNow.getTime() - dateIn.getTime()) / 1000);

  if (diff < MINUTE) {
    return {
      unit: 'second',
      value: future ? Math.round(diff) : -Math.round(diff),
    };
  }
  if (diff < HOUR) {
    return {
      unit: 'minute',
      value: future ? Math.round(diff / MINUTE) : -Math.round(diff / MINUTE),
    };
  }
  if (diff < DAY) {
    return {
      unit: 'hour',
      value: future ? Math.round(diff / HOUR) : -Math.round(diff / HOUR),
    };
  }
  if (diff < WEEK) {
    return {
      unit: 'day',
      value: future ? Math.round(diff / DAY) : -Math.round(diff / DAY),
    };
  }
  if (diff < MONTH) {
    return {
      unit: 'week',
      value: future ? Math.round(diff / WEEK) : -Math.round(diff / WEEK),
    };
  }
  if (diff < YEAR) {
    return {
      unit: 'month',
      value: future ? Math.round(diff / MONTH) : -Math.round(diff / MONTH),
    };
  }
  if (diff > YEAR) {
    return {
      unit: 'year',
      value: future ? Math.round(diff / YEAR) : -Math.round(diff / YEAR),
    };
  }
  return {
    unit: 'day',
    value: future ? Math.round(diff / DAY) : -Math.round(diff / DAY),
  };
};

moment.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    ss: '%d seconds',
    m: 'a minute',
    mm: '%d minutes',
    h: 'an hour',
    hh: '%d hours',
    d: 'a day',
    dd: '%d days',
    w: 'a week',
    ww: '%d weeks',
    M: 'a month',
    MM: '%d months',
    y: 'a year',
    yy: '%d years',
  },
});;


moment.localeData('en').relativeTime['s'] = 'seconds';

export const getTimeFromNow = (value, isWithoutUtc = true) => {
  if (!value) {
    return null;
  }

  if (isWithoutUtc) {
    return moment(value).fromNow()
  }

  return moment.utc(value).fromNow()
};

export const getFormatedCreatedDate = value => {
  if (!value) {
    return null;
  }

  return new Date(value)?.toLocaleDateString();
};

export const isBefore = (a, b) => new Date(b).getTime() - new Date(a).getTime();

export const isToday = value => {
  const day = new Date(value);
  return TODAY.getDate() === day.getDate() &&
    TODAY.getMonth() === day.getMonth() &&
    TODAY.getFullYear() === day.getFullYear()
    ? 1
    : 0;
};

export const isYesterday = value => {
  const day = new Date(value).getTime();
  return day < TODAY.getTime() && day > ONE_DAY.getTime();
};

export const isThisWeek = value => {
  const day = new Date(value).getTime();
  return day < TODAY.getTime() && day > SEVEN_DAY.getTime();
};

export const isLastWeek = value => {
  const day = new Date(value).getTime();
  return day < SEVEN_DAY.getTime() && day > 2 * SEVEN_DAY.getTime();
};

export const isThisMonth = value => {
  const day = new Date(value);
  return TODAY.getMonth() === day.getMonth() &&
    TODAY.getFullYear() === day.getFullYear()
    ? 1
    : 0;
};

export const isEmptyContentDate = value => {
  if (!value) {
    return false;
  }

  return parseInt(value.split('-')[0], 10) < 1980;
};

export const isEmptyDate = s => parseInt(s.split('-')[0], 10) < 1980;

/**
 * Accepts javascript date , returns number of days between given date and todays date.
 *
 * */
export const daysTillDate = dateObj => {
  const given = moment(dateObj);
  const current = moment();
  return Math.round(moment.duration(given.diff(current)).asDays());
};

/**
 * Accepts javascript date and moment format, returns date formatted with given format.
 * For example d = '2022-04-13T18:16:42+00:00' , format = 'LL' will return 'April 13, 2022'
 *
 * */
export const dateToFormatted = (d, format = 'LLLL') => {
  const isTimeZoned =
    d.indexOf('.') !== -1 || d.indexOf('+') !== -1 ? d : `${d}.000Z`;
  const dm = moment(new Date(isTimeZoned));
  return dm.format(format);
};
