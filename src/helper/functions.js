import useRequest from "../hooks/useRequest";
import apiPath from "../constants/apiPath";
import { Severty, ShowToast } from "./toast";

import moment from "moment";

export const getFileExtension = (url) => {
  // Get the last part of the URL after the last '/'
  const filename = url.substring(url.lastIndexOf("/") + 1);

  // Get the file extension by getting the last part of the filename after the last '.'
  const extension = filename.substring(filename.lastIndexOf(".") + 1);

  return extension;
};

export const calculateAge = (dob) => {
  console.log("dob????????????????", dob);
  if (!dob) return null;

  const today = moment();
  const birthDate = moment(dob, "DD-MM-YYYY"); // Specify the format 'DD-MM-YYYY'
  const years = today.diff(birthDate, "years");
  birthDate.add(years, "years");
  const months = today.diff(birthDate, "months");
  birthDate.add(months, "months");
  const days = today.diff(birthDate, "days");
  console.log(years, months, days);
  return { years, months, days };
};

export const IstConvert = (time) => {
  const IST_offset_hours = 5;
  const IST_offset_minutes = 30;

  // Parse original times
  const [from_hours, from_minutes] = time.split(":").map(Number);

  // Add IST offset
  let IST_from_hours = from_hours + IST_offset_hours;
  let IST_from_minutes = from_minutes + IST_offset_minutes;

  // Adjust if minutes exceed 60
  if (IST_from_minutes >= 60) {
    IST_from_hours += 1;
    IST_from_minutes -= 60;
  }

  // Adjust if hours exceed 24
  IST_from_hours %= 24;
  const IST_appointment_time = `${String(IST_from_hours).padStart(2, "0")}:${String(IST_from_minutes).padStart(2, "0")}`;
  return IST_appointment_time;
};

export const isObjectEmpty = (obj) => {
  for (const key in obj) {
    if (obj[key]) {
      if (obj[key] === '{"min":0,"max":20000000}') {
      } else {
        return false;
      }
    }
  }
  return true;
};

export function formatDate(date) {
  const now = moment();
  const inputDate = moment(date);

  if (now.isSame(inputDate, "day")) {
    return "Today, " + inputDate.format("hh:mm A");
  } else if (now.subtract(1, "day").isSame(inputDate, "day")) {
    return "Yesterday, " + inputDate.format("hh:mm A");
  } else {
    return inputDate.format("DD/MM/YYYY, hh:mm A");
  }
}

export function formatPhone(countryCode, phoneNumber) {
  const numericPhoneNumber = phoneNumber.replace(/\D/g, "");
  if (countryCode && numericPhoneNumber) {
    const groups = numericPhoneNumber.match(/(\d{2})(\d{3})(\d{3})(\d+)/);
    if (groups) {
      return `+${countryCode}-${groups[1]}-${groups[2]}-${groups[3]}-${groups[4]}`;
    }
  }
  return phoneNumber;
}

export const calculateAgeInYearsAndMonths = (dob) => {
  const birthDate = moment(dob, "DD-MM-YYYY"); // Parse DOB in "DD-MM-YYYY" format
  const today = moment(); // Current date

  if (birthDate.isAfter(today)) {
    return "Todays";
  }

  // Calculate years and months
  const years = today.diff(birthDate, "years");
  birthDate.add(years, "years"); // Move birthDate forward by the calculated years
  const months = today.diff(birthDate, "months");
  const days = today.diff(birthDate, "days");

  if (years == 0 && months == 0) {
    return `Under a month old`;
  } else if (years == 0) {
    return `${months} months old`;
  } else if (months == 0) {
    return `${years} yrs. old`;
  } else {
    return `${years} yrs. ${months} months old`;
  }
};

export const calculateAgeInYearsAndMonthsInDr = (dob) => {
  const birthDate = moment(dob, "DD-MM-YYYY"); // Parse DOB in "DD-MM-YYYY" format
  const today = moment(); // Current date

  if (birthDate.isAfter(today)) {
    return "Todays";
  }

  // Calculate years and months
  const years = today.diff(birthDate, "years");
  birthDate.add(years, "years"); // Move birthDate forward by the calculated years
  const months = today.diff(birthDate, "months");
  const days = today.diff(birthDate, "days");

  if (years == 0 && months == 0) {
    return `Under a month old`;
  } else if (years == 0) {
    return `${months} months old`;
  } else if (months == 0) {
    return `${years} yrs. old`;
  } else {
    return `${years} yrs. ${months} months old`;
  }
};
export function unixToLocalDateTime(unixTimestamp) {
  return moment.unix(unixTimestamp); // expects seconds
}
