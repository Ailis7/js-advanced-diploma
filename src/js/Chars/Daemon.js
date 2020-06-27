import Character from '../Character';

export default class Daemon extends Character {
  constructor(level, type = 'daemon') {
    super(level, type);
    this.attack = 10;
    this.defence = 40;
    this.speed = 1;
    this.range = 4;
  }
}
