export default class GameState {
  static from(object) {
    if (typeof object === 'object' && !Array.isArray(object)) return object;
    return null;
  }
}
