/* eslint-disable no-unused-vars */
import { Math } from 'core-js';
import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './Chars/Bowman';
import Daemon from './Chars/Daemon';
import Magician from './Chars/Magician';
import Swordsman from './Chars/Swordsman';
import Undead from './Chars/Undead';
import Vampire from './Chars/Vampire';
import randomInteger, { matrix, wait, allowed } from './functions'; // часто используемые функции
import GamePlay from './GamePlay';
import { generateTeam } from './generators';

export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.charArr = [];
    this.selectedChar = null;
    this.matrix = null;
    this.state = null;
    this.currentLevel = 1;
    this.whoisTurn = 'bot';
  }

  init() {

    const light = [Magician, Swordsman, Bowman]; // классы света и тьмы
    const dark = [Vampire, Undead, Daemon];
    this.gamePlay.drawUi(themes.prairie);
    this.matrix = matrix(this.gamePlay.cells.length); // после прорисовки заполняются клетки
    // можно конечно просто 64 подставить, но вдруг поле будет больше? :)

    const { cells } = this.gamePlay;

    const lightCells = () => { // возвращает массив для с допустимыми ячейками для света
      const cellsArr = [];
      cells.forEach((elem) => {
        if (cells.indexOf(elem) % 8 === 0 || cells.indexOf(elem) % 8 === 1) { // 0 & 1
          cellsArr.push(cells.indexOf(elem));
        }
      });
      return cellsArr;
    };

    const darkCells = () => { // возвращает массив для с допустимыми ячейками для тьмы
      const cellsArr = [];
      cells.forEach((elem) => {
        if (cells.indexOf(elem) % 8 === 7 || cells.indexOf(elem) % 8 === 7) { // 7 & 6
          cellsArr.push(cells.indexOf(elem));
        }
      });
      return cellsArr;
    };

    const getPos = (cellsArr, team) => { // возвращает массив с PositionedCharacter
      const set = new Set();

      const reverted = () => { // пихает уникальные значения в сет
        set.add(randomInteger(0, cellsArr.length - 1));
        if (set.size !== team.length) return reverted();
        return set;
      };
      reverted();

      const unSet = [...set]; // сет в массив чтоб работал indexOf
      const positionsArr = [];
      unSet.forEach((e) => {
        positionsArr.push(new PositionedCharacter(team[unSet.indexOf(e)], cellsArr[e]));
      });
      return positionsArr;
    };

    const drawTheme = () => {
      let theme = themes.prairie;
      if (this.currentLevel === 2) theme = themes.desert;
      if (this.currentLevel === 3) theme = themes.arctic;
      if (this.currentLevel === 4) theme = themes.mountain;
      return this.gamePlay.drawUi(theme);
    };

    if (this.currentLevel > 1) {
      drawTheme();
      const newCharCount = (this.currentLevel === 2) ? 1 : 2;
      const newLightArr = this.charArr.map((e) => {
        e.character.levelUp();
        return e.character;
      });

      this.charArr = [];
      getPos(lightCells(), newLightArr.concat(generateTeam(light, this.currentLevel - 1,
        newCharCount)))
        .forEach((e) => this.charArr.push(e));

      const darkSize = this.charArr.length;
      getPos(darkCells(), generateTeam(dark, this.currentLevel - 1,
        darkSize))
        .forEach((e) => this.charArr.push(e));
    } else {
      getPos(lightCells(), generateTeam(light, 1, 2)).forEach((e) => this.charArr.push(e));
      // пихаем свет в финальный массив для отрисовки
      getPos(darkCells(), generateTeam(dark, 1, 2)).forEach((e) => this.charArr.push(e)); // и тьму

      if (this.stateService.load() !== null) {
        const load = this.stateService.load();
        this.currentLevel = load.currentLevel;
        this.charArr = [];

        load.arrOfChar.forEach((e) => { // вот такой геоморой.. т.к. объекты прилетают из Storage
          light.concat(dark).forEach((Class) => {
            const newChar = new Class();
            if (e.character.type === newChar.type) {
              Object.entries(e.character).forEach((elem) => {
                // eslint-disable-next-line prefer-destructuring
                newChar[elem[0]] = elem[1];
              });
              this.charArr.push(new PositionedCharacter(newChar, e.position));
            }
          });
        });
        this.whoisTurn = load.whoisTurn;
      } // после множества тестов пришел к выводу что бесполезно хранить чей сейчас ход
      // т.к. бот всё равно успеет пойти, либо атака\ход обоих не засчитаются
      drawTheme();

      this.onCellEnter = this.onCellEnter.bind(this); // проброс контекста this
      this.onCellLeave = this.onCellLeave.bind(this);
      this.onCellClick = this.onCellClick.bind(this); // во все слушатели
      this.gamePlay.addCellClickListener(this.onCellClick);
      this.gamePlay.addCellEnterListener(this.onCellEnter);
      this.gamePlay.addCellLeaveListener(this.onCellLeave);
    }
    this.gamePlay.redrawPositions(this.charArr);

    this.gamePlay.addNewGameListener(() => {
      localStorage.clear();
      this.charArr = [];
      this.gamePlay.cellClickListeners = [];
      this.gamePlay.cellEnterListeners = [];
      this.gamePlay.cellLeaveListeners = [];
      this.init();
    });
  }

  matrixSearch(el) { // перевод индексов клетки в массив вида [1, 5]
    const arr = [];
    this.matrix.forEach((e) => {
      if (e.indexOf(el) !== -1) arr.push(this.matrix.indexOf(e), e.indexOf(el));
    });
    return arr;
  }

  allowedArr(index, range, arr = 'walk') { // допустимые клетки для перехода\атаки
    const mainIndex = this.matrixSearch(index);
    const allowedIndex = [...allowed(mainIndex[1] - range, mainIndex[1] + range)]; // генерируем
    const allowedCells = [];
    allowedIndex.forEach((e) => {
      for (let i = 0 - range; i < range + 1; i += 1) {
        if (mainIndex[0] + i > -1 && mainIndex[0] + i < this.matrix[0].length) {
          if (this.matrix[mainIndex[0] + i][e] !== undefined // исключаем пустые
            && this.matrix[mainIndex[0] + i][e] !== index) { // и само положение перса
            const disallowedArr = () => { // недопустимые при ходьбе ячейки
              const finallArr = [];
              this.charArr.forEach((elem) => finallArr.push(elem.position));
              return finallArr;
            };
            const arrNotAllowed = (arr === 'walk') ? disallowedArr() : []; // недопустимые ячейки если по умолчанию walk

            if (arrNotAllowed.indexOf(this.matrix[mainIndex[0] + i][e]) === -1) {
              allowedCells.push(this.matrix[mainIndex[0] + i][e]);
            }
          }
        }
      }
    });
    allowedCells.sort((a, b) => a - b);
    return allowedCells;
  }

  SaveAndClean() { // сохранение и очистка после хода
    const saveObj = {};
    saveObj.arrOfChar = this.charArr;
    saveObj.currentLevel = this.currentLevel;
    this.whoisTurn = (this.whoisTurn === 'man') ? 'bot' : 'man';
    saveObj.whoisTurn = this.whoisTurn;
    this.stateService.save(saveObj);

    const deselectArr = [...allowed(0, this.gamePlay.cells.length - 1)];
    deselectArr.forEach((e) => this.gamePlay.deselectCell(e));
    this.state = null;
    this.selectedChar = null;
  }

  onCellClick(index) {
    if (this.gamePlay.boardEl.style.cursor === 'not-allowed') GamePlay.showError('Недопустимое действие');
    this.charArr.forEach((e) => {
      if (e.position === index) {
        if (e.character.type === 'swordsman' || e.character.type === 'magician' || e.character.type === 'bowman') {
          if (this.selectedChar !== null
             && this.selectedChar.position === index) { // ставим\снимаем выделение
            this.gamePlay.deselectCell(this.selectedChar.position);
            this.selectedChar = null;
          } else {
            if (this.selectedChar !== null) this.gamePlay.deselectCell(this.selectedChar.position);
            this.gamePlay.selectCell(index);
            this.selectedChar = e;
          }
        } else if (this.state !== null && this.state.status === 'attack') { // атака
          const go = async () => {
            const attack = await wait.call(this);
            const test = await this.SaveAndClean();
            const bot = await this.AI();
            // attack();
            // test();
            return null;
          };
          go();
        } else {
          GamePlay.showError('Это перс компьютера');
        }
      }
    });
    if (this.state !== null && this.state.status === 'walk') { // ходьба
      this.charArr.forEach((e) => {
        if (e === this.selectedChar) {
          this.gamePlay.deselectCell(this.selectedChar.position);
          e.position = index;
          this.gamePlay.redrawPositions(this.charArr);
          this.SaveAndClean();
          this.AI();
        }
      });
    }
    // console.log(this.gamePlay.showDamage(0, 1000));
  }

  onCellEnter(index) {
    (async () => {
      this.state = null;
      const charbase = {
        medal: '\ud83c\udf96',
        swords: '\u2694',
        defense: '\ud83d\udee1',
        health: '\u2764',
      };
      this.gamePlay.setCursor('auto');
      this.charArr.forEach((e) => {
        if (e.position === index) {
          const message = `${charbase.medal}${e.character.level} `
        + `${charbase.swords}${e.character.attack} `
        + `${charbase.defense}${e.character.defence} `
        + `${charbase.health}${e.character.health} `;

          this.gamePlay.showCellTooltip(message, index);
          this.gamePlay.setCursor('pointer');
        }
      });
      if (this.selectedChar !== null) {
        const { speed } = this.selectedChar.character;
        const goArr = this.allowedArr(this.selectedChar.position, speed);
        if (goArr.indexOf(index) !== -1) {
          this.gamePlay.setCursor('pointer');
          this.gamePlay.selectCell(index, 'green');
          this.state = { status: 'walk', index };
        } else {
          this.gamePlay.setCursor('not-allowed');
          this.state = null;
        }
        const { range } = this.selectedChar.character;
        const attackArr = this.allowedArr(this.selectedChar.position, range, 'attack');

        this.charArr.forEach((e) => {
          if (e.character.type === 'daemon' || e.character.type === 'vampire' || e.character.type === 'undead') {
            if (attackArr.indexOf(e.position) !== -1 && index === e.position) {
              this.gamePlay.setCursor('crosshair');
              this.gamePlay.selectCell(index, 'red');
              this.state = { status: 'attack', target: e };
            }
          } else if (e.position === index) {
            this.gamePlay.setCursor('pointer');
          }
        });
      }
    })();
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    if (this.selectedChar !== null
      && this.selectedChar.position !== index) this.gamePlay.deselectCell(index);
    // посдказка сама скрывается ..
  }

  AI() {
    const darkArr = this.charArr.filter((char) => {
      const { type } = char.character;
      return type === 'daemon' || type === 'undead' || type === 'vampire';
    });
    const lightArr = this.charArr.filter((char) => {
      const { type } = char.character;
      return type === 'swordsman' || type === 'magician' || type === 'bowman';
    });

    const think = [];
    darkArr.forEach((e) => {
      const attackArr = this.allowedArr(e.position, e.character.range, 'attack');
      lightArr.forEach((char) => {
        if (attackArr.indexOf(char.position) !== -1) {
          think.push({ attacker: e, defender: char });
        }
      });
    });
    think.sort((a, b) => { // выбор лучшей атаки по кол-ву нанесенного урона
      const { attack } = a.attacker.character;
      const { defence } = a.defender.character;
      const { attack: attackB } = b.attacker.character;
      const { defence: defenceB } = b.defender.character;
      return (defence - attack) - (defenceB - attackB);
    });

    if (think.length > 0) { // если массив для атааки пуст, тогда ходьба
      this.selectedChar = think[0].attacker;
      this.state = { status: 'attack', target: think[0].defender };
      wait.call(this);
      this.SaveAndClean();
    } else {
      const closesArrUnic = new Set();
      lightArr.forEach((e) => { // сначала ищем и ходим к ближайшим клеткам игрока
        this.allowedArr(e.position, 1).forEach((elem) => closesArrUnic.add(elem));
      });
      const closesArr = [...closesArrUnic];

      const walk = [];
      darkArr.forEach((char) => {
        const goArrEnemy = this.allowedArr(char.position, char.character.speed);
        goArrEnemy.forEach((e) => {
          if (closesArr.indexOf(e) !== -1) {
            walk.push({ walker: char, where: e });
          }
        });
      });

      if (walk.length > 0) { // если может встать на ближайшую клетку к врагу - идёт к врагу
        const whoWalk = walk[randomInteger(0, walk.length - 1)];
        this.charArr[this.charArr.indexOf(whoWalk.walker)].position = whoWalk.where;
        this.gamePlay.redrawPositions(this.charArr);
        this.SaveAndClean();
      } else { // в противном случае ходит к ближайшему врагу
        const randomEnemy = lightArr[randomInteger(0, lightArr.length - 1)];
        const randomWalker = darkArr[randomInteger(0, darkArr.length - 1)];

        // const walkerIndexes = this.matrixSearch(randomWalker.position);
        const enemyIndexes = this.matrixSearch(randomEnemy.position);
        const walkerArr = this.allowedArr(randomWalker.position, randomWalker.character.speed)
          .map((e) => this.matrixSearch(e));

        const bigger = walkerArr.reduce((a, b) => (Math.abs(b[0] - enemyIndexes[0])
        < Math.abs(a[0] - enemyIndexes[0]) ? b : a)); // достаём ближайшее знач. по нулевому инд.

        const filtredByBigger = walkerArr.filter((e) => e[0] === bigger[0]);

        const nearest = filtredByBigger.reduce((a, b) => (Math.abs(b[1] - enemyIndexes[1])
        < Math.abs(a[1] - enemyIndexes[1]) ? b : a)); // достаём ближайшее знач. по первому инд.

        this.charArr[this.charArr.indexOf(randomWalker)].position = this
          .matrix[nearest[0]][nearest[1]];
        this.gamePlay.redrawPositions(this.charArr);
        this.SaveAndClean();
      }
    }
    // console.log(this.selectedChar);
    // console.log(think);
    // console.log(this.matrix);
    // console.log(this.allowedArr(lightArr[0].position, 1));
    // console.log(this.allowedArr(1, 1))
  }
}
