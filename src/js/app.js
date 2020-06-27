/**
 * Entry point of app: don't change this
 */
import GamePlay from './GamePlay';
import GameController from './GameController';
import GameStateService from './GameStateService';

const gamePlay = new GamePlay();
gamePlay.bindToDOM(document.querySelector('#game-container'));

const stateService = new GameStateService(localStorage);

const gameCtrl = new GameController(gamePlay, stateService);
gameCtrl.init();

// don't write your code here

// function* randomize(allowedTypes, maxLevel) {
//   function randomInteger(min, max) {
//     const rand = min - 0.5 + Math.random() * (max - min + 1);
//     return Math.round(rand);
//   }
//   const randomLevel = randomInteger(1, maxLevel);
//   allowedTypes.level = randomLevel;
//   console.log(allowedTypes);
//   yield allowedTypes;
// }

// function generateTeam(allowedTypes, maxLevel, characterCount) {
//   const team = [];
//   for (let i = 0; i < characterCount; i += 1) {
//     team.push(randomize(allowedTypes, maxLevel).next().value);
//   }
//   console.log(team[0], team[1]);
//   return team;
// }
// const dark = new Object();
// generateTeam(dark, 1000, 2);
