// Source: https://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html.
import {
  getDayOfYear,
  getHours,
  getDaysInYear,
  differenceInCalendarDays
} from 'date-fns';

const { PI, cos, sin, acos, tan } = Math;

// Julian days is number of days since Monday, January 1, 4713 BC.
// Source: https://en.wikipedia.org/wiki/Julian_day.
const JULIAN_DAYS_ON_20000501_1200 = 2451545;
// Standard epoch of J2000.0. When we hit year 2100, the Epoch will change.
// As written in the source, "Please note that calculations in the spreadsheets are only
// valid for dates between 1901 and 2099, due to an approximation used in the Julian Day calculation".
const ONE_JULIAN_CENTURY = 36525;
const LEAP_SECOND_AND_TERRESTIAL_TIME = 0.0008;

const toRadian = (degree: number) => (degree * PI) / 180;
const toDegree = (radian: number) => (radian * 180) / PI;

export function calculate(date: Date, latitude: number, longitude: number) {
  const julianDate =
    differenceInCalendarDays(new Date(), new Date(2000, 0, 1, 12)) +
    JULIAN_DAYS_ON_20000501_1200 +
    LEAP_SECOND_AND_TERRESTIAL_TIME;
  const julianCentury =
    (julianDate - JULIAN_DAYS_ON_20000501_1200) / ONE_JULIAN_CENTURY;

  // Mean longitude of the sun in degrees.
  const geomMeanLongSun =
    (280.46646 + (julianCentury * 36000.76983 + julianCentury * 0.0003032)) %
    360;
  // Mean anomaly of the sun in degrees.
  const geomMeanAnomSun =
    357.52911 + (julianCentury * 35999.05029 - 0.0001537 * julianCentury);

  console.table([julianDate, julianCentury, geomMeanLongSun, geomMeanAnomSun]);

  // const daysInYear = getDaysInYear(date);
  // const dayOfYear = getDayOfYear(date);
  // const hour = getHours(date);

  // // Calculate γ, fractional year (in radian).
  // const fractionalYear =
  //   ((2 * PI) / daysInYear) * (dayOfYear - 1 + (hour - 12) / 24);

  // // Calculate equation of time (in minutes).
  // const eqTime =
  //   229.18 *
  //   (0.000075 +
  //     0.001868 * cos(fractionalYear) -
  //     0.032077 * sin(fractionalYear) -
  //     0.014615 * cos(2 * fractionalYear) -
  //     0.040849 * sin(2 * fractionalYear));

  // // Calculate the solar declination angle (in radians).
  // const declRadian =
  //   0.006918 -
  //   0.399912 * cos(fractionalYear) +
  //   0.070257 * sin(fractionalYear) -
  //   0.006758 * cos(2 * fractionalYear) +
  //   0.000907 * sin(2 * fractionalYear) -
  //   0.002697 * cos(3 * fractionalYear) +
  //   0.00148 * sin(3 * fractionalYear);

  // // Positive means sunrise, negative means sunset.
  // const latitudeRadian = toRadian(latitude);
  // const hourAngle = acos(
  //   cos(toRadian(90.833)) / (cos(latitudeRadian) * cos(declRadian)) -
  //     tan(latitudeRadian) * tan(declRadian)
  // );

  // const sunriseOrSet = 720 - 4 * (longitude + hourAngle) - eqTime;

  // Solar noon is the time where the sun reaches the highest position.
  // const solarNoon = 720 - (4 * longitude - eqTime);

  // return sunriseOrSet;
}

// (() => {
//   console.log(calculate(new Date(), -6.2, 106.816666));
// })();
