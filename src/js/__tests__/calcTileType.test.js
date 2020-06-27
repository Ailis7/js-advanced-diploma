import { calcTileType } from '../utils';

test('render map', () => {
  let index = 0;
  expect(calcTileType(index)).toEqual('top-left');
  index = 7;
  expect(calcTileType(index)).toEqual('top-right');
  index = 56;
  expect(calcTileType(index)).toEqual('bottom-left');
  index = 63;
  expect(calcTileType(index)).toEqual('bottom-right');
  index = 5;
  expect(calcTileType(index)).toEqual('top');
  index = 60;
  expect(calcTileType(index)).toEqual('bottom');
  index = 32;
  expect(calcTileType(index)).toEqual('left');
  index = 23;
  expect(calcTileType(index)).toEqual('right');
  index = 20;
  expect(calcTileType(index)).toEqual('center');
});
