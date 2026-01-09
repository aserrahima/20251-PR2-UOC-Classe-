//S'ha escrit el codi sobre el exemple/enunciat de la classe
/*Este script permite cargar la información desde la API cuando sea necesario y crear el objeto en el localstorage.*/
/*Tened en cuenta que también debe de gestionar la paginación y los filtros.*/
// Carrega pokémons de l'API, guarda a LocalStorage, i pinta a indice.html
/* IDs (indice.html):
- loader
- typeList (ul)
- searchInput, searchButton
- weightMin, weightMax
- orden (select)
- resultados (contenidor)
- loadMore (botó)
*/

let allPokemons = [];
let filteredPokemons = [];
let currentIndex = 0;

// Mostrem 12 per "pàgina" (Cargar más)
const pageSize = 12;
const totalPokemons = 151;

let currentURL = `${config.apiBaseUrl}${totalPokemons}`;
let user;

function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error("Error llegint LocalStorage:", e);
    return defaultValue;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Error guardant a LocalStorage:", e);
  }
}

function getCurrentUser() {
  return loadFromStorage("currentUser", null);
}

function ensureUserLists(u) {
  if (!u) return null;
  if (!u.lists) u.lists = {};
  if (!Array.isArray(u.lists.myTeam)) u.lists.myTeam = [];
  if (!Array.isArray(u.lists.wishes)) u.lists.wishes = [];
  return u;
}

// Loader (ja el tenim a l'HTML) 
function mostrarLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "block";
  document.body.classList.add("loading");
}

function ocultarLoader() {
  const loader = document.getElementById("loader");
  if (loader) loader.style.display = "none";
  document.body.classList.remove("loading");
}

async function getPokemonDescription(speciesUrl) {
  try {
    const response = await fetch(speciesUrl);
    if (response.ok) {
      const speciesData = await response.json();
      const spanishEntry = speciesData.flavor_text_entries.find(
        entry => entry.language.name === "es"
      );

      return spanishEntry
        ? spanishEntry.flavor_text.replace(/\n/g, " ").replace(/\f/g, " ")
        : "Descripción no disponible en español";
    }
    return "Descripción no disponible";
  } catch (error) {
    console.error("Error crític a getPokemonDescription:", error);
    return "Error al cargar descripción";
  }
}

async function getPokemons(url = currentURL) {
  try {
    mostrarLoader();

    const response = await fetch(url);
    if (!response.ok) throw new Error("Error obtenint la llista");

    const data = await response.json();
    const results = data.results || [];

    // Demanem detalls de cada Pokémon (són unes crides extra)
    const detailed = await Promise.all(
      results.map(async (item) => {
        try {
          const detailRes = await fetch(item.url);
          if (!detailRes.ok) return null;

          const detail = await detailRes.json();
          const description = await getPokemonDescription(detail.species.url);

          return {
            id: detail.id,
            name: detail.name,
            description: description,
            height: detail.height,
            weight: detail.weight,
            baseExperience: detail.base_experience,
            abilities: (detail.abilities || []).map(a => a.ability.name),
            types: (detail.types || []).map(t => t.type.name),
            sprites:
              detail.sprites?.other?.["official-artwork"]?.front_default ||
              detail.sprites?.front_default ||
              "",
            stats: (detail.stats || []).map(s => ({
              name: s.stat.name,
              value: s.base_stat
            }))
          };
        } catch (err) {
          console.error("Error detalls Pokémon:", err);
          return null;
        }
      })
    );

    const successfulPokemons = detailed.filter(Boolean);

    saveToStorage("pokemons", successfulPokemons);

    ocultarLoader();
    return successfulPokemons;
  } catch (error) {
    console.error("Error general obtenint pokémons:", error);
    ocultarLoader();
    throw error;
  }
}

// FEm els filtres i ordenació (segons el HTML que tenim)
let selectedType = null; // tipus seleccionat a la llista

function buildTypeList() {
  const ul = document.getElementById("typeList");
  if (!ul) return;

  ul.innerHTML = "";

  // Botó "Tots"
  const liAll = document.createElement("li");
  const btnAll = document.createElement("button");
  btnAll.type = "button";
  btnAll.textContent = "all";
  btnAll.addEventListener("click", () => {
    selectedType = null;
    applyFilters();
  });
  liAll.appendChild(btnAll);
  ul.appendChild(liAll);

  // Tipus del type_list
  type_list.forEach(t => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.textContent = t.name;

    btn.addEventListener("click", () => {
      // Si cliques el mateix tipus, el des-selecciones
      selectedType = (selectedType === t.id) ? null : t.id;
      applyFilters();
    });

    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// S'aplica cerca + pes + tipus
function applyFilters() {
  const q = (document.getElementById("searchInput")?.value || "").trim().toLowerCase();
  const wMin = Number(document.getElementById("weightMin")?.value || 0);
  const wMaxRaw = document.getElementById("weightMax")?.value;
  const wMax = wMaxRaw === "" || wMaxRaw == null ? Infinity : Number(wMaxRaw);

  filteredPokemons = allPokemons.filter(p => {
    const matchType = selectedType ? (p.types || []).includes(selectedType) : true;

    // Cerca per nom o id (accepta números com "025" també)
    const idStr = String(p.id).padStart(3, "0");
    const matchQuery = q
      ? (p.name || "").toLowerCase().includes(q) || idStr.includes(q) || String(p.id).includes(q)
      : true;

    const matchWeight = (p.weight >= wMin) && (p.weight <= wMax);

    return matchType && matchQuery && matchWeight;
  });

  applySort();
  currentIndex = 0;
  renderPage(true);
}

// Ordenació
function applySort() {
  const orden = document.getElementById("orden")?.value || "idAsc";

  const copy = [...filteredPokemons];

  if (orden === "idAsc") copy.sort((a, b) => a.id - b.id);
  if (orden === "idDesc") copy.sort((a, b) => b.id - a.id);
  if (orden === "nameAsc") copy.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  if (orden === "nameDesc") copy.sort((a, b) => (b.name || "").localeCompare(a.name || ""));

  filteredPokemons = copy;
}

//igual que abans amb tipus de render per a #resultados + "Cargar más"

function createPokemonCard(p) {
  const div = document.createElement("div");
  div.className = "pokedex-card";

  div.innerHTML = `
    <img src="${p.sprites}" alt="${p.name}" style="width:160px;">
    <h4>#${String(p.id).padStart(3, "0")} - ${p.name}</h4>
    <p><b>Tipus:</b> ${(p.types || []).join(", ")}</p>
    <p><b>Pes:</b> ${p.weight}</p>
    <a href="detail.html?id=${p.id}">Veure detall</a>
  `;

  return div;
}

function renderPage(reset) {
  const container = document.getElementById("resultados");
  const btnMore = document.getElementById("loadMore");
  if (!container) return;

  if (reset) container.innerHTML = "";

  const slice = filteredPokemons.slice(currentIndex, currentIndex + pageSize);
  slice.forEach(p => container.appendChild(createPokemonCard(p)));

  currentIndex += slice.length;

  // CAT: amaguem el botó si ja no queden més
  if (btnMore) {
    btnMore.style.display = currentIndex >= filteredPokemons.length ? "none" : "block";
  }
}

function setupEvents() {
  const searchBtn = document.getElementById("searchButton");
  if (searchBtn) searchBtn.addEventListener("click", applyFilters);

  const ordenSel = document.getElementById("orden");
  if (ordenSel) ordenSel.addEventListener("change", () => {
    applySort();
    currentIndex = 0;
    renderPage(true);
  });

  const btnMore = document.getElementById("loadMore");
  if (btnMore) btnMore.addEventListener("click", () => renderPage(false));
}

async function initPokemonsPage() {
  user = ensureUserLists(getCurrentUser());
  if (!user) {
    alert("Has d'iniciar sessió.");
    window.location.href = "index.html";
    return;
  }

  // Carreguem de localStorage si ja existeix, si no fem fetch
  const stored = loadFromStorage("pokemons", []);
  if (stored.length > 0) {
    allPokemons = stored;
  } else {
    allPokemons = await getPokemons();
  }

  filteredPokemons = [...allPokemons];
  currentIndex = 0;

  buildTypeList();
  setupEvents();
  applyFilters(); // fa render inicial

  if (typeof updateMenu === "function") updateMenu();
}

document.addEventListener("DOMContentLoaded", () => {
  initPokemonsPage().catch(err => console.error(err));
});
