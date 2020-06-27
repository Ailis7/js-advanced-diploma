import randomInteger from './functions';
/**
 * Generates random characters
 *
 * @param allowedTypes iterable of classes
 * @param maxLevel max character level
 * @returns Character type children (ex. Magician, Bowman, etc)
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const randomClass = new allowedTypes[randomInteger(0, allowedTypes.length - 1)]();
  const randomLevel = randomInteger(1, maxLevel);
  randomClass.level = randomLevel;
  yield randomClass;
  // TODO: write logic here
}

export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const team = [];
  for (let i = 0; i < characterCount; i += 1) {
    team.push(characterGenerator(allowedTypes, maxLevel).next().value);
  }
  return team;
  // const { cells } = gamePlay;
  // cells.forEach((e) => {
  //   if (e.childNodes[0] !== undefined) {
  //     console.log(e.childNodes[0]);
  //     console.log(cells.indexOf(e));
  //     console.log(56 % 8);
  //   }
  // });
  // TODO: write logic here
}
