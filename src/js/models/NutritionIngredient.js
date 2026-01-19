import { NutrientValues } from "./NutrientValues.js";

export class NutritionIngredient {
  constructor(data) {
    this.original = data.original;
    this.grams = data.grams;

    this.foodName = data.parsed?.foodName;
    this.quantity = data.parsed?.quantity;
    this.unit = data.parsed?.unit;

    this.nutrition = NutrientValues.fromApi(data.nutrition);
  }

  static fromApi(data) {
    return new NutritionIngredient(data);
  }
}
