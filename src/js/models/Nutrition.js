import { NutrientValues } from "./NutrientValues.js";
import { NutritionIngredient } from "./NutritionIngredient.js";

export class Nutrition {
  constructor(data) {
    this.recipeName = data.recipeName;
    this.servings = data.servings;
    this.totalWeight = data.totalWeight;

    this.totals = NutrientValues.fromApi(data.totals);
    this.perServing = NutrientValues.fromApi(data.perServing);

    this.ingredients = (data.ingredients ?? []).map(
      NutritionIngredient.fromApi
    );
  }

  static fromApi(apiResponse) {
    return new Nutrition(apiResponse.data);
  }
}
