export class Ingredient {
  constructor(name, measure) {
    this.name = name;
    this.measure = measure;
  }

  static fromApi(data) {
    return new Ingredient(data.ingredient, data.measure);
  }
}
