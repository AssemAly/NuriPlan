export class Category {
  constructor(id, name, thumbnail, description) {
    this.id = id;
    this.name = name;
    this.thumbnail = thumbnail;
    this.description = description;
  }

  static fromApi(data) {
    return new Category(data.id, data.name, data.thumbnail, data.description);
  }
}
