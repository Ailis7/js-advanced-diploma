import GameController from '../GameController';

const control = new GameController();
control.matrix = [
  [0, 1, 2, 3, 4, 5, 6, 7],
  [8, 9, 10, 11, 12, 13, 14, 15],
  [16, 17, 18, 19, 20, 21, 22, 23],
  [24, 25, 26, 27, 28, 29, 30, 31],
  [32, 33, 34, 35, 36, 37, 38, 39],
  [40, 41, 42, 43, 44, 45, 46, 47],
  [48, 49, 50, 51, 52, 53, 54, 55],
  [56, 57, 58, 59, 60, 61, 62, 63]];

test('allow arr for walk', () => {
  const result = [
    0, 1, 2, 3, 8,
    10, 11, 16, 17, 18,
    19, 24, 25, 26, 27];
  expect(result).toEqual(control.allowedArr(9, 2));

  const result2 = [8, 9, 17, 24, 25];
  expect(result2).toEqual(control.allowedArr(16, 1));
});

test('allow arr for attack', () => {
  const result = [
    27, 28, 29, 30, 31, 35, 36, 37,
    38, 39, 43, 44, 45, 46, 47, 51,
    52, 53, 54, 55, 59, 60, 61, 62,
  ];
  expect(result).toEqual(control.allowedArr(63, 4, 'attack'));

  const result2 = [
    0, 1, 2, 3, 4, 5,
    8, 9, 10, 11, 12, 13,
    16, 17, 18, 19, 20, 21,
    24, 26, 27, 28, 29, // исключил себя
    32, 33, 34, 35, 36, 37,
    40, 41, 42, 43, 44, 45,
    48, 49, 50, 51, 52, 53,
    56, 57, 58, 59, 60, 61];

  expect(result2).toEqual(control.allowedArr(25, 4, 'attack'));
});
