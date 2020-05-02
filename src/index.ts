// Source: https://www.esrl.noaa.gov/gmd/grad/solcalc/solareqns.PDF.
export function calculate(dayOfYear: number, hour: number) {
  const fractionalYear =
    ((2 * Math.PI) / 365) * (dayOfYear - 1 + (hour - 12) / 24);
}
