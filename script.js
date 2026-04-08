document.addEventListener('DOMContentLoaded', function() {
    const landingSection = document.getElementById('landing-section');
    const mainContent = document.getElementById('main-content');
    const drinksGrid = document.getElementById('drinks-grid');
    const statusMsg = document.getElementById('status-msg');
    const searchBox = document.getElementById('search-box');
    const sortBtn = document.getElementById('sort-btn');
    const favViewBtn = document.getElementById('fav-view-btn');
    const themeBtn = document.getElementById('theme-btn');
    const sectionTitle = document.getElementById('section-title');
    const backHome = document.getElementById('back-home');
    const logoHome = document.getElementById('logo-home');
    const modal = document.getElementById('drink-modal');
    const modalContent = document.getElementById('modal-content');
    const closeModal = document.querySelector('.close-modal');

    const btnAlcoholic = document.getElementById('btn-alcoholic');
    const btnNonAlcoholic = document.getElementById('btn-non-alcoholic');

    let allDrinks = [];
    let currentCategory = 'Alcoholic';
    let showingFavs = false;

    const apiUrls = [
        'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=a',
        'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=b',
        'https://www.thecocktaildb.com/api/json/v1/1/search.php?f=m',
        'https://www.thecocktaildb.com/api/json/v1/1/filter.php?a=Non_Alcoholic'
    ];

    async function fetchAllDrinks() {
        statusMsg.textContent = 'Fetching library...';
        try {
            const results = await Promise.all(apiUrls.map(url => fetch(url).then(res => res.json())));
            
            let combined = [];
            results.forEach((res, index) => {
                if (res.drinks) {
                    const processed = res.drinks.map(d => {
                        if (apiUrls[index].includes('filter.php?a=Non_Alcoholic')) {
                            return { ...d, strAlcoholic: 'Non Alcoholic' };
                        }
                        return d;
                    });
                    combined = [...combined, ...processed];
                }
            });

            const unique = {};
            allDrinks = combined.filter(d => {
                if (unique[d.idDrink]) return false;
                unique[d.idDrink] = true;
                return true;
            });
            
            statusMsg.textContent = '';
        } catch (error) {
            statusMsg.textContent = 'Error loading drinks. Please refresh.';
        }
    }

    function renderDrinks(drinksToRender) {
        drinksGrid.innerHTML = '';
        if (drinksToRender.length === 0) {
            statusMsg.textContent = 'No drinks found.';
            return;
        }
        statusMsg.textContent = '';

        drinksToRender.forEach(drink => {
            const isFav = checkIfFav(drink.idDrink);
            const card = document.createElement('div');
            card.className = 'drink-card';
            card.innerHTML = `
                <img src="${drink.strDrinkThumb}" alt="${drink.strDrink}">
                <div class="card-info">
                    <h3>${drink.strDrink}</h3>
                    <p>${drink.strAlcoholic || 'Drink'}</p>
                    <div class="card-btns">
                        <button class="details-btn">Details</button>
                        <button class="fav-button">${isFav ? '❤ Remove' : '🤍 Favorite'}</button>
                    </div>
                </div>
            `;
            
            card.querySelector('.details-btn').onclick = () => openModal(drink);
            card.querySelector('.fav-button').onclick = () => toggleFavorite(drink);
            drinksGrid.appendChild(card);
        });
    }

    function updateView() {
        let filtered = [];
        
        if (showingFavs) {
            filtered = getFavorites();
            sectionTitle.textContent = 'My Favorites';
        } else {
            filtered = allDrinks.filter(d => d.strAlcoholic === currentCategory);
            sectionTitle.textContent = currentCategory + ' Drinks';
        }

        const searchTerm = searchBox.value.toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(d => d.strDrink.toLowerCase().includes(searchTerm));
        }

        renderDrinks(filtered);
    }

    function switchPage(page) {
        if (page === 'home') {
            landingSection.classList.remove('hidden');
            mainContent.classList.add('hidden');
            showingFavs = false;
            searchBox.value = '';
        } else {
            landingSection.classList.add('hidden');
            mainContent.classList.remove('hidden');
            window.scrollTo(0, 0);
        }
    }

    btnAlcoholic.onclick = () => {
        currentCategory = 'Alcoholic';
        switchPage('main');
        updateView();
    };

    btnNonAlcoholic.onclick = () => {
        currentCategory = 'Non Alcoholic';
        switchPage('main');
        updateView();
    };

    backHome.onclick = () => switchPage('home');
    logoHome.onclick = () => switchPage('home');

    searchBox.oninput = updateView;

    sortBtn.onclick = () => {
        let filtered = showingFavs ? getFavorites() : allDrinks.filter(d => d.strAlcoholic === currentCategory);
        const searchTerm = searchBox.value.toLowerCase();
        if (searchTerm) filtered = filtered.filter(d => d.strDrink.toLowerCase().includes(searchTerm));

        filtered.sort((a, b) => a.strDrink.localeCompare(b.strDrink));
        renderDrinks(filtered);
    };

    favViewBtn.onclick = () => {
        showingFavs = !showingFavs;
        favViewBtn.textContent = showingFavs ? 'Show All' : 'My Favorites';
        if (showingFavs) switchPage('main');
        updateView();
    };

    async function openModal(drink) {
        modalContent.innerHTML = '<p class="loader-text">Loading details...</p>';
        modal.style.display = 'flex';

        let fullDrink = drink;
        if (!drink.strInstructions) {
            try {
                const res = await fetch(`https://www.thecocktaildb.com/api/json/v1/1/lookup.php?i=${drink.idDrink}`);
                const data = await res.json();
                if (data.drinks) fullDrink = data.drinks[0];
            } catch (err) {
                modalContent.innerHTML = '<p>Error loading details.</p>';
                return;
            }
        }

        let ingredientsHTML = '';
        for (let i = 1; i <= 15; i++) {
            const ingredient = fullDrink['strIngredient' + i];
            const measure = fullDrink['strMeasure' + i];
            if (ingredient) {
                ingredientsHTML += `<li>${measure || ''} ${ingredient}</li>`;
            }
        }

        modalContent.innerHTML = `
            <h2 style="margin-bottom: 20px;">${fullDrink.strDrink}</h2>
            <img src="${fullDrink.strDrinkThumb}" style="width:100%; border-radius:20px; margin-bottom: 20px;">
            <p><strong>Category:</strong> ${fullDrink.strCategory || 'N/A'}</p>
            <p><strong>Glass:</strong> ${fullDrink.strGlass || 'N/A'}</p>
            <h3 style="margin: 20px 0 10px 0;">Ingredients</h3>
            <ul>${ingredientsHTML}</ul>
            <h3 style="margin: 20px 0 10px 0;">Instructions</h3>
            <p>${fullDrink.strInstructions || 'No instructions available.'}</p>
        `;
    }

    closeModal.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target === modal) modal.style.display = 'none'; };

    function getFavorites() {
        const favs = localStorage.getItem('dm_favs');
        return favs ? JSON.parse(favs) : [];
    }

    function checkIfFav(id) {
        return getFavorites().some(f => f.idDrink === id);
    }

    function toggleFavorite(drink) {
        let favs = getFavorites();
        const exists = favs.some(f => f.idDrink === drink.idDrink);
        if (exists) {
            favs = favs.filter(f => f.idDrink !== drink.idDrink);
        } else {
            favs.push(drink);
        }
        localStorage.setItem('dm_favs', JSON.stringify(favs));
        updateView();
    }

    themeBtn.onclick = () => {
        const isDark = document.body.getAttribute('data-theme') !== 'light';
        const nextTheme = isDark ? 'light' : 'dark';
        if (nextTheme === 'light') {
            document.body.setAttribute('data-theme', 'light');
            themeBtn.textContent = '🌙 Dark Mode';
        } else {
            document.body.removeAttribute('data-theme');
            themeBtn.textContent = '☀️ Light Mode';
        }
        localStorage.setItem('dm_theme', nextTheme);
    };

    const savedTheme = localStorage.getItem('dm_theme');
    if (savedTheme === 'light') {
        document.body.setAttribute('data-theme', 'light');
        themeBtn.textContent = '🌙 Dark Mode';
    }

    fetchAllDrinks();
});
