import { Ingredient } from "./Ingredient.js";
import { Area } from "./area.js";

export class Meal {
  constructor({
    id,
    name,
    category,
    area,
    instructions,
    thumbnail,
    tags,
    youtube,
    source,
    ingredients,
  }) {
    this.id = id;
    this.name = name;
    this.category = category;
    this.area = area;
    this.instructions = instructions;
    this.thumbnail = thumbnail;
    this.tags = tags;
    this.youtube = youtube;
    this.source = source;
    this.ingredients = ingredients;
  }

  static fromApi(data) {
    return new Meal({
      id: data.id,
      name: data.name,
      category: data.category,
      area: data.area ? Area.fromApi({ name: data.area }) : null,
      instructions: data.instructions,
      thumbnail: data.thumbnail,
      tags: data.tags ?? [],
      youtube: data.youtube,
      source: data.source,
      ingredients: (data.ingredients ?? []).map(Ingredient.fromApi),
    });
  }

  hasVideo() {
    return !!this.youtube;
  }

  ingredientsCount() {
    return this.ingredients.length;
  }
}
