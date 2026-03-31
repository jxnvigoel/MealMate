
document.addEventListener('DOMContentLoaded', function() {
    var drinksContainer = document.getElementById('drinks-container');
    var loadingText = document.getElementById('loading-text');
    var errorMessage = document.getElementById('error-message');

    var apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=a';
    // here we can change the letter to get different cocktails list

    function fetchDrinks() {
        loadingText.style.display = 'block';
        
        fetch(apiUrl)
            .then(function(response) {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Network response was not ok');
                }
            })
            .then(function(data) {
                loadingText.style.display = 'none';
                
                if (data.drinks) {
                    displayDrinks(data.drinks);
                } else {
                    errorMessage.textContent = 'No drinks found.';
                    errorMessage.style.display = 'block';
                }
            })
            .catch(function(error) {
                loadingText.style.display = 'none';
                errorMessage.style.display = 'block';
                console.error('Fetch error:', error);
            });
    }

    function displayDrinks(drinksArray) {
        drinksContainer.innerHTML = '';

        drinksArray.forEach(function(drink) {
            var drinkCard = document.createElement('div');
            drinkCard.className = 'drink-card';

            var drinkImage = document.createElement('img');
            drinkImage.src = drink.strDrinkThumb;
            drinkImage.alt = drink.strDrink;

            var drinkName = document.createElement('h3');
            drinkName.textContent = drink.strDrink;

            drinkCard.appendChild(drinkImage);
            drinkCard.appendChild(drinkName);

            drinksContainer.appendChild(drinkCard);
        });
    }

    fetchDrinks();
});
