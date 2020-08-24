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

// 1. поправил
// 2. не знал что можно :) поправил.
// 3. исправил, действительно нагромождение
// 4. поправил.. но это прям проблема с неймингом для меня_)
// 5. используется в "init()" и в модуле 'functions'
// 6. Вроде прправил, там сопоставлются горизонтальные и вертикальные ячейки
// и по ним идёт поиск и отсев лишних.
// 7. в данном месте "е" - имелось ввиду element. Переименовал на "char"
