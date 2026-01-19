const BASE_URL = "https://nutriplan-api.vercel.app/api";

export const API_URLS = {
  AREAS: `${BASE_URL}/meals/areas`,
  CATEGORIES: `${BASE_URL}/meals/categories`,
  filterMeals: (filters = { limit: 25 }) => {
    const params = new URLSearchParams();

    if (filters.category) params.append("category", filters.category);
    if (filters.area) params.append("area", filters.area);
    if (filters.ingredient) params.append("ingredient", filters.ingredient);
    if (filters.limit) params.append("limit", filters.limit);

    return `${BASE_URL}/meals/filter?${params.toString()}`;
  },
  RandomMeals: `${BASE_URL}/meals/random?count=25`,
  mealDetails: (id) => `${BASE_URL}/meals/${id}`,
  searchMeals: (query) =>
    `${BASE_URL}/meals/search?q=${encodeURIComponent(query)}`,
  analyzeNutrition: `${BASE_URL}/nutrition/analyze`,

  producCategories: `${BASE_URL}/products/categories?page=1&limit=50`,
  ProductsByCategory: (categoryName, filters = { page: 1, limit: 25 }) => {
    const params = new URLSearchParams();
    params.append("page", filters.page || 1);
    params.append("limit", filters.limit || 25);
    return `${BASE_URL}/products/category/${categoryName}?${params.toString()}`;
  },
  ProductsByCode: (code) => `${BASE_URL}/products/barcode/${code}`,
  ProductSearch: (query, filters = { page: 1, limit: 25 }) => {
    const params = new URLSearchParams();
    params.append("q", query);
    params.append("page", filters.page || 1);
    params.append("limit", filters.limit || 25);
    return `${BASE_URL}/products/search?${params.toString()}`;
  },
};
