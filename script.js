// Populate the area dropdown when the page loads
window.addEventListener("DOMContentLoaded", async function () {
  const areaSelect = document.getElementById("area-select");
  const categorySelect = document.getElementById("category-select");

  // Reset dropdowns to their default state
  areaSelect.innerHTML = '<option value="">Select Area</option>';
  categorySelect.innerHTML = '<option value="">Select Category</option>';

  try {
    // Fetch and populate areas using async/await
    const areaResponse = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?a=list"
    );
    const areaData = await areaResponse.json();

    // Check if we received area data and populate the dropdown
    if (areaData.meals) {
      areaData.meals.forEach((areaObj) => {
        const option = document.createElement("option");
        option.value = areaObj.strArea;
        option.textContent = areaObj.strArea;
        areaSelect.appendChild(option);
      });
    }

    // Fetch and populate categories using async/await
    const categoryResponse = await fetch(
      "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
    );
    const categoryData = await categoryResponse.json();

    // Check if we received category data and populate the dropdown
    if (categoryData.meals) {
      categoryData.meals.forEach((categoryObj) => {
        const option = document.createElement("option");
        option.value = categoryObj.strCategory;
        option.textContent = categoryObj.strCategory;
        categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    // Handle any errors that might occur during API calls
    console.error("Error fetching dropdown data:", error);
  }
});

// Function to fetch detailed meal information by ID
async function fetchMealDetails(mealId) {
  try {
    // Fetch detailed meal information using the meal ID
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${mealId}`
    );
    const data = await response.json();

    // Check if meal data was found
    if (data.meals && data.meals[0]) {
      const meal = data.meals[0];
      console.log("Detailed Recipe Information:", meal);

      // Call function to display the recipe details on the page
      displayRecipeDetails(meal);
    } else {
      console.log("No detailed information found for this recipe.");
    }
  } catch (error) {
    console.error("Error fetching meal details:", error);
  }
}

// Function to display detailed recipe information on the page
function displayRecipeDetails(meal) {
  const resultsDiv = document.getElementById("results");

  // Clear the current results and show detailed view
  resultsDiv.innerHTML = "";

  // Create main container for recipe details
  const detailsContainer = document.createElement("div");
  detailsContainer.className = "recipe-details";

  // Create and add back button
  const backButton = document.createElement("button");
  backButton.textContent = "← Back to Results";
  backButton.className = "back-button";
  backButton.addEventListener("click", function () {
    // Re-trigger the current filter selection to show the meal list again
    const areaSelect = document.getElementById("area-select");
    const categorySelect = document.getElementById("category-select");

    // Check which filter is currently active and re-trigger it
    if (areaSelect.value) {
      fetchAndDisplayMeals("area", areaSelect.value);
    } else if (categorySelect.value) {
      fetchAndDisplayMeals("category", categorySelect.value);
    }
  });

  // Create recipe title
  const title = document.createElement("h2");
  title.textContent = meal.strMeal;
  title.className = "recipe-title";

  // Create recipe image
  const image = document.createElement("img");
  image.src = meal.strMealThumb;
  image.alt = meal.strMeal;
  image.className = "recipe-image";

  // Create recipe info section (category and area)
  const infoSection = document.createElement("div");
  infoSection.className = "recipe-info";
  infoSection.innerHTML = `
    <p><strong>Category:</strong> ${meal.strCategory}</p>
    <p><strong>Area:</strong> ${meal.strArea}</p>
  `;

  // Create ingredients section
  const ingredientsSection = document.createElement("div");
  ingredientsSection.className = "ingredients-section";

  const ingredientsTitle = document.createElement("h3");
  ingredientsTitle.textContent = "Ingredients";

  const ingredientsList = document.createElement("ul");
  ingredientsList.className = "ingredients-list";

  // Add ingredients to the list (only non-empty ones)
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      const listItem = document.createElement("li");
      listItem.textContent = `${
        measure ? measure.trim() : ""
      } ${ingredient.trim()}`;
      ingredientsList.appendChild(listItem);
    }
  }

  ingredientsSection.appendChild(ingredientsTitle);
  ingredientsSection.appendChild(ingredientsList);

  // Create instructions section
  const instructionsSection = document.createElement("div");
  instructionsSection.className = "instructions-section";

  const instructionsTitle = document.createElement("h3");
  instructionsTitle.textContent = "Instructions";

  const instructionsText = document.createElement("p");
  instructionsText.textContent = meal.strInstructions;
  instructionsText.className = "instructions-text";

  instructionsSection.appendChild(instructionsTitle);
  instructionsSection.appendChild(instructionsText);

  // Add video link if available
  if (meal.strYoutube) {
    const videoSection = document.createElement("div");
    videoSection.className = "video-section";

    const videoLink = document.createElement("a");
    videoLink.href = meal.strYoutube;
    videoLink.textContent = "Watch Video Tutorial";
    videoLink.target = "_blank";
    videoLink.className = "video-link";

    videoSection.appendChild(videoLink);
    detailsContainer.appendChild(videoSection);
  }

  // Append all elements to the details container
  detailsContainer.appendChild(backButton);
  detailsContainer.appendChild(title);
  detailsContainer.appendChild(image);
  detailsContainer.appendChild(infoSection);
  detailsContainer.appendChild(ingredientsSection);
  detailsContainer.appendChild(instructionsSection);

  // Add the details container to the results div
  resultsDiv.appendChild(detailsContainer);
}

// Function to fetch and display meals based on filters
async function fetchAndDisplayMeals(filterType, filterValue) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = ""; // Clear previous results

  if (!filterValue) return;

  try {
    // Determine the API endpoint based on filter type
    let apiUrl;
    if (filterType === "area") {
      apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(
        filterValue
      )}`;
    } else if (filterType === "category") {
      apiUrl = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${encodeURIComponent(
        filterValue
      )}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();

    if (data.meals) {
      data.meals.forEach((meal) => {
        const mealDiv = document.createElement("div");
        mealDiv.className = "meal";

        const title = document.createElement("h3");
        title.textContent = meal.strMeal;

        const img = document.createElement("img");
        img.src = meal.strMealThumb;
        img.alt = meal.strMeal;

        // Add click event listener to fetch detailed information
        mealDiv.addEventListener("click", function () {
          console.log(`Fetching details for: ${meal.strMeal}`);
          fetchMealDetails(meal.idMeal);
        });

        // Add cursor pointer style to indicate clickable element
        mealDiv.style.cursor = "pointer";

        mealDiv.appendChild(title);
        mealDiv.appendChild(img);
        resultsDiv.appendChild(mealDiv);
      });
    } else {
      resultsDiv.textContent = `No meals found for this ${filterType}.`;
    }
  } catch (error) {
    console.error(`Error fetching meals by ${filterType}:`, error);
    resultsDiv.textContent = "Error loading meals. Please try again.";
  }
}

// Event listener for area selection
document.getElementById("area-select").addEventListener("change", function () {
  const area = this.value;
  const categorySelect = document.getElementById("category-select");

  // Clear category selection when area is selected
  categorySelect.value = "";

  fetchAndDisplayMeals("area", area);
});

// Event listener for category selection
document
  .getElementById("category-select")
  .addEventListener("change", function () {
    const category = this.value;
    const areaSelect = document.getElementById("area-select");

    // Clear area selection when category is selected
    areaSelect.value = "";

    fetchAndDisplayMeals("category", category);
  });
