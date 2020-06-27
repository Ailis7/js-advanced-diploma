import Character from '../Character';

export default class Bowman extends Character {
  constructor(level, type = 'bowman') {
    super(level, type);
    this.attack = 25;
    this.defence = 25;
    this.speed = 2;
    this.range = 2;
  }
}
