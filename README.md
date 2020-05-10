# solar-beam

General solar position calculator powered with TypeScript. The calculation is based on the spreadsheet from [Earth System Research Laboratory](https://www.esrl.noaa.gov/gmd/grad/solcalc/calcdetails.html).

DISCLAIMER: Please be mindful when using this library, as there is no guarantee that the values are valid. As written on the section "Data for Litigation":

> The NOAA Solar Calculator is for research and recreational use only. NOAA cannot certify or authenticate sunrise, sunset or solar position data. The U.S. Government does not collect observations of astronomical data, and due to atmospheric conditions our calculated results may vary significantly from actual observed values.

## Installation

```bash
# npm
npm install --save solar-beam

# yarn
yarn add solar-beam
```

## Usage

```ts
import { getJulianDate } from 'solar-beam';

// May 5th, 2020, 12am o'clock, GMT +7.
const date = new Date(2020, 4, 9);
getJulianDate(date, -420); // 2458978.2083333335.
```

## Available functions

### Common utils

| Function name   | Parameter                | Description                                                                |
| --------------- | ------------------------ | -------------------------------------------------------------------------- |
| `getJulianDate` | `(date: Date) => number` | Returns the current [Julian day](https://en.wikipedia.org/wiki/Julian_day) |

### Fractions

| Function name                | Parameter                                | Description                                                           |
| ---------------------------- | ---------------------------------------- | --------------------------------------------------------------------- |
| `getSolarNoonLSTInFractions` | `(params: MainFunctionParams) => number` | Returns the solar noon time fraction from the given date and location |
| `getSunriseInFractions`      | `(params: MainFunctionParams) => number` | Returns the sunrise time fraction from the given date and location    |
| `getSunsetInFractions`       | `(params: MainFunctionParams) => number` | Returns the sunset time fraction from the given date and location     |

### Seconds

| Function name              | Parameter                                | Description                                                                |
| -------------------------- | ---------------------------------------- | -------------------------------------------------------------------------- |
| `getSolarNoonLSTInSeconds` | `(params: MainFunctionParams) => number` | Returns the solar noon seconds (of a day) from the given date and location |
| `getSunriseInSeconds`      | `(params: MainFunctionParams) => number` | Returns the sunrise seconds (of a day) from the given date and location    |
| `getSunsetInSeconds`       | `(params: MainFunctionParams) => number` | Returns the sunset seconds (of a day) from the given date and location     |

### Date

| Function name         | Parameter                                | Description                                                                       |
| --------------------- | ---------------------------------------- | --------------------------------------------------------------------------------- |
| `getSolarNoonLSTDate` | `(params: MainFunctionParams) => string` | Returns the solar noon time in `HH:mm:ss` format from the given date and location |
| `getSunriseDate`      | `(params: MainFunctionParams) => string` | Returns the sunrise time in `HH:mm:ss` format from the given date and location    |
| `getSunsetDate`       | `(params: MainFunctionParams) => string` | Returns the sunset time in `HH:mm:ss` format from the given date and location     |

### Angles

| Function name            | Parameter                                | Description                                                                   |
| ------------------------ | ---------------------------------------- | ----------------------------------------------------------------------------- |
| `getSolarElevationAngle` | `(params: MainFunctionParams) => number` | Returns the solar elevation angle in degrees from the given date and location |

## LICENSE

MIT
