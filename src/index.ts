// Source: https://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html.
import differenceInCalendarDays from 'date-fns/differenceInCalendarDays';
import startOfDay from 'date-fns/startOfDay';
import addSeconds from 'date-fns/addSeconds';
import getMinutes from 'date-fns/getMinutes';
import getHours from 'date-fns/getHours';

const { PI, cos, sin, asin, acos, tan, pow } = Math;

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

/**
 * Gets the decimal fraction of the day. For example, 6 o'clock will return 0.25.
 * @param date The **local** date we are trying to calculate. It's not UTC or GMAT.
 */
function getDayFraction(date: Date) {
  return (getMinutes(date) / 60 + getHours(date)) / 24;
}

function getDecimalNumbers(value: number, defaultNumberOfDecimals = 4) {
  return Number(value.toFixed(defaultNumberOfDecimals));
}

// Allow "mocking" the tzOffset.
export function getJulianDate(date: Date, tzOffset = date.getTimezoneOffset()) {
  const decimal = getDayFraction(date);
  const tzSubtractor = (-1 * tzOffset) / 1440;

  return (
    differenceInCalendarDays(date, new Date(1900, 0, 1, 12)) +
    JULIAN_DAYS_ON_19000501_1200_APPROX +
    // Include the end date and a bit of rounding.
    2 +
    decimal -
    tzSubtractor
  );
}

function getBaselineNumbers(date: Date, tzOffset: number) {
  const jd = getJulianDate(date, tzOffset);
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
type MainFunctionParams = {
  date: Date;
  latitude: number;
  longitude: number;
  tzOffset?: number;
};

function getBaselineNumbersForSunriseAndSunset({
  date,
  latitude,
  longitude,
  tzOffset = date.getTimezoneOffset()
}: MainFunctionParams) {
  const { eq, sunDecl } = getBaselineNumbers(date, tzOffset);
  const haSunrise = degrees(
    acos(
      cos(radians(90.833)) / (cos(radians(latitude)) * cos(radians(sunDecl))) -
        tan(radians(latitude)) * tan(radians(sunDecl))
    )
  );

  // Now we just need to find the highest time of sun.
  const solarNoon = (720 - 4 * longitude - eq + tzOffset * -1) / 1440;

  return {
    haSunrise,
    solarNoon
  };
}

// Functions that return in seconds.
export function getSolarNoonLSTInSeconds(params: MainFunctionParams) {
  const { solarNoon } = getBaselineNumbersForSunriseAndSunset(params);

  return solarNoon * 86400;
}

export function getSunriseInSeconds(params: MainFunctionParams) {
  const { haSunrise, solarNoon } = getBaselineNumbersForSunriseAndSunset(
    params
  );
  const solarNoonInSeconds = solarNoon * 86400;

  return solarNoonInSeconds - ((haSunrise * 4) / 1440) * 86400;
}

export function getSunsetInSeconds(params: MainFunctionParams) {
  const { haSunrise, solarNoon } = getBaselineNumbersForSunriseAndSunset(
    params
  );
  const solarNoonInSeconds = solarNoon * 86400;

  return solarNoonInSeconds + ((haSunrise * 4) / 1440) * 86400;
}

// Functions that return the fraction.
export function getSolarNoonLSTInFractions(params: MainFunctionParams) {
  return getSolarNoonLSTInSeconds(params) / 86400;
}

export function getSunriseInFractions(params: MainFunctionParams) {
  return getSunriseInSeconds(params) / 86400;
}

export function getSunsetInFractions(params: MainFunctionParams) {
  return getSunsetInSeconds(params) / 86400;
}

// Functions to get the exact date.
export function getSolarNoonLSTDate(params: MainFunctionParams) {
  const { solarNoon } = getBaselineNumbersForSunriseAndSunset(params);

  const solarNoonInSeconds = solarNoon * 86400;
  const start = startOfDay(params.date);

  return addSeconds(start, getDecimalNumbers(solarNoonInSeconds, 0));
}

export function getSunriseDate(params: MainFunctionParams) {
  const { haSunrise, solarNoon } = getBaselineNumbersForSunriseAndSunset(
    params
  );

  const solarNoonInSeconds = solarNoon * 86400;
  const sunriseSeconds = solarNoonInSeconds - ((haSunrise * 4) / 1440) * 86400;
  const start = startOfDay(params.date);

  return addSeconds(start, getDecimalNumbers(sunriseSeconds, 0));
}

export function getSunsetDate(params: MainFunctionParams) {
  const { haSunrise, solarNoon } = getBaselineNumbersForSunriseAndSunset(
    params
  );

  const solarNoonInSeconds = solarNoon * 86400;
  const sunriseSeconds = solarNoonInSeconds + ((haSunrise * 4) / 1440) * 86400;
  const start = startOfDay(params.date);

  return addSeconds(start, getDecimalNumbers(sunriseSeconds, 0));
}

export function getSolarElevationAngle({
  date,
  latitude,
  longitude,
  tzOffset = date.getTimezoneOffset()
}: MainFunctionParams) {
  const { eq, sunDecl } = getBaselineNumbers(date, tzOffset);

  const trueSolarTime =
    (getDayFraction(date) * 1440 +
      eq +
      4 * longitude -
      60 * ((-1 * tzOffset) / 60)) %
    1440;

  const angleAddition = trueSolarTime / 4 < 0 ? 180 : -180;
  const hourAngle = trueSolarTime / 4 + angleAddition;

  const solarZenithAngle = degrees(
    acos(
      sin(radians(latitude)) * sin(radians(sunDecl)) +
        cos(radians(latitude)) * cos(radians(sunDecl)) * cos(radians(hourAngle))
    )
  );
  const solarElevationAngle = 90 - solarZenithAngle;

  let atmosphericRefractionApproximate;

  if (solarElevationAngle > 85) {
    atmosphericRefractionApproximate = 0;
  } else if (solarElevationAngle > 5) {
    atmosphericRefractionApproximate =
      58.1 / tan(radians(solarElevationAngle)) -
      0.07 / pow(tan(radians(solarElevationAngle)), 3) +
      0.000086 / pow(tan(radians(solarElevationAngle)), 5);
  } else if (solarElevationAngle > -0.575) {
    atmosphericRefractionApproximate =
      1735 +
      solarElevationAngle *
        (-518.2 +
          solarElevationAngle *
            (103.4 +
              solarElevationAngle * (-12.79 + solarElevationAngle * 0.711)));
  } else {
    atmosphericRefractionApproximate =
      -20.772 / tan(radians(solarElevationAngle));
  }

  // Divide by 3600.
  atmosphericRefractionApproximate /= 3600;

  return solarElevationAngle + atmosphericRefractionApproximate;
}
