import Character from '../Character';
import Bowman from '../Chars/Bowman';

test('not allowed create new Character', () => {
  const newChar = () => new Character();
  expect(newChar).toThrowError();
});

test('allowed create new class extend Character', () => {
  const newChar = () => new Bowman();
  expect(newChar).not.toThrowError();
});
