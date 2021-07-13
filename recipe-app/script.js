const mealsEl = document.getElementById("meals");
const favContainer = document.getElementById("fav-meals");
const searchTerm = document.getElementById("search-term");
const searchBtn = document.getElementById("search");
const mealPopup = document.getElementById("meal-popup");
const popupCloseBtn = document.getElementById("close-popup");
const mealInfoEl = document.getElementById("meal-info");


let getRandomMeal = async () => {
    const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/random.php"
    );
    const responseData = await response.json();
    const randomMeal = responseData.meals[0];
    addMeal(randomMeal, true);
}

let getMealById = async (id) => {
    const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/lookup.php?i=" + id
    );
    const responseData = await response.json();

    const meal = responseData.meals[0];

    return meal;
}

let getMealBySearch = async (name) => {
    const response = await fetch(
        "https://www.themealdb.com/api/json/v1/1/search.php?s=" + name
    );
    const responseData = await response.json();

    const meals = responseData.meals;

    return meals;
}

let addMeal = (mealData, random = false) => {
    const meal = document.createElement('div');
    meal.classList.add('meal');
    meal.innerHTML = `
        <div class="meal-header">
            ${random ? `<span class="random">
            Random Recipe
            </span>` : ""}
            <img src="${mealData.strMealThumb}" 
            alt="${mealData.strMeal}">
        </div>
        <div class="meal-body">
            <h4>${mealData.strMeal}</h4>
            <button class="fav-btn">
                <i class="fas fa-heart"></i>
            </button>
        </div>
    `;

    const favBtn = meal.querySelector(".meal-body .fav-btn");

    
    favBtn.addEventListener("click", () => {
        if (favBtn.classList.contains("active")) {
            removeMealFromLS(mealData.idMeal);
            favBtn.classList.remove("active");
        } else {
            addMealsToLS(mealData.idMeal);
            favBtn.classList.add("active");
        }

        // clean the container
        fetchFavMeals();
    });

    meal.addEventListener('click', () => {
        showMealInfo(mealData);
    });

    mealsEl.appendChild(meal);
}


let addMealsToLS = (mealId) => {
    const mealIds = getMealsFromLS();
    localStorage.setItem("mealIds", JSON.stringify([...mealIds, mealId]));
} 

let removeMealFromLS = (mealId) => {
    const mealIds = getMealsFromLS();
    localStorage.setItem(
        "mealIds", 
        JSON.stringify(mealIds.filter((id) => id !== mealId))
    );
}

let getMealsFromLS = () => {
    const mealIds = JSON.parse(localStorage.getItem("mealIds"));
    return mealIds === null ? [] : mealIds;
}

let fetchFavMeals = async () => {
    // clean the container
    favContainer.innerHTML = ""
    const mealIds = getMealsFromLS();
    
    for (let i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i];

        meal = await getMealById(mealId);

        addMealToFav(meal);
    }
}


let addMealToFav = (mealData) => {

    const favMeal = document.createElement('li');
    favMeal.innerHTML = `
    <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    <span>${mealData.strMeal}</span>
    <button class="clear"><i class="fas fa-window-close"></i></button>
    `;

    const btn = favMeal.querySelector(".clear");
    btn.addEventListener("click", () => {
        removeMealFromLS(mealData.idMeal);
        fetchFavMeals();
    });

    favMeal.addEventListener("click", () => {
        showMealInfo(mealData);        
    });

    favContainer.appendChild(favMeal);
    
}

showMealInfo = (mealData) => {
    // clean it up
    mealInfoEl.innerHTML = "";

    // update meal info and show it
    const mealEl = document.createElement("div");

    const ingredients = [];
    // get ingredients and measures
    for (let i = 1; i <= 20; i++) {
        if (mealData["strIngredient"+i]) {
            ingredients.push(`${mealData["strIngredient" + i]} -
            ${mealData["strMeasure" + i]}`);
        } else {
            break;
        }
    }
    
    mealEl.innerHTML = `
        <h1>${mealData.strMeal}</h1>
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
        <p>${mealData.strInstructions}
        </p>
        <h3>Ingredients:</h3>
        <ul>
            ${ingredients.map((ing) => `
            <li>${ing}</li>`).join("")}
        </ul>
    `;
    mealInfoEl.appendChild(mealEl);

    mealPopup.classList.remove('hidden');

}

searchBtn.addEventListener("click", async () => {
    // clear the container
    mealsEl.innerHTML = "";

    const search = searchTerm.value;
    const meals = await getMealBySearch(search);
    if(meals) {
        meals.forEach(meal => {
            addMeal(meal);
        })
    }
});

popupCloseBtn.addEventListener("click", () => {
    mealPopup.classList.add("hidden");
});

getRandomMeal();
fetchFavMeals();
