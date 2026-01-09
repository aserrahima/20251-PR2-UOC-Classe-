//ENUNCIAT
/* Este script gestiona la visualización de las listas de Pokemons del usuario.
    Permite al usuario ver sus equipo de Pokemons y su lista de deseos.
    Debe de permitir eliminar los Pokemon de las listaslas de la lista. */
 
/* Añadir las funciones que consideréis necesarias*/

// Obtener la lista correspondiente del usuario
//function displayPokeList(listType,user) {
    //...    
}

//EXERCICI: Gestiona la visualització de les llistes de pokemons de l'usuari. Permet veure els seus equips de pokemons i llistes de desitjos. Ha de permetre eliminar els Pokemons de les llsites.
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

function ensureUserLists(user) {
  if (!user) return null;
  if (!user.lists) user.lists = {};
  if (!Array.isArray(user.lists.myTeam)) user.lists.myTeam = [];
  if (!Array.isArray(user.lists.wishes)) user.lists.wishes = [];
  return user;
}

function getPokemonsStore() {
  return loadFromStorage("pokemons", []);
}

function removePokemonFromList(listType, pokemonId) {
  const user = ensureUserLists(getCurrentUser());
  if (!user) {
    alert("No hi ha cap sessió iniciada.");
    window.location.href = "index.html";
    return;
  }

  const idNum = Number(pokemonId);
  const list = user.lists[listType];

  const idx = list.indexOf(idNum);
  if (idx !== -1) {
    list.splice(idx, 1);
    saveToStorage("currentUser", user);
  }
}

// Obtener la lista correspondiente del usuario
function displayPokeList(listType,user) {

  // ListType pot ser "myTeam" o "wishes"
  const container = document.getElementById("listContainer");
  const title = document.getElementById("listTitle");

  if (!container) return;

  const safeUser = ensureUserLists(user);
  const ids = safeUser && safeUser.lists[listType] ? safeUser.lists[listType] : [];

  if (title) {
    title.textContent = listType === "myTeam" ? "Mi Equipo" : "Deseos";
  }

  const allPokemons = getPokemonsStore();
  const pokemonsToShow = ids
    .map(id => allPokemons.find(p => Number(p.id) === Number(id)))
    .filter(Boolean);

  // Pintamos HTML simple
  container.innerHTML = "";

  if (pokemonsToShow.length === 0) {
    container.innerHTML = "<p>No hi ha pokémons en aquesta llista.</p>";
    return;
  }

  pokemonsToShow.forEach(p => {
    const card = document.createElement("div");
    card.className = "pokemon-card";

    card.innerHTML = `
      <img src="${p.sprites}" alt="${p.name}" style="width:120px;">
      <h4>${p.name}</h4>
      <p><b>Tipus:</b> ${(p.types || []).join(", ")}</p>
      <button data-id="${p.id}" class="btnRemove">Eliminar</button>
      <a href="detail.html?id=${p.id}">Veure detall</a>
    `;

    container.appendChild(card);
  });

  // Events eliminar
  const removeButtons = container.querySelectorAll(".btnRemove");
  removeButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-id");
      removePokemonFromList(listType, id);
      // Re-render
      const updatedUser = getCurrentUser();
      displayPokeList(listType, updatedUser);
      // Si tens menu.js carregat
      if (typeof updateMenu === "function") updateMenu();
    });
  });
}

function initListasPage() {
  const user = getCurrentUser();
  if (!user) {
    alert("Has d'iniciar sessió.");
    window.location.href = "index.html";
    return;
  }

  // Triem la llista segons un parametre de URL o per defecte myTeam
  const params = new URLSearchParams(window.location.search);
  const listType = params.get("list") || "myTeam";

  displayPokeList(listType, user);

  // Botons per canviar de llista
  const btnTeam = document.getElementById("btnShowMyTeam");
  const btnWish = document.getElementById("btnShowWishes");

  if (btnTeam) btnTeam.addEventListener("click", () => displayPokeList("myTeam", getCurrentUser()));
  if (btnWish) btnWish.addEventListener("click", () => displayPokeList("wishes", getCurrentUser()));

  if (typeof updateMenu === "function") updateMenu();
}

document.addEventListener("DOMContentLoaded", initListasPage);

