import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9z1PQMyrZ2_t3_weFQ2d1W-LBQsnaQak",
  authDomain: "aerotech-d1e11.firebaseapp.com",
  projectId: "aerotech-d1e11",
  storageBucket: "aerotech-d1e11.firebasestorage.app",
  messagingSenderId: "404962146166",
  appId: "1:404962146166:web:d27d39f7d5dbef03d86c57",
  measurementId: "G-C85193Y7BJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {

  // --- 0. Chargement dynamique des avions depuis Firestore ---
  async function loadPlanes() {
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;

    grid.innerHTML = "<p style='color: white; text-align: center;'>Chargement des appareils...</p>";

    try {
      const querySnapshot = await getDocs(collection(db, "planes"));
      grid.innerHTML = ""; 

      if (querySnapshot.empty) {
        grid.innerHTML = "<p style='color: white; text-align: center;'>Aucun avion trouvé dans la base de données. Ajoutes-en un via l'Espace Admin !</p>";
        return;
      }

      querySnapshot.forEach((doc) => {
        const plane = doc.data();
        const cardHTML = `
          <div class="plane-card" data-category="${plane.category || ''}" data-constructor="${plane.constructor || ''}" data-generation="${plane.generation || ''}" data-airline="${plane.airline || ''}">
            <img src="${plane.image || ''}" alt="${plane.name || ''}">
            <div class="card-content">
              <span class="badge">${plane.constructor || plane.category || ''}</span>
              <h3>${plane.name || ''}</h3>
              <p style="color: #cbd5e1; font-size: 0.85rem; margin-bottom: 10px;">${plane.speed ? 'Vitesse : ' + plane.speed : ''}</p>
              <a href="detail.html?id=${doc.id}" class="btn-main card-btn">Voir la fiche</a>
            </div>
          </div>
        `;
        grid.innerHTML += cardHTML;
      });

      // Lancer l'initialisation des filtres et de la recherche une fois les cartes injectées
      initSearchAndFilters();

    } catch (error) {
      console.error("Erreur de chargement:", error);
      grid.innerHTML = "<p style='color: red; text-align: center;'>Erreur de chargement de la base de données.</p>";
    }
  }

  loadPlanes();


  // --- Fonctionnalités de recherche, sidebar et filtres en cascade ---
  function initSearchAndFilters() {
    
    // --- 1. Gestion de la Sidebar (Rétractable avec animation) ---
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('sidebarFilters');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // --- 2. Logique des menus en cascade ---
    function setupToggle(btnId, targetId) {
      const btn = document.getElementById(btnId);
      const target = document.getElementById(targetId);
      if(btn && target) {
        btn.addEventListener('click', () => {
          target.classList.toggle('hidden');
        });
      }
    }

    setupToggle('btnChasse', 'groupGenerations');
    setupToggle('btnCommercial', 'groupConstructeurs');
    setupToggle('btnCompagnies', 'groupCompagnies');

    // --- 3. Filtrage par clic sur les boutons ---
    const planeCards = document.querySelectorAll('.plane-card');
    const resetBtn = document.getElementById('resetFiltersBtn');

    // Filtrer par génération (Avions de chasse)
    document.querySelectorAll('.gen-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const selectedGen = btn.getAttribute('data-gen');
        planeCards.forEach(card => {
          if (card.getAttribute('data-generation') === selectedGen) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Filtrer par constructeur (chargé dynamiquement)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('constructor-filter-btn')) {
        const selectedConst = e.target.getAttribute('data-constructor');
        planeCards.forEach(card => {
          if (card.getAttribute('data-constructor') === selectedConst) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      }

      // Filtrer par compagnie aérienne (chargée dynamiquement)
      if (e.target.classList.contains('airline-filter-btn')) {
        const selectedAirline = e.target.getAttribute('data-airline');
        planeCards.forEach(card => {
          if (card.getAttribute('data-airline') === selectedAirline) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      }
    });

    // Bouton "Afficher Tout"
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        planeCards.forEach(card => card.style.display = 'block');
      });
    }

    // --- 4. Barre de recherche instantanée & Suggestions ---
    const searchInput = document.getElementById('searchInput');
    const suggestionsBox = document.getElementById('suggestions-box');

    if (searchInput && suggestionsBox) {
      searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        let matches = [];

        planeCards.forEach(card => {
          const titleElement = card.querySelector('h3');
          const badgeElement = card.querySelector('.badge');
          
          if (!titleElement || !badgeElement) return;

          const title = titleElement.textContent;
          const titleLower = title.toLowerCase();
          const badge = badgeElement.textContent.toLowerCase();

          if (searchTerm !== "" && (titleLower.includes(searchTerm) || badge.includes(searchTerm))) {
            card.style.display = 'block';
            matches.push(title);
          } else if (searchTerm === "") {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });

        if (searchTerm === "" || matches.length === 0) {
          suggestionsBox.innerHTML = "";
          suggestionsBox.classList.add('hidden');
        } else {
          suggestionsBox.innerHTML = matches.slice(0, 5).map(match => `
            <div class="suggestion-item">${match}</div>
          `).join('');
          suggestionsBox.classList.remove('hidden');

          document.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
              searchInput.value = item.textContent;
              suggestionsBox.classList.add('hidden');
              searchInput.dispatchEvent(new Event('input'));
            });
          });
        }
      });

      document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
          suggestionsBox.classList.add('hidden');
        }
      });
    }
  }

});