export let transformReactDate = (d) => {
  d = new Date(d);
  let month = "" + (d.getMonth() + 1);
  let day = "" + d.getDate();
  let year = d.getFullYear();
  let updatedDate = new Date(`${month}/${day}/${year}`);
  return updatedDate;
};
export let transformReactDateInput = (d) => {
  d = new Date(d);
  var date = d.toISOString().substr(0, 10);
  return date;
};
export let transformDate = (date) => {
  let dataDate = date.toString();
  let year = dataDate.slice(0, 4);
  let month = dataDate.slice(4, 6);
  let day = dataDate.slice(6, 8);
  let updatedDate = new Date(`${month}/${day}/${year}`);
  return updatedDate;
};
export const isToday = (date, currentDate = new Date()) => {
  if (!currentDate) {
    currentDate = new Date();
  } else {
    currentDate = new Date(currentDate);
  }
  date = transformDate(date);
  currentDate = transformReactDate(currentDate);
  if (date.toDateString() === currentDate.toDateString()) {
    return true;
  }
  return false;
};
export const isLastWorkingDays = (transitionDate, currentDate = new Date()) => {
  if (!currentDate) {
    currentDate = new Date();
  } else {
    currentDate = new Date(currentDate);
  }
  let date = transformReactDate(currentDate);
  let currentDay = date.getDay();
  let subtractDays = 0;
  if (currentDay === 0) {
    subtractDays = 2;
  } else {
    subtractDays = 1;
  }
  date.setDate(date.getDate() - subtractDays);
  transitionDate = transformDate(transitionDate);
  if (date.toDateString() === transitionDate.toDateString()) {
    return true;
  }
  return false;
};
export const isLastWeek = (transitionDate, currentDate = new Date()) => {
  if (!currentDate) {
    currentDate = new Date();
  } else {
    currentDate = new Date(currentDate);
  }
  if (isToday(transitionDate, currentDate)) {
    return false;
  }
  let date = transformReactDate(currentDate);
  date.setDate(date.getDate() - 8);
  transitionDate = transformDate(transitionDate);
  if (date.getTime() <= transitionDate.getTime()) {
    return true;
  }
  return false;
};
export const isLast30Days = (transitionDate, currentDate = new Date()) => {
  if (!currentDate) {
    currentDate = new Date();
  } else {
    currentDate = new Date(currentDate);
  }

  if (isToday(transitionDate, currentDate)) {
    return false;
  }
  let date = transformReactDate(currentDate);
  date.setDate(date.getDate() - 1);
  date.setMonth(date.getMonth() - 1);
  transitionDate = transformDate(transitionDate);
  if (date.getTime() <= transitionDate.getTime()) {
    return true;
  }
  return false;
};
export const isLastOneYear = (transitionDate, currentDate = new Date()) => {
  if (!currentDate) {
    currentDate = new Date();
  } else {
    currentDate = new Date(currentDate);
  }
  if (isToday(transitionDate, currentDate)) {
    return false;
  }
  let date = transformReactDate(currentDate);
  date.setDate(date.getDate() - 1);
  date.setFullYear(date.getFullYear() - 1);
  transitionDate = transformDate(transitionDate);
  if (date.getTime() <= transitionDate.getTime()) {
    return true;
  }
  return false;
};
export const isMoreThanOneYear = (transitionDate, currentDate = new Date()) => {
  if (!currentDate) {
    currentDate = new Date();
  } else {
    currentDate = new Date(currentDate);
  }
  if (isToday(transitionDate, currentDate)) {
    return false;
  }
  let date = transformReactDate(currentDate);
  date.setDate(date.getDate() - 1);
  date.setFullYear(date.getFullYear() - 1);
  transitionDate = transformDate(transitionDate);
  if (date.getTime() >= transitionDate.getTime()) {
    return true;
  }
  return false;
  // let date = transformReactDate(new Date());
  // date.setFullYear(date.getFullYear() - 1);
  // transitionDate = transformDate(transitionDate);
  // if (date.getTime() <= transitionDate.getTime()) {
  // }
  // return false;
};
