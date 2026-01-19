export class Product {
  constructor(data) {
    this.barcode = data.barcode ?? "";
    this.name = data.name ?? "";
    this.brand = data.brand ?? "";
    this.image = data.image ?? "";

    this.nutritionGrade = data.nutritionGrade ?? "unknown";
    this.novaGroup = data.novaGroup ?? null;

    const n = data.nutrients ?? {};

    this.calories = n.calories ?? 0;
    this.fat = n.fat ?? 0;
    this.carbs = n.carbs ?? 0;
    this.protein = n.protein ?? 0;
    this.sugar = n.sugar ?? 0;
    this.fiber = n.fiber ?? 0;
    this.sodium = n.sodium ?? 0;
  }

  static fromApi(data) {
    return new Product(data);
  }
}
