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

function updateMenu() {
    //...
  const user = ensureUserLists(getCurrentUser());

  // Aquests IDs han d'existir al teu HTML (si no, simplement no fa res)
  const userEl = document.getElementById("menuUserName");
  const teamCountEl = document.getElementById("menuMyTeamCount");
  const wishesCountEl = document.getElementById("menuWishesCount");

  if (userEl) {
    userEl.textContent = user ? (user.name || user.email || "Usuari") : "No logejat";
  }

  if (teamCountEl) {
    teamCountEl.textContent = user ? user.lists.myTeam.length : "0";
  }

  if (wishesCountEl) {
    wishesCountEl.textContent = user ? user.lists.wishes.length : "0";
  }

  // Nota (CAT): si no hi ha usuari, pots amagar parts del menú (opcional)
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.style.display = user ? "inline-block" : "none";
  }
}

// Función para cerrar sesión
function logout() {
    //...
  // Nota (CAT): tanquem sessió eliminant el currentUser
  localStorage.removeItem("currentUser");
  updateMenu();
  // Redirigim a login (canvia el nom si cal)
  window.location.href = "index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  updateMenu();

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  }
});

