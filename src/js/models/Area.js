export class Area {
  constructor(name) {
    this.name = name;
  }

  static fromApi(data) {
    return new Area(data.name);
  }
}
