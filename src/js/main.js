import { API_URLS } from "./apiUrls.js";
import { Meal } from "./models/meal.js";
import { Category } from "./models/category.js";
import { Area } from "./models/area.js";
import { Nutrition } from "./models/Nutrition.js";
import { Product } from "./models/Product.js";
import { ProductCategory } from "./models/ProductCategory.js";

const USDA_API_KEY = "AUN3IFC9acvs3iSBHM40OPU74zwVkyIEMnGCAdEh";
const searchInput = document.getElementById("search-input");
const areasContainer = document.getElementById("area-grid");
const categoriesContainer = document.getElementById("categories-grid");
const mealsContainer = document.getElementById("recipes-grid");
const productLink = document.getElementById("product-link");
const foodLogLink = document.getElementById("food-log-link");
const mainLink = document.getElementById("main-link");
const productsCategoryContainer = document.getElementById("product-categories");

const searchProductInput = document.getElementById("product-search-input");
const searchProductBtn = document.getElementById("search-product-btn");
const barcodeInput = document.getElementById("barcode-input");
const barcodeScanBtn = document.getElementById("lookup-barcode-btn");
const nutriScoreFilters = document.querySelectorAll(".nutri-score-filter");

let selectedMeal = null;
let selectedNutrition = null;
let allProducts = [];
const NUTRITION_MAX = {
  protein: 50,
  carbs: 300,
  fat: 70,
  fiber: 30,
  sugar: 50,
};
const filters = {
  category: null,
  area: null,
  ingredient: null,
  limit: 25,
};

const homeSectios = [
  document.getElementById("search-filters-section"),
  document.getElementById("meal-categories-section"),
  document.getElementById("all-recipes-section"),
];

// navigation
window.addEventListener("popstate", () => {
  handleRouting();
});
document.addEventListener("DOMContentLoaded", () => {
  handleRouting();
});
init();
function handleRouting() {
  //debugger;
  const path = window.location.pathname;
  if (path === "/home") {
    toggleSectionVisibility("homeSection");
    return;
  }
  if (path === "/") {
    toggleSectionVisibility("homeSection", "/home");
    return;
  }
  if (path === "/product-scanner") {
    toggleSectionVisibility("products-section");
    return;
  }
  if (path === "/food-log") {
    toggleSectionVisibility("foodlog-section");
    return;
  }
  if (path.startsWith("/meal/")) {
    const mealId = sessionStorage.getItem("selectedMealId");

    if (mealId) {
      toggleSectionVisibility("meal-details");
      renderMealDetails(mealId);
      return;
    }
  }
  toggleSectionVisibility("homeSection", "/home");
}
productLink.addEventListener("click", async () => {
  toggleSectionVisibility("products-section", "/product-scanner");
  const productCategories = await getProductCategories();
  displayProductCategories(productCategories);
});
foodLogLink.addEventListener("click", () => {
  toggleSectionVisibility("foodlog-section", "/food-log");
  loadFoodLogPage();
});
mainLink.addEventListener("click", () => {
  toggleSectionVisibility("homeSection", "/home");
});
// Initialization functions
async function init() {
  const meals = await getMeals();
  const categories = await getCategories();
  const areas = await getAreas();
  console.log(areas);
  displayCategories(categories);
  displayAreas(areas);
  displayMeals(meals);
}
// Product section event listeners
searchProductBtn.addEventListener("click", async () => {
  const query = searchProductInput.value.trim();
  const products = await searchProducts(query);
  allProducts = products;
  displayProducts(products);
});
barcodeScanBtn.addEventListener("click", async () => {
  const code = barcodeInput.value.trim();
  const product = await getProductByCode(code);
  allProducts = [product];
  displayProducts([product]);
});
nutriScoreFilters.forEach((filterBtn) => {
  filterBtn.addEventListener("click", async () => {
    const selectedGrade = filterBtn.dataset.grade.toLowerCase();
    if (selectedGrade === "all" || selectedGrade === "") {
      displayProducts(allProducts);
      return;
    }
    const filteredProducts = allProducts.filter(
      (product) => product.nutritionGrade.toLowerCase() === selectedGrade
    );
    displayProducts(filteredProducts);
  });
});
//fetch functions
function getMeals() {
  return fetch(API_URLS.RandomMeals)
    .then((response) => response.json())
    .then((data) => {
      return data.results.map(Meal.fromApi);
    });
}
function getCategories() {
  return fetch(API_URLS.CATEGORIES)
    .then((response) => response.json())
    .then((data) => {
      return data.results.map(Category.fromApi);
    });
}
function getAreas() {
  return fetch(API_URLS.AREAS)
    .then((response) => response.json())
    .then((data) => {
      return data.results.map(Area.fromApi);
    });
}
function getMealDetails(id) {
  const url = API_URLS.mealDetails(id);
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return Meal.fromApi(data.result);
    });
}
async function analyzeMealNutrition(meal) {
  const ingredients = buildNutritionPayload(meal);

  const response = await fetch(API_URLS.analyzeNutrition, {
    method: "POST",
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      "x-api-key": USDA_API_KEY,
    },
    body: JSON.stringify({ ingredients }),
  });

  const json = await response.json();

  return Nutrition.fromApi(json);
}
function getProductCategories() {
  return fetch(API_URLS.producCategories)
    .then((response) => response.json())
    .then((data) => {
      return data.results.map(ProductCategory.fromApi);
    });
}
function getProductsByCategory(categoryName, filters = { page: 1, limit: 25 }) {
  const url = API_URLS.ProductsByCategory(categoryName, filters);
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data.results.map(Product.fromApi);
    });
}
function searchProducts(q) {
  const url = API_URLS.ProductSearch(q);
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data.results.map(Product.fromApi);
    });
}
function getProductByCode(code) {
  const url = API_URLS.ProductsByCode(code);
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return Product.fromApi(data.result);
    });
}
//Display functions
function createMealCard(meal) {
  return `
    <div
      class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
      data-meal-id="${meal.id}"
    >
      <div class="relative h-48 overflow-hidden">
        <img
          class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          src="${meal.thumbnail}"
          alt="${meal.name}"
          loading="lazy"
        />
        <div class="absolute bottom-3 left-3 flex gap-2">
          <span
            class="px-2 py-1 bg-white/90 backdrop-blur-sm text-xs font-semibold rounded-full text-gray-700"
          >
            ${meal.category}
          </span>
          <span
            class="px-2 py-1 bg-emerald-500 text-xs font-semibold rounded-full text-white"
          >
            ${meal.area.name}
          </span>
        </div>
      </div>

      <div class="p-4">
        <h3
          class="text-base font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1"
        >
          ${meal.name}
        </h3>

        <p class="text-xs text-gray-600 mb-3 line-clamp-2">
          ${meal.instructions?.[0] ?? "Delicious recipe to try!"}
        </p>

        <div class="flex items-center justify-between text-xs">
          <span class="font-semibold text-gray-900">
            <i class="fa-solid fa-utensils text-emerald-600 mr-1"></i>
            ${meal.category}
          </span>
          <span class="font-semibold text-gray-500">
            <i class="fa-solid fa-globe text-blue-500 mr-1"></i>
            ${meal.area.name}
          </span>
        </div>
      </div>
    </div>
  `;
}
function displayMeals(meals) {
  mealsContainer.innerHTML = "";
  if (!meals.length) {
    mealsContainer.innerHTML = "<p>No meals found</p>";
    return;
  }
  mealsContainer.innerHTML = meals.map(createMealCard).join("");
}
function createCategoryOption(category) {
  const iconClass = mapCategoryIcon(category.name);
  const colorClasses = mapCategoryColor(category.name);
  return `            
    <div
              class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
              data-category="${category.name}"
            >
              <div class="flex items-center gap-2.5">
                <div
                  class="text-white w-9 h-9 bg-gradient-to-br ${colorClasses} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-sm"
                >
                  <i class="${iconClass}"></i>
                </div>
                <div>
                  <h3 class="text-sm font-bold text-gray-900">${category.name}</h3>
                </div>
              </div>
            </div>`;
}
function displayCategories(categories) {
  categoriesContainer.innerHTML = "";
  categoriesContainer.innerHTML = categories.map(createCategoryOption).join("");
}
function createAreaOption(area) {
  return `            
    <button
              class="area-btn px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm whitespace-nowrap hover:bg-gray-200 transition-all"
            data-area="${area.name}"
              >
              ${area.name}
            </button>`;
}
function displayAreas(areas) {
  areasContainer.innerHTML = "";
  areasContainer.innerHTML = areas.map(createAreaOption).join("");
}
function mapCategoryIcon(categoryName) {
  const categoryIcons = {
    Beef: "fa-solid fa-drumstick-bite",
    Chicken: "fa-solid fa-drumstick-bite",
    Dessert: "fa-solid fa-cake-candles",
    Lamb: "fa-solid fa-drumstick-bite",
    Pasta: "fa-solid fa-bowl-food",
    Pork: "fa-solid fa-drumstick-bite",
    Seafood: "fa-solid fa-fish",
    Vegan: "fa-solid fa-seedling",
    Vegetarian: "fa-solid fa-carrot",
    Breakfast: "fa-solid fa-bacon",
    Goat: "fa-solid fa-drumstick-bite",
  };
  return categoryIcons[categoryName] || "fa-solid fa-utensils";
}
function mapCategoryColor(categoryName) {
  const categoryColors = {
    Beef: "from-red-400 to-red-500",
    Chicken: "from-yellow-400 to-yellow-500",
    Dessert: "from-pink-400 to-pink-500",
    Lamb: "from-purple-400 to-purple-500",
    Pasta: "from-yellow-600 to-yellow-700",
    Pork: "from-pink-600 to-pink-700",
    Seafood: "from-blue-400 to-blue-500",
    Vegan: "from-green-400 to-green-500",
    Vegetarian: "from-green-600 to-green-700",
    Breakfast: "from-orange-400 to-orange-500",
    Goat: "from-gray-400 to-gray-500",
  };
  return categoryColors[categoryName] || "from-emerald-400 to-green-500";
}
function createProductCategoryOption(category) {
  return `            
    <button
                class="product-category-btn px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium whitespace-nowrap hover:bg-emerald-200 transition-all"
              >
                <i class="fa-solid fa-cookie mr-1.5"></i>${category.name}
              </button>`;
}
function displayProductCategories(categories) {
  productsCategoryContainer.innerHTML = "";
  productsCategoryContainer.innerHTML = categories
    .map(createProductCategoryOption)
    .join("");
  const producCategoriesElement = document.querySelectorAll(
    ".product-category-btn"
  );
  producCategoriesElement.forEach((categoryBtn) => {
    categoryBtn.addEventListener("click", async () => {
      const categoryName = categoryBtn.textContent.trim();
      const products = await getProductsByCategory(categoryName);
      allProducts = products;
      displayProducts(products);
    });
  });
}
function createProductCard(product) {
  return `          <div
                class="product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
                data-barcode="${product.barcode}"
              >
                <div
                  class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden"
                >
                  <img
                    class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    src="${product.image}"
                    alt="Product Name"
                    loading="lazy"
                  />

                  <div
                    class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase"
                  >
                    Nutri-Score ${product.nutritionGrade.toUpperCase()}
                  </div>

                  <!-- NOVA Badge -->
                  <div
                    class="absolute top-2 right-2 bg-lime-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                    title="NOVA ${product.novaGroup}"
                  >
                    ${product.novaGroup}
                  </div>
                </div>

                <div class="p-4">
                  <p
                    class="text-xs text-emerald-600 font-semibold mb-1 truncate"
                  >
                    ${product.brand}
                  </p>
                  <h3
                    class="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors"
                  >
                    ${product.name}
                  </h3>

                  <div
                    class="flex items-center gap-3 text-xs text-gray-500 mb-3"
                  >
                    <span
                      ><i class="fa-solid fa-weight-scale mr-1"></i>${
                        product.weight
                      }g</span
                    >
                    <span
                      ><i class="fa-solid fa-fire mr-1"></i>${
                        product.calories
                      } kcal/100g</span
                    >
                  </div>

                  <!-- Mini Nutrition -->
                  <div class="grid grid-cols-4 gap-1 text-center">
                    <div class="bg-emerald-50 rounded p-1.5">
                      <p class="text-xs font-bold text-emerald-700">${
                        product.protein
                      }g</p>
                      <p class="text-[10px] text-gray-500">Protein</p>
                    </div>
                    <div class="bg-blue-50 rounded p-1.5">
                      <p class="text-xs font-bold text-blue-700">${
                        product.carbs
                      }g</p>
                      <p class="text-[10px] text-gray-500">Carbs</p>
                    </div>
                    <div class="bg-purple-50 rounded p-1.5">
                      <p class="text-xs font-bold text-purple-700">${
                        product.fat
                      }g</p>
                      <p class="text-[10px] text-gray-500">Fat</p>
                    </div>
                    <div class="bg-orange-50 rounded p-1.5">
                      <p class="text-xs font-bold text-orange-700">${
                        product.sugar
                      }g</p>
                      <p class="text-[10px] text-gray-500">Sugar</p>
                    </div>
                  </div>
                </div>
              </div>`;
}
function displayProducts(products) {
  const productsContainer = document.getElementById("products-grid");
  productsContainer.innerHTML = "";
  productsContainer.innerHTML = products.map(createProductCard).join("");
}
// Search meal functions
function searchMeals() {
  const query = searchInput.value.toLowerCase();
  const url = API_URLS.searchMeals(query);

  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      console.log("Search API response:", data);

      if (!Array.isArray(data.results)) {
        return [];
      }

      return data.results.map(Meal.fromApi);
    });
}
function filterMeals(filters) {
  const url = API_URLS.filterMeals(filters);
  return fetch(url)
    .then((response) => response.json())
    .then((data) => {
      return data.results.map(Meal.fromApi);
    });
}
searchInput.addEventListener("keyup", async () => {
  const meals = await searchMeals();
  displayMeals(meals);
});
areasContainer.addEventListener("click", async (event) => {
  const areaBtn = event.target.closest(".area-btn");
  if (!areaBtn) return;
  document.querySelectorAll(".area-btn").forEach((btn) => {
    btn.classList.remove(
      "bg-emerald-500",
      "text-white",
      "hover:bg-emerald-700"
    );
    btn.classList.add("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
  });
  areaBtn.classList.remove("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
  areaBtn.classList.add("bg-emerald-500", "text-white", "hover:bg-emerald-700");
  const selectedArea = areaBtn.dataset.area;
  const meals = await filterMeals({ ...filters, area: selectedArea });
  displayMeals(meals);
});
categoriesContainer.addEventListener("click", async (event) => {
  const categoryCard = event.target.closest(".category-card");
  if (!categoryCard) return;
  const selectedCategory = categoryCard.dataset.category;
  const meals = await filterMeals({ ...filters, category: selectedCategory });
  displayMeals(meals);
});

//Get details of a meal
function renderHeroSection(meal, nutritionData) {
  const heroContainer = document.getElementById("hero-section");
  heroContainer.innerHTML = "";
  heroContainer.innerHTML = `
            <div class="relative h-80 md:h-96">
              <img
                src="${meal.thumbnail}"
                alt="${meal.name}"
                class="w-full h-full object-cover"
              />
              <div
                class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              ></div>
              <div class="absolute bottom-0 left-0 right-0 p-8">
                <div class="flex items-center gap-3 mb-3">
                  <span
                    class="px-3 py-1 bg-emerald-500 text-white text-sm font-semibold rounded-full"
                    >${meal.category}</span
                  >
                  <span
                    class="px-3 py-1 bg-blue-500 text-white text-sm font-semibold rounded-full"
                    >${meal.area.name}</span
                  >
                  <span
                    class="px-3 py-1 bg-purple-500 text-white text-sm font-semibold rounded-full"
                    >${meal.tags}</span
                  >
                </div>
                <h1 class="text-3xl md:text-4xl font-bold text-white mb-2">
                  ${meal.name}
                </h1>
                <div class="flex items-center gap-6 text-white/90">
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-clock"></i>
                    <span>30 min</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-utensils"></i>
                    <span id="hero-servings">${
                      nutritionData?.servings ?? 0
                    } servings</span>
                  </span>
                  <span class="flex items-center gap-2">
                    <i class="fa-solid fa-fire"></i>
                    <span id="hero-calories">${
                      nutritionData?.perServing?.calories ?? 0
                    } cal/serving</span>
                  </span>
                </div>
              </div>
            </div>
         `;
}
function renderActionLog(mealId) {
  const logMealBtn = document.getElementById("log-meal-btn");
  logMealBtn.dataset.mealId = mealId;
}
function renderIngredient(ingredients) {
  const ingredientContainer = document.getElementById("ingredient-grid");
  ingredientContainer.innerHTML = "";
  for (let i = 0; i < ingredients.length; i++) {
    const ingredient = ingredients[i];
    const ingredientItem = `  <div
                    class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300"
                    />
                    <span class="text-gray-700">
                      <span class="font-medium text-gray-900">${ingredient.measure}</span> ${ingredient.name}
                      
                    </span>
                  </div>`;
    ingredientContainer.innerHTML += ingredientItem;
  }
  const ingredientCount = document.getElementById("ingredient-count");
  ingredientCount.textContent = `${ingredients.length} items`;
}
function renderInstructions(instructions) {
  const instructionContainer = document.getElementById("instructions-list");
  instructionContainer.innerHTML = "";
  for (let i = 0; i < instructions.length; i++) {
    const instruction = instructions[i];
    const stepNumber = i + 1;
    const instructionStep = `<div
                    class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0"
                    >
                      ${stepNumber}
                    </div>
                    <p class="text-gray-700 leading-relaxed pt-2">
                      ${instruction}
                    </p>
                  </div>`;
    instructionContainer.innerHTML += instructionStep;
  }
}
function showVideoSection(videoUrl) {
  const videoFrame = document.getElementById("video-frame");
  if (videoUrl) {
    videoFrame.src = videoUrl;
  } else {
    videoFrame.parentElement.style.display = "none";
  }
}
function renderNutriationInfo(nutrition) {
  const nutritionContainer = document.getElementById(
    "nutrition-facts-container"
  );
  nutritionContainer.innerHTML = "";
  nutritionContainer.innerHTML = ` 
                  <p class="text-sm text-gray-500 mb-4">Per serving</p>

                  <div
                    class="text-center py-4 mb-4 bg-linear-to-br from-emerald-50 to-teal-50 rounded-xl"
                  >
                    <p class="text-sm text-gray-600">Calories per serving</p>
                    <p class="text-4xl font-bold text-emerald-600">${
                      nutrition?.perServing?.calories ?? 0
                    }</p>
                    <p class="text-xs text-gray-500 mt-1">Total: ${
                      nutrition?.totals?.calories ?? 0
                    } cal</p>
                  </div>

                  <div class="space-y-4">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <span class="text-gray-700">Protein</span>
                      </div>
                      <span class="font-bold text-gray-900">${
                        nutrition?.perServing?.protein ?? 0
                      }g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-emerald-500 h-2 rounded-full"
                        style="width: ${
                          ((nutrition?.perServing?.protein ?? 0) /
                            NUTRITION_MAX.protein) *
                          100
                        }%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span class="text-gray-700">Carbs</span>
                      </div>
                      <span class="font-bold text-gray-900">${
                        nutrition?.perServing?.carbs ?? 0
                      }g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-blue-500 h-2 rounded-full"
                        style="width: ${
                          ((nutrition?.perServing?.carbs ?? 0) /
                            NUTRITION_MAX.carbs) *
                          100
                        }%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span class="text-gray-700">Fat</span>
                      </div>
                      <span class="font-bold text-gray-900">${
                        nutrition?.perServing?.fat ?? 0
                      }g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-purple-500 h-2 rounded-full"
                        style="width: ${
                          ((nutrition?.perServing?.fat ?? 0) /
                            NUTRITION_MAX.fat) *
                          100
                        }%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-orange-500"></div>
                        <span class="text-gray-700">Fiber</span>
                      </div>
                      <span class="font-bold text-gray-900">${
                        nutrition?.perServing?.fiber ?? 0
                      }g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-orange-500 h-2 rounded-full"
                        style="width: ${
                          ((nutrition?.perServing?.fiber ?? 0) /
                            NUTRITION_MAX.fiber) *
                          100
                        }%"
                      ></div>
                    </div>

                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2">
                        <div class="w-3 h-3 rounded-full bg-pink-500"></div>
                        <span class="text-gray-700">Sugar</span>
                      </div>
                      <span class="font-bold text-gray-900">${
                        nutrition?.perServing?.sugar ?? 0
                      }g</span>
                    </div>
                    <div class="w-full bg-gray-100 rounded-full h-2">
                      <div
                        class="bg-pink-500 h-2 rounded-full"
                        style="width: ${
                          ((nutrition?.perServing?.sugar ?? 0) /
                            NUTRITION_MAX.sugar) *
                          100
                        }%"
                      ></div>
                    </div>
                  </div>               
                `;
}
mealsContainer.addEventListener("click", async (event) => {
  const mealCard = event.target.closest(".recipe-card");
  const mealId = mealCard.dataset.mealId;
  const mealDetails = await getMealDetails(mealId);
  sessionStorage.setItem("selectedMealId", mealId);

  toggleSectionVisibility("meal-details", `/meal/${mealDetails.name.slug}`);
  if (!mealCard) return;
  const nuritionData = await analyzeMealNutrition(mealDetails);
  console.log(nuritionData.perServing);
  console.log(nuritionData.totals);
  renderHeroSection(mealDetails, nuritionData);
  renderActionLog(mealId);
  renderIngredient(mealDetails.ingredients);
  renderInstructions(mealDetails.instructions);
  renderNutriationInfo(nuritionData);
  showVideoSection(mealDetails.youtube);
  selectedMeal = mealDetails;
  selectedNutrition = nuritionData;
});

function toggleSectionVisibility(sectionId, url = null) {
  const allSections = document.getElementsByTagName("section");
  for (let i = 0; i < allSections.length; i++) {
    const sec = allSections[i];
    sec.style.display = "none";
  }
  if (sectionId === "homeSection") {
    homeSectios.forEach((section) => {
      section.style.display = "block";
    });
  } else {
    const section = document.getElementById(sectionId);
    section.style.display = "block";
  }

  if (url) {
    history.pushState({ sectionId }, "", url);
  }
}
function buildNutritionPayload(meal) {
  return meal.ingredients.map((i) => `${i.measure} ${i.ingredient}`);
}

// log meal modal
let selectedServings = 1;
const logMealModal = document.getElementById("log-meal-modal");
const cancelLogMealBtn = document.getElementById("cancel-log-meal");
const openLogMealBtn = document.getElementById("log-meal-btn");
const servingsInput = document.getElementById("meal-servings");

function openLogMealModal() {
  logMealModal.classList.remove("hidden");
  document.getElementById("modal-meal-image").src = selectedMeal.thumbnail;
  document.getElementById("modal-meal-name").textContent = selectedMeal.name;
  document.getElementById(
    "modal-calories"
  ).textContent = `${selectedNutrition.perServing.calories}`;
  document.getElementById(
    "modal-protein"
  ).textContent = `${selectedNutrition.perServing.protein}`;
  document.getElementById(
    "modal-carbs"
  ).textContent = `${selectedNutrition.perServing.carbs}`;
  document.getElementById(
    "modal-fat"
  ).textContent = `${selectedNutrition.perServing.fat}`;
}

function closeLogMealModal() {
  logMealModal.classList.add("hidden");
}

openLogMealBtn.addEventListener("click", openLogMealModal);

cancelLogMealBtn.addEventListener("click", closeLogMealModal);

servingsInput.addEventListener("input", () => {
  selectedServings = Number(servingsInput.value);
});

document.getElementById("increase-servings").addEventListener("click", () => {
  selectedServings += 1;
  servingsInput.value = selectedServings;
});

document.getElementById("decrease-servings").addEventListener("click", () => {
  if (selectedServings > 1) {
    selectedServings -= 1;
    servingsInput.value = selectedServings;
  }
});
document.getElementById("confirm-log-meal").addEventListener("click", () => {
  const today = new Date().toISOString().split("T")[0];

  const stored = JSON.parse(localStorage.getItem("foodLog")) || {};

  if (!stored[today]) {
    stored[today] = {
      totalCalories: 0,
      totalProtein: 0,
      totalCarbs: 0,
      totalFat: 0,
      meals: [],
    };
  }

  const nutrition = {
    calories: selectedNutrition.perServing.calories * selectedServings,
    protein: selectedNutrition.perServing.protein * selectedServings,
    carbs: selectedNutrition.perServing.carbs * selectedServings,
    fat: selectedNutrition.perServing.fat * selectedServings,
  };

  stored[today].meals.push({
    type: "meal",
    name: selectedMeal.name,
    mealId: selectedMeal.id,
    category: selectedMeal.category,
    thumbnail: selectedMeal.thumbnail,
    servings: selectedServings,
    nutrition,
    loggedAt: new Date().toISOString(),
  });

  stored[today].totalCalories += nutrition.calories;
  stored[today].totalProtein += nutrition.protein;
  stored[today].totalCarbs += nutrition.carbs;
  stored[today].totalFat += nutrition.fat;

  localStorage.setItem("foodLog", JSON.stringify(stored));

  closeLogMealModal();
  alert("✅ Meal logged successfully");
});

// Food log section
const TARGETS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
};

function getFoodLog() {
  return JSON.parse(localStorage.getItem("foodLog")) || {};
}

function getTodayKey(date = new Date()) {
  return date.toISOString().split("T")[0]; // YYYY-MM-DD
}
function renderFoodLogDate(date = new Date()) {
  const options = { weekday: "long", month: "short", day: "numeric" };
  document.getElementById("foodlog-date").textContent = date.toLocaleDateString(
    "en-US",
    options
  );
}
function renderTodaySummary(dayData) {
  const summary = [
    { key: "calories", color: "emerald" },
    { key: "protein", color: "blue" },
    { key: "carbs", color: "amber" },
    { key: "fat", color: "purple" },
  ];

  const cards = document.querySelectorAll("#foodlog-today-section .rounded-xl");

  summary.forEach((item, index) => {
    const value = dayData?.[`total${capitalize(item.key)}`] || 0;
    const target = TARGETS[item.key];
    const percent = Math.min((value / target) * 100, 100);

    const card = cards[index];
    card.querySelector(
      "span.text-gray-500"
    ).textContent = `${value} / ${target} ${
      item.key === "calories" ? "kcal" : "g"
    }`;

    card.querySelector(".rounded-full > div").style.width = `${percent}%`;
  });
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
function renderLoggedItems(dayData, dateKey) {
  const container = document.getElementById("logged-items-list");
  const title = document.querySelector("h4.text-gray-700");
  const clearBtn = document.getElementById("clear-foodlog");

  container.innerHTML = "";

  if (!dayData || !dayData.meals.length) {
    title.textContent = "Logged Items (0)";
    clearBtn.style.display = "none";
    container.innerHTML = `
      <div class="text-center py-8 text-gray-500">
        <p>No meals logged today</p>
      </div>`;
    return;
  }

  title.textContent = `Logged Items (${dayData.meals.length})`;
  clearBtn.style.display = "inline-block";

  dayData.meals.forEach((meal, index) => {
    container.innerHTML += `
      <div class="flex items-center justify-between bg-gray-50 rounded-xl p-3">
        <div class="flex gap-3 items-center">
          <img src="${meal.thumbnail}" class="w-12 h-12 rounded-lg object-cover"/>
          <div>
            <p class="font-semibold text-gray-900">${meal.name}</p>
            <p class="text-xs text-gray-500">
              ${meal.servings} serving • ${meal.category}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="text-right text-sm">
            <p class="font-bold text-emerald-600">${meal.nutrition.calories}</p>
            <p class="text-xs text-gray-500">
              ${meal.nutrition.protein}g P • ${meal.nutrition.carbs}g C • ${meal.nutrition.fat}g F
            </p>
          </div>

          <button 
            class="delete-log-item text-red-500 hover:text-red-700"
            data-date="${dateKey}"
            data-index="${index}">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </div>`;
  });
  document.querySelectorAll(".delete-log-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const dateKey = btn.dataset.date;
      const index = Number(btn.dataset.index);
      deleteLoggedItem(dateKey, index);
    });
  });
}
function deleteLoggedItem(dateKey, index) {
  const foodLog = getFoodLog();

  const day = foodLog[dateKey];
  if (!day) return;

  const removed = day.meals.splice(index, 1)[0];

  day.totalCalories -= removed.nutrition.calories;
  day.totalProtein -= removed.nutrition.protein;
  day.totalCarbs -= removed.nutrition.carbs;
  day.totalFat -= removed.nutrition.fat;

  if (day.meals.length === 0) {
    delete foodLog[dateKey];
  }

  localStorage.setItem("foodLog", JSON.stringify(foodLog));

  loadFoodLogPage();
}

function calculateDaysOnGoal(foodLog) {
  return Object.values(foodLog).filter(
    (d) => d.totalCalories >= 1800 && d.totalCalories <= 2200
  ).length;
}
function renderWeeklyStats(foodLog) {
  const days = Object.values(foodLog);
  const totalCalories = days.reduce((s, d) => s + d.totalCalories, 0);
  const totalMeals = days.reduce((s, d) => s + d.meals.length, 0);

  document.querySelector(".weekly-average").textContent =
    Math.round(totalCalories / days.length) + " kcal";

  document.querySelector(".total-items-week").textContent =
    totalMeals + " items";

  document.querySelector(".days-on-goal").textContent =
    calculateDaysOnGoal(foodLog) + " / 7";
}
function loadFoodLogPage() {
  const foodLog = getFoodLog();
  const todayKey = getTodayKey();
  const todayData = foodLog[todayKey];

  renderFoodLogDate();
  renderTodaySummary(todayData);
  renderLoggedItems(todayData);
  renderWeeklyStats(foodLog);
  renderWeeklyOverview(foodLog);
}
function getWeeklyCalories(foodLog) {
  return getLast7Days().map((date) => ({
    date,
    calories: foodLog[date]?.totalCalories || 0,
  }));
}
function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split("T")[0]);
  }
  return days;
}
function renderWeeklyOverview(foodLog) {
  const container = document.getElementById("weekly-chart");
  container.innerHTML = "";

  const week = getWeeklyCalories(foodLog);
  const maxCalories = Math.max(...week.map((d) => d.calories), 2000);
  const todayKey = getTodayKey();

  week.forEach((day) => {
    const percent = Math.round((day.calories / maxCalories) * 100);
    const dateObj = new Date(day.date);

    const dayLabel = dateObj.toLocaleDateString("en-US", {
      weekday: "short",
    });

    const isToday = day.date === todayKey;

    container.innerHTML += `
      <div class="flex flex-col items-center gap-2">
        
        <!-- Calories value -->
        <span class="text-xs font-semibold text-gray-600">
          ${day.calories}
        </span>

        <!-- Bar -->
        <div class="h-28 w-8 bg-gray-100 rounded-full flex items-end overflow-hidden">
          <div
            class="${
              isToday ? "bg-indigo-500" : "bg-emerald-400"
            } w-full rounded-full transition-all"
            style="height: ${percent}%"
            title="${day.calories} kcal"
          ></div>
        </div>

        <!-- Day -->
        <span class="text-xs font-medium ${
          isToday ? "text-indigo-600 font-bold" : "text-gray-500"
        }">
          ${dayLabel}
        </span>
      </div>
    `;
  });
}
