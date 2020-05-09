// Source: https://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html.
import {
  differenceInCalendarDays,
  startOfDay,
  format,
  addSeconds
} from 'date-fns';

const { PI, cos, sin, asin, acos, tan, pow } = Math;

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
  const jd =
    differenceInCalendarDays(new Date(), new Date(2000, 0, 1, 12)) +
    JULIAN_DAYS_ON_20000501_1200 +
    LEAP_SECOND_AND_TERRESTIAL_TIME;
  const jc = (jd - JULIAN_DAYS_ON_20000501_1200) / ONE_JULIAN_CENTURY;

  // Mean longitude of the sun in degrees.
  const gmLongSun = (280.46646 + (jc * 36000.76983 + jc * 0.0003032)) % 360;
  // Mean anomaly of the sun in degrees.
  const gmAnomSun = 357.52911 + (jc * 35999.05029 - 0.0001537 * jc);
  const eccentOrbitEarth = 0.016708634 - jc * (0.000042037 + 0.0000001267 * jc);

  // Mean obliq ecliptic.
  const meanObliqEcliptic =
    23 +
    (26 + (21.448 - jc * (46.815 + jc * (0.00059 - jc * 0.001813))) / 60) / 60;
  const obliqCorr =
    meanObliqEcliptic + 0.00256 * cos(toRadian(125.04 - 1934.136 * jc));
  const vary = pow(tan(toRadian(obliqCorr / 2)), 2);

  // Sun calculations.
  const sunEqCtr =
    sin(toRadian(gmAnomSun)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    sin(toRadian(2 * gmAnomSun)) * (0.019993 - 0.000101 * jc) +
    sin(toRadian(3 * gmAnomSun)) * 0.000289;
  const sunTrueLongitude = gmLongSun + sunEqCtr;
  // Sun apprearance longitude (degrees).
  const sunAppearLong =
    sunTrueLongitude -
    0.00569 -
    0.00478 * sin(toRadian(125.04 - 1934.136 * jc));
  // Sun declination.
  const sunDecl = toDegree(
    asin(sin(toRadian(obliqCorr)) * sin(toRadian(sunAppearLong)))
  );

  // Equation of time.
  const eq =
    4 *
    toDegree(
      vary * sin(2 * toRadian(gmLongSun)) -
        2 * eccentOrbitEarth * sin(toRadian(gmAnomSun)) +
        4 *
          eccentOrbitEarth *
          vary *
          sin(toRadian(gmAnomSun)) *
          cos(2 * toRadian(gmLongSun)) -
        0.5 * vary * vary * sin(4 * toRadian(gmLongSun)) -
        1.25 *
          eccentOrbitEarth *
          eccentOrbitEarth *
          sin(2 * toRadian(gmAnomSun))
    );
  const haSunrise = toDegree(
    acos(
      cos(toRadian(90.833)) /
        (cos(toRadian(latitude)) * cos(toRadian(sunDecl))) -
        tan(toRadian(latitude)) * tan(toRadian(sunDecl))
    )
  );

  // Now we just need to find the highest time of sun.
  const solarNoon =
    (720 - 4 * longitude - eq + date.getTimezoneOffset() * -1) / 1440;

  // Make them all seconds within a day.
  const solarNoonSeconds = solarNoon * 86400;
  const sunriseSeconds = solarNoonSeconds - ((haSunrise * 4) / 1440) * 86400;
  const sunsetSeconds = solarNoonSeconds + ((haSunrise * 4) / 1440) * 86400;

  const start = startOfDay(date);

  return {
    sunrise: format(addSeconds(start, sunriseSeconds), 'HH:mm:ss'),
    lst: format(addSeconds(start, solarNoon * 86400), 'HH:mm:ss'),
    sunset: format(addSeconds(start, sunsetSeconds), 'HH:mm:ss')
  };
}
