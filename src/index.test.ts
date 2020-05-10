import {
  getSolarNoonLSTInFractions,
  getSunriseInFractions,
  getSunsetInFractions,
  getJulianDate,
  getSolarNoonLSTDate,
  getSolarNoonLSTInSeconds,
  getSunriseDate,
  getSunriseInSeconds,
  getSunsetDate,
  getSunsetInSeconds
} from '.';
// Use date-fns helper functions.
import format from 'date-fns/format';

type Result = {
  julianDate: number;
  sunriseTime: string;
  sunsetTime: string;
  solarNoonTime: string;
  sunrise: number;
  sunset: number;
  solarNoon: number;
  sunriseSeconds: number;
  sunsetSeconds: number;
  solarNoonSeconds: number;
};
// A tuple of [title, date, tzOffset, latitude, longitude, and result].
type TestCaseItem = [string, Date, number, number, number, Result];

const testCases: {
  [index: string]: TestCaseItem;
} = {
  jakarta: [
    'Jakarta, May 9, 2020, 00.00.00',
    new Date(2020, 4, 9),
    -420,
    -6.2,
    106.816666,
    {
      julianDate: 2458978.208333,
      sunrise: 0.2454617914,
      solarNoon: 0.4924998851,
      sunset: 0.7395379788,
      sunriseSeconds: 0.2454617914 * 86400,
      solarNoonSeconds: 0.4924998851 * 86400,
      sunsetSeconds: 0.7395379788 * 86400,
      sunriseTime: '05:53:28',
      solarNoonTime: '11:49:12',
      sunsetTime: '17:44:56'
    }
  ],
  melbourne: [
    'Melbourne, December 30, 2021, 20.18.00',
    new Date(2021, 11, 30, 20, 18, 0),
    -660,
    -37.8136,
    144.9631,
    {
      // 0.5574355193	0.2502435199	0.8646275187
      julianDate: 2459578.8875,
      sunrise: 0.2502435199,
      solarNoon: 0.5574355193,
      sunset: 0.8646275187,
      sunriseSeconds: 0.2502435199 * 86400,
      solarNoonSeconds: 0.5574355193 * 86400,
      sunsetSeconds: 0.8646275187 * 86400,
      sunriseTime: '06:00:21',
      solarNoonTime: '13:22:42',
      sunsetTime: '20:45:04'
    }
  ]
};

const keys = Object.keys(testCases);

for (const key of keys) {
  const [title, date, tzOffset, lat, long, result] = testCases[key];
  const params = { date, latitude: lat, longitude: long, tzOffset };

  describe(title, () => {
    it('Julian date', () => {
      expect(getJulianDate(date, tzOffset)).toBeCloseTo(result.julianDate, 1);
    });

    // Fractions.
    it('getSolarNoonLSTInFractions', () => {
      expect(getSolarNoonLSTInFractions(params)).toBeCloseTo(
        result.solarNoon,
        1
      );
    });

    it('getSunriseInFractions', () => {
      expect(getSunriseInFractions(params)).toBeCloseTo(result.sunrise, 1);
    });

    it('getSunsetInFractions', () => {
      expect(getSunsetInFractions(params)).toBeCloseTo(result.sunset, 1);
    });

    // Seconds.
    it('getSolarNoonLSTInSeconds', () => {
      expect(getSolarNoonLSTInSeconds(params)).toBeCloseTo(
        result.solarNoonSeconds,
        1
      );
    });

    it('getSunriseInSeconds', () => {
      expect(getSunriseInSeconds(params)).toBeCloseTo(result.sunriseSeconds, 1);
    });

    it('getSunsetInSeconds', () => {
      expect(getSunsetInSeconds(params)).toBeCloseTo(result.sunsetSeconds, 1);
    });

    // Dates.
    it('getSolarNoonLSTDate', () => {
      const formatted = format(getSolarNoonLSTDate(params), 'HH:mm:ss');

      expect(formatted).toBe(result.solarNoonTime);
    });

    it('getSunriseDate', () => {
      const formatted = format(getSunriseDate(params), 'HH:mm:ss');

      expect(formatted).toBe(result.sunriseTime);
    });

    it('getSunsetDate', () => {
      const formatted = format(getSunsetDate(params), 'HH:mm:ss');

      expect(formatted).toBe(result.sunsetTime);
    });
  });
}
