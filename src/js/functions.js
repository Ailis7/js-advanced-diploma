export default function randomInteger(min, max) {
  return Math.round(Math.random() * (max - min) + min);
}

export function matrix(num) { // num число клеток
  const finalMatrix = [];
  const sqrt = Math.sqrt(num); // число ячеек в стобце\строки квадратного поля

  const arrOfNum = [];
  for (let i = 0; i < num; i += 1) { // перебираем все клетки
    arrOfNum.push(i); // и кидаем их в отдельный массив
  }

  for (let i = 0; i < sqrt; i += 1) { // тут пихаем это всё в строки
    finalMatrix[i] = [];
    arrOfNum.forEach((e) => {
      if (e < sqrt * (i + 1) && e >= sqrt * i) {
        finalMatrix[i].push(e);
      }
    });
  }
  return finalMatrix;
}

export async function wait() {
  const { attack } = this.selectedChar.character;
  const { defence } = this.state.target.character;

  const damage = +(Math.max(attack - defence, attack * 0.1).toFixed(1));
  this.state.target.character.health -= damage;
  this.state.target.character.health = +(this.state.target.character.health.toFixed(1));

  if (this.state.target.character.health <= 0) { // убираем если мёртв
    const deletedCharIndex = this.charArr.indexOf(this.state.target);
    this.charArr.splice(deletedCharIndex, 1);
  }

  // eslint-disable-next-line no-unused-vars
  const game = await this.gamePlay.showDamage(this.state.target.position, damage);

  const check = {};
  this.charArr.forEach((e) => {
    if (e.character.type === 'daemon' || e.character.type === 'undead' || e.character.type === 'vampire') {
      check.dark = 'ok';
    } else {
      check.light = 'ok';
    }
  });
  if (check.light === 'ok' && check.dark !== 'ok') {
    if (this.currentLevel === 4) {
      this.gamePlay.redrawPositions(this.charArr);
      this.gamePlayClearListner('block');
      const final = this.stateService.load();
      const newPoints = this.charArr.reduce((sum, current) => {
        // eslint-disable-next-line no-param-reassign
        sum.character.health += current.character.health;
        return sum;
      });
      const { health } = newPoints.character;
      alert(`Вы выиграли! Вы набрали ${health}, а ваш рекорд ${final.points}`);
      if (health > final.points) {
        final.points = health;
        this.stateService.save(final);
      }
      return;
    }
    this.currentLevel += 1;
    this.init();
  } else if (check.dark === 'ok' && check.light !== 'ok') {
    this.gamePlay.redrawPositions(this.charArr);
    this.gamePlayClearListner('block');
    alert('Вы проиграли!');
  } else {
    this.gamePlay.redrawPositions(this.charArr);
  }
}

export function* allowed(from, to) { // генератор от и до нужных индексов
  for (let value = from; value <= to; value += 1) {
    yield value;
  }
}
