import themes from './themes';
import PositionedCharacter from './PositionedCharacter';
import Bowman from './Chars/Bowman';
import Daemon from './Chars/Daemon';
import Magician from './Chars/Magician';
import Swordsman from './Chars/Swordsman';
import Undead from './Chars/Undead';
import Vampire from './Chars/Vampire';
import randomInteger, { matrix, allowedArr } from './functions'; // часто используемые функции
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
  }

  init() {
    this.gamePlay.drawUi(themes.prairie);
    this.matrix = matrix(this.gamePlay.cells.length); // после прорисовки заполняются клетки
    // можно конечно просто 64 подставить, но вдруг поле будет больше? :)

    const light = [Magician, Swordsman, Bowman]; // классы света и тьмы
    const dark = [Vampire, Undead, Daemon];
    const { cells } = this.gamePlay;

    const lightCells = () => { // возвращает массив для с допустимыми ячейками для света
      const cellsArr = [];
      cells.forEach((elem) => {
        if (cells.indexOf(elem) % 8 === 0 || cells.indexOf(elem) % 8 === 1) {
          cellsArr.push(cells.indexOf(elem));
        }
      });
      return cellsArr;
    };

    const darkCells = () => { // возвращает массив для с допустимыми ячейками для тьмы
      const cellsArr = [];
      cells.forEach((elem) => {
        if (cells.indexOf(elem) % 8 === 3 || cells.indexOf(elem) % 8 === 6) {
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

    getPos(lightCells(), generateTeam(light, 1, 2)).forEach((e) => this.charArr.push(e));
    // пихаем свет в финальный массив для отрисовки
    getPos(darkCells(), generateTeam(dark, 1, 2)).forEach((e) => this.charArr.push(e)); // и тьму

    this.gamePlay.redrawPositions(this.charArr);

    this.onCellEnter = this.onCellEnter.bind(this); // проброс контекста this
    this.onCellClick = this.onCellClick.bind(this); // во все слушатели
    this.onCellLeave = this.onCellLeave.bind(this);
    this.gamePlay.addCellEnterListener(this.onCellEnter); // возможно лучше вывести в
    this.gamePlay.addCellClickListener(this.onCellClick); // отдельный метод, при движении станет понятней
    this.gamePlay.addCellLeaveListener(this.onCellLeave);
  }

  allowedArr(index, range, arr = 'walk') { // допустимые клетки для перехода\атаки
    const mainIndex = []; // сюда кладём index строки и index элемента в строке
    this.matrix.forEach((e) => {
      if (e.indexOf(index) !== -1) mainIndex.push(this.matrix.indexOf(e), e.indexOf(index));
    });

    function* allowed(from, to) { // генератор от и до нужных индексов
      for (let value = from; value <= to; value += 1) {
        yield value;
      }
    }
    const allowedIndex = [...allowed(mainIndex[1] - range, mainIndex[1] + range)];
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

  onCellClick(index) {
    async function wait() {
      const { attack } = this.selectedChar.character;
      const { defence } = this.state.target.character;
      this.state.target.character.health -= Math.max(attack - defence, attack * 0.1);
      const game = await this.gamePlay.showDamage(this.state.target.position,
        Math.max(attack - defence, attack * 0.1));
      this.gamePlay.redrawPositions(this.charArr);
      // console.log(game);
      return game;
    }

    if (this.gamePlay.boardEl.style.cursor === 'not-allowed') GamePlay.showError('Недопустимое действие');
    this.charArr.forEach((e) => {
      if (e.position === index) {
        if (e.character.type === 'swordsman' || e.character.type === 'magician' || e.character.type === 'bowman') {
          if (this.selectedChar !== null && this.selectedChar.position === index) { // ставим\снимаем выделение
            this.gamePlay.deselectCell(this.selectedChar.position);
            this.selectedChar = null;
          } else {
            if (this.selectedChar !== null) this.gamePlay.deselectCell(this.selectedChar.position);
            this.gamePlay.selectCell(index);
            this.selectedChar = e;
          }
        } else if (this.state.status === 'attack') {
          wait.call(this);

          // this.gamePlay.showDamage(this.state.target.position,
          //   Math.max(attack - defence, attack * 0.1)).then((saving) => {
          //   console.log(saving);
          //   return saving;
          // }, (error) => {
          //   console.log(error);
          // });
        } else {
          GamePlay.showError('Это перс компьютера');
        }
      }
    });
    if (this.state.status === 'walk') {
      this.charArr.forEach((e) => {
        if (e === this.selectedChar) {
          this.gamePlay.deselectCell(this.selectedChar.position);
          e.position = index;
          this.gamePlay.redrawPositions(this.charArr);
          this.gamePlay.deselectCell(this.selectedChar.position);
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
        console.log();
      // if (this.selectedChar.character)
      }
    })();
    console.log(index, this.state);
    // TODO: react to mouse enter
  }

  onCellLeave(index) {
    if (this.selectedChar !== null
      && this.selectedChar.position !== index) this.gamePlay.deselectCell(index);
    // сама скрывается посдказка..
  }

  AI() {

  }
}
