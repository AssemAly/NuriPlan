export class ProductCategory {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.productsCount = data.products;
    this.url = data.url;
  }

  static fromApi(data) {
    return new ProductCategory(data);
  }
}
