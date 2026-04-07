document.addEventListener('DOMContentLoaded', function() {
    const drinksGrid = document.getElementById('drinks-grid');
    const statusMsg = document.getElementById('status-msg');
    const searchBox = document.getElementById('search-box');
    const typeFilter = document.getElementById('type-filter');
    const sortBtn = document.getElementById('sort-btn');
    const favViewBtn = document.getElementById('fav-view-btn');
    const themeBtn = document.getElementById('theme-btn');
    const modal = document.getElementById('drink-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.querySelector('.close-modal');

    let allDrinks = [];
    let isShowingFavs = false;
    const apiUrl = 'https://www.thecocktaildb.com/api/json/v1/1/search.php?s=a';

    function fetchInitialDrinks() {
        statusMsg.textContent = 'Loading drinks...';
        fetch(apiUrl)
            .then(function(res) { return res.json(); })
            .then(function(data) {
                statusMsg.textContent = '';
                if (data.drinks) {
                    allDrinks = data.drinks;
                    renderProducts(allDrinks);
                } else {
                    statusMsg.textContent = 'No drinks found.';
                }
            })
            .catch(function() {
                statusMsg.textContent = 'Error connecting to server. Please try later.';
            });
    }

    function renderProducts(drinksToRender) {
        drinksGrid.innerHTML = '';
        drinksToRender.forEach(function(drink) {
            const card = document.createElement('div');
            card.className = 'drink-card';
            
            const favText = isDrinkInFavorites(drink.idDrink) ? '❤ Remove' : '🤍 Favorite';
            
            card.innerHTML = `
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                <div class="card-info">
                    <h3>${drink.strDrink}</h3>
                    <p>${drink.strAlcoholic}</p>
                    <div class="card-btns">
                        <button class="details-btn">View Details</button>
                        <button class="fav-button">${favText}</button>
                    </div>
                </div>
            `;
            
            card.querySelector('.details-btn').onclick = function() { openDetails(drink); };
            card.querySelector('.fav-button').onclick = function() { toggleFav(drink); };
            
            drinksGrid.appendChild(card);
        });
    }

    function updateDisplay() {
        const sourceData = isShowingFavs ? getFavsFromStorage() : allDrinks;
        const searchText = searchBox.value.toLowerCase();
        const typeValue = typeFilter.value;

        const filtered = sourceData.filter(function(drink) {
            const matchesName = drink.strDrink.toLowerCase().includes(searchText);
            const matchesType = typeValue === 'all' || drink.strAlcoholic.toLowerCase() === typeValue;
            return matchesName && matchesType;
        });

        renderProducts(filtered);
    }

    searchBox.oninput = updateDisplay;
    typeFilter.onchange = updateDisplay;

    sortBtn.onclick = function() {
        const sourceData = isShowingFavs ? getFavsFromStorage() : allDrinks;
        const searchText = searchBox.value.toLowerCase();
        const typeValue = typeFilter.value;

        const filtered = sourceData.filter(function(drink) {
            const matchesName = drink.strDrink.toLowerCase().includes(searchText);
            const matchesType = typeValue === 'all' || drink.strAlcoholic.toLowerCase() === typeValue;
            return matchesName && matchesType;
        });

        filtered.sort(function(a, b) {
            if (a.strDrink < b.strDrink) return -1;
            if (a.strDrink > b.strDrink) return 1;
            return 0;
        });

        renderProducts(filtered);
    };

    favViewBtn.onclick = function() {
        isShowingFavs = !isShowingFavs;
        favViewBtn.textContent = isShowingFavs ? 'Show All Drinks' : 'My Favorites';
        updateDisplay();
    };

    function openDetails(drink) {
        let ingredientsHTML = '';
        for (let i = 1; i <= 15; i++) {
            const name = drink['strIngredient' + i];
            const amount = drink['strMeasure' + i];
            if (name) {
                ingredientsHTML += `<li>${amount || ''} ${name}</li>`;
            }
        }

        modalContent.innerHTML = `
            <h2>${drink.strDrink}</h2>
            <img src="${drink.strDrinkThumb}" style="width:100%; border-radius:12px; margin: 15px 0;">
            <p><strong>Category:</strong> ${drink.strCategory}</p>
            <p><strong>Type:</strong> ${drink.strAlcoholic}</p>
            <p><strong>Glass:</strong> ${drink.strGlass}</p>
            <h3 style="margin-top: 15px;">Ingredients</h3>
            <ul>${ingredientsHTML}</ul>
            <h3 style="margin-top: 15px;">Steps</h3>
            <p>${drink.strInstructions}</p>
        `;
        modal.style.display = 'flex';
    }

    closeModal.onclick = function() { modal.style.display = 'none'; };
    window.onclick = function(e) { if (e.target === modal) modal.style.display = 'none'; };

    function getFavsFromStorage() {
        const saved = localStorage.getItem('dm_favorites');
        return saved ? JSON.parse(saved) : [];
    }

    function isDrinkInFavorites(id) {
        const favs = getFavsFromStorage();
        return favs.some(function(f) { return f.idDrink === id; });
    }

    function toggleFav(drink) {
        let favs = getFavsFromStorage();
        const isIn = favs.some(function(f) { return f.idDrink === drink.idDrink; });

        if (isIn) {
            favs = favs.filter(function(f) { return f.idDrink !== drink.idDrink; });
        } else {
            favs.push(drink);
        }

        localStorage.setItem('dm_favorites', JSON.stringify(favs));
        updateDisplay();
    }

    themeBtn.onclick = function() {
        const bodyAttr = document.body.getAttribute('data-theme');
        const newTheme = bodyAttr === 'light' ? 'dark' : 'light';
        
        document.body.setAttribute('data-theme', newTheme);
        themeBtn.textContent = newTheme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode';
        localStorage.setItem('dm_theme', newTheme);
    };

    const savedTheme = localStorage.getItem('dm_theme') || 'dark';
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        themeBtn.textContent = '🌙 Dark Mode';
    } else {
        document.body.removeAttribute('data-theme');
        themeBtn.textContent = '☀️ Light Mode';
    }

    fetchInitialDrinks();
});
