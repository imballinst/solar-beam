// This refers to dist/index.min.js, as pointed out by the `main` field in package.json.
const solarBeam = require('../');

console.log(solarBeam.getJulianDate(new Date()));
