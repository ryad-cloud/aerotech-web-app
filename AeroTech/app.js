// 1. Liste d'avions de test (en attendant Firebase)
const aircraftsData = [
  { id: "su-57", nom: "Sukhoi Su-57 Felon", category: "chasse", generation: "Gen 5", manufacturer: "Sukhoi" },
  { id: "rafale", nom: "Dassault Rafale", category: "chasse", generation: "Gen 4.5", manufacturer: "Dassault" },
  { id: "f35", nom: "F-35 Lightning II", category: "chasse", generation: "Gen 5", manufacturer: "Lockheed Martin" },
  { id: "a350", nom: "Airbus A350", category: "commercial", manufacturer: "Airbus" },
  { id: "b777", nom: "Boeing 777", category: "commercial", manufacturer: "Boeing" }
];

// 2. Fonction pour afficher les avions dans ta page HTML
function renderAircraftGrid() {
  const gridContainer = document.getElementById("aircraft-grid"); // Assure-toi d'avoir cette div dans ton HTML
  if (!gridContainer) return;

  // On applique les filtres
  const filtered = applyAircraftFilters(aircraftsData);

  // On vide et on réaffiche
  gridContainer.innerHTML = "";

  if (filtered.length === 0) {
    gridContainer.innerHTML = "<p>Aucun avion trouvé.</p>";
    return;
  }

  filtered.forEach(aircraft => {
    const card = document.createElement("div");
    card.className = "aircraft-card";
    card.innerHTML = `
      <h3>${aircraft.nom}</h3>
      <p>Catégorie : ${aircraft.category}</p>
      <p>Constructeur : ${aircraft.manufacturer || "N/A"}</p>
    `;
    gridContainer.appendChild(card);
  });
}

// 3. Modifie la fonction setSubFilter pour qu'elle relance l'affichage à chaque changement
function setSubFilter(type, value) {
  currentFilters[type] = value;
  renderAircraftGrid();
}