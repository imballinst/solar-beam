// Source: https://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html.
import {
  differenceInCalendarDays,
  startOfDay,
  format,
  addSeconds,
  subHours,
  differenceInDays,
  getMinutes,
  getHours,
  addMinutes
} from 'date-fns';

const { PI, cos, sin, asin, acos, tan, pow, round } = Math;

// Julian days is number of days since Monday, January 1, 4713 BC.
const JULIAN_DAYS_ON_19000501_1200_APPROX = 2415018.5;
const JULIAN_DAYS_ON_19000501_1200 = 2451545;
// Standard epoch of J1900.0. When we hit year 2100, the Epoch will change.
// As written in the source, "Please note that calculations in the spreadsheets are only
// valid for dates between 1901 and 2099, due to an approximation used in the Julian Day calculation".
const ONE_JULIAN_CENTURY = 36525;

const radians = (degree: number) => (degree * PI) / 180;
const degrees = (radian: number) => (radian * 180) / PI;

// Baseline numbers.
function getDayFraction(date: Date) {
  return (getMinutes(date) / 60 + getHours(date)) / 24;
}

function getDecimalNumbers(value: number, defaultNumberOfDecimals = 4) {
  return Number(value.toFixed(defaultNumberOfDecimals));
}

function getJulianDate(date: Date, tzOffset = date.getTimezoneOffset()) {
  // Source: https://www.aavso.org/computing-jd.
  const utc = addMinutes(date, tzOffset);
  const gmat = subHours(utc, 12);

  const decimal = getDayFraction(gmat);

  const jd =
    differenceInCalendarDays(date, new Date(1900, 0, 1, 12)) +
    JULIAN_DAYS_ON_19000501_1200_APPROX +
    // Include the end date.
    1;

  return jd + decimal;
}

function getBaselineNumbers(date: Date) {
  const jd = getJulianDate(date);
  const jc = (jd - JULIAN_DAYS_ON_19000501_1200) / ONE_JULIAN_CENTURY;

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
    meanObliqEcliptic + 0.00256 * cos(radians(125.04 - 1934.136 * jc));
  const vary = pow(tan(radians(obliqCorr / 2)), 2);

  // Sun equation of thecenter.
  const sunEqCtr =
    sin(radians(gmAnomSun)) * (1.914602 - jc * (0.004817 + 0.000014 * jc)) +
    sin(radians(2 * gmAnomSun)) * (0.019993 - 0.000101 * jc) +
    sin(radians(3 * gmAnomSun)) * 0.000289;
  const sunTrueLongitude = gmLongSun + sunEqCtr;
  // Sun apprearance longitude (degrees).
  const sunAppearLong =
    sunTrueLongitude - 0.00569 - 0.00478 * sin(radians(125.04 - 1934.136 * jc));

  // Sun declination.
  const sunDecl = degrees(
    asin(sin(radians(obliqCorr)) * sin(radians(sunAppearLong)))
  );
  // Equation of time.
  const eq =
    4 *
    degrees(
      vary * sin(2 * radians(gmLongSun)) -
        2 * eccentOrbitEarth * sin(radians(gmAnomSun)) +
        4 *
          eccentOrbitEarth *
          vary *
          sin(radians(gmAnomSun)) *
          cos(2 * radians(gmLongSun)) -
        0.5 * vary * vary * sin(4 * radians(gmLongSun)) -
        1.25 * eccentOrbitEarth * eccentOrbitEarth * sin(2 * radians(gmAnomSun))
    );

  return {
    eq,
    sunDecl
  };
}

// Baseline numbers for sunrise and sunset.
function getBaselineNumbersForSunriseAndSunset(
  date: Date,
  latitude: number,
  longitude: number
) {
  const { eq, sunDecl } = getBaselineNumbers(date);
  const haSunrise = degrees(
    acos(
      cos(radians(90.833)) / (cos(radians(latitude)) * cos(radians(sunDecl))) -
        tan(radians(latitude)) * tan(radians(sunDecl))
    )
  );

  // Now we just need to find the highest time of sun.
  const solarNoon =
    (720 - 4 * longitude - eq + date.getTimezoneOffset() * -1) / 1440;

  return {
    haSunrise,
    solarNoon
  };
}

// Functions that return in seconds.
export function getSolarNoonLSTInSeconds(
  date: Date,
  latitude: number,
  longitude: number
) {
  const { solarNoon } = getBaselineNumbersForSunriseAndSunset(
    date,
    latitude,
    longitude
  );

  return solarNoon * 86400;
}

export function getSunriseInSeconds(
  date: Date,
  latitude: number,
  longitude: number
) {
  const { haSunrise, solarNoon } = getBaselineNumbersForSunriseAndSunset(
    date,
    latitude,
    longitude
  );
  const solarNoonInSeconds = solarNoon * 86400;

  return solarNoonInSeconds - ((haSunrise * 4) / 1440) * 86400;
}

export function getSunsetInSeconds(
  date: Date,
  latitude: number,
  longitude: number
) {
  const { haSunrise, solarNoon } = getBaselineNumbersForSunriseAndSunset(
    date,
    latitude,
    longitude
  );
  const solarNoonInSeconds = solarNoon * 86400;

  return solarNoonInSeconds + ((haSunrise * 4) / 1440) * 86400;
}

// Functions that return the fraction.
export function getSolarNoonLSTInFractions(
  date: Date,
  latitude: number,
  longitude: number
) {
  return getSolarNoonLSTInSeconds(date, latitude, longitude) / 86400;
}

export function getSunriseInFractions(
  date: Date,
  latitude: number,
  longitude: number
) {
  return getSunriseInSeconds(date, latitude, longitude) / 86400;
}

export function getSunsetInFractions(
  date: Date,
  latitude: number,
  longitude: number
) {
  return getSunsetInSeconds(date, latitude, longitude) / 86400;
}

// Functions to get the exact date.
export function getSolarNoonLST(
  date: Date,
  latitude: number,
  longitude: number
) {
  const { solarNoon } = getBaselineNumbersForSunriseAndSunset(
    date,
    latitude,
    longitude
  );

  const solarNoonInSeconds = solarNoon * 86400;
  const start = startOfDay(date);

  return addSeconds(start, solarNoonInSeconds);
}

export function getSunrise(date: Date, latitude: number, longitude: number) {
  const { haSunrise, solarNoon } = getBaselineNumbersForSunriseAndSunset(
    date,
    latitude,
    longitude
  );

  const solarNoonInSeconds = solarNoon * 86400;
  const sunriseSeconds = solarNoonInSeconds - ((haSunrise * 4) / 1440) * 86400;
  const start = startOfDay(date);

  return addSeconds(start, sunriseSeconds);
}

export function getSunset(date: Date, latitude: number, longitude: number) {
  const { haSunrise, solarNoon } = getBaselineNumbersForSunriseAndSunset(
    date,
    latitude,
    longitude
  );

  const solarNoonInSeconds = solarNoon * 86400;
  const sunriseSeconds = solarNoonInSeconds + ((haSunrise * 4) / 1440) * 86400;
  const start = startOfDay(date);

  return addSeconds(start, sunriseSeconds);
}

// TODO: get solar elevation.
