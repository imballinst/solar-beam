import { calculate } from '.';

it("should calculate the sun's position", () => {
  console.log(calculate(new Date(), -6.2, 106.816666));
});
