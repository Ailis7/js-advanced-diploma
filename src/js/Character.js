export default class Character {
  constructor(level, type = 'generic') {
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;
    // TODO: throw error if user use "new Character()"
    if (new.target.name === 'Character') throw new Error('not allowed create new Character');
  }

  levelUp() {
    this.level += 1;
    this.attack = Math.max(this.attack, this.attack * (1.8 - (1 - this.health / 100))).toFixed(1);
    this.defence = Math.max(this.defence, this.defence * (1.8 - (1 - this.health / 100)))
      .toFixed(1);
    this.health += 80;
    if (this.health > 100) this.health = 100;
  }
}
