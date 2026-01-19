export class NutrientValues {
  constructor(n = {}) {
    this.calories = n.calories ?? 0;
    this.protein = n.protein ?? 0;
    this.fat = n.fat ?? 0;
    this.carbs = n.carbs ?? 0;
    this.fiber = n.fiber ?? 0;
    this.sugar = n.sugar ?? 0;
    this.saturatedFat = n.saturatedFat ?? 0;
    this.cholesterol = n.cholesterol ?? 0;
    this.sodium = n.sodium ?? 0;
  }

  static fromApi(data) {
    return new NutrientValues(data);
  }
}
