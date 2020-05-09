import {
  getSolarNoonLSTInFractions,
  getSunriseInFractions,
  getSunsetInFractions
} from '.';

type Result = {
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
type TestCaseItem = [string, Date, number, number, Result];

const testCases: {
  [index: string]: TestCaseItem;
  jakarta: TestCaseItem;
} = {
  jakarta: [
    'Jakarta, May 9, 2020, 00.00.00',
    new Date(2020, 4, 9),
    -6.2,
    106.816666,
    {
      sunriseTime: '05:41:18',
      sunsetTime: '18:09:50',
      solarNoonTime: '11:55:34',
      sunrise: 0.2373670492,
      solarNoon: 0.4972495172,
      sunset: 0.7571319852,
      sunriseSeconds: 0.2373670492 * 86400,
      solarNoonSeconds: 0.4972495172 * 86400,
      sunsetSeconds: 0.7571319852 * 86400
    }
  ]
};

function check(expected: any, received: any) {
  // Difference tolerance is smaller than 0.05.
  expect(expected).toBeCloseTo(received, 1);
}

describe('getSolarNoonLST', () => {
  const keys = Object.keys(testCases);

  for (const key of keys) {
    const [title, date, lat, long, result] = testCases[key];

    it(title, () => {
      check(getSolarNoonLSTInFractions(date, lat, long), result.solarNoon);
      check(getSunriseInFractions(date, lat, long), result.sunrise);
      check(getSunsetInFractions(date, lat, long), result.sunset);
    });
  }
});
