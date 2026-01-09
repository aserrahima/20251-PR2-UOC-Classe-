//ENUNCIAT: // Función que actualiza el usuario y el número de Pokemons en cada una de las listas
/* Añadir las funciones que consideréis necesarias*/
//function updateMenu() {
    //...
}

// Función para cerrar sesión
//function logout() {
    //...
}


// EXERCICI: Función que actualiza el usuario y el número de Pokemons en cada una de las listas

function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error("Error llegint LocalStorage:", e);
    return defaultValue;
  }
}

function getCurrentUser() {
  return loadFromStorage("currentUser", null);
}

// Assegurem que existeixin les llistes (per tal d'evitar undefined)
function ensureUserLists(user) {
  if (!user) return null;
  if (!user.lists) user.lists = {};
  if (!Array.isArray(user.lists.myTeam)) user.lists.myTeam = [];
  if (!Array.isArray(user.lists.wishes)) user.lists.wishes = [];
  return user;
}

function updateMenu() {
  const user = ensureUserLists(getCurrentUser());

  // IDs del HTML empleats
  const userEl = document.getElementById("menuButton");
  const teamCountEl = document.getElementById("myTeamCount");
  const wishesCountEl = document.getElementById("wishesCount");

  // Mostrem el nom d'usuari al botó del menú
  if (userEl) {
    userEl.textContent = user ? (user.username || user.name || "Usuario") : "Usuario";
  }

  // Comptadors
  if (teamCountEl) teamCountEl.textContent = user ? user.lists.myTeam.length : "0";
  if (wishesCountEl) wishesCountEl.textContent = user ? user.lists.wishes.length : "0";
}

// Funció per tancar sessió
function logout() {
  // Nota (CAT): eliminem l'usuari actual
  localStorage.removeItem("currentUser");
  updateMenu();
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  updateMenu();

  // Botó logout (real a partir del html que tenim)
  const logoutBtn = document.getElementById("logoutButton");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});
