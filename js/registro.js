//ENUNCIAT: 
/*Este script gestiona el registro de nuevos usuarios, incluyendo la validación de datos y el autocompletado de campos.
    Permite al usuario seleccionar una ciudad y autocompletar el código postal, así como autocompletar el dominio del correo electrónico.*/
/* Añadir las funciones que consideréis necesarias*/


//EXERCICI: 

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

function isNonEmpty(text) {
  return typeof text === "string" && text.trim().length > 0;
}

function isValidEmail(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

function passwordOk(pass) {
  return typeof pass === "string" && pass.trim().length >= 4;
}

function userExistsByUsername(username) {
  const users = loadFromStorage("users", []);
  return users.some(u => (u.username || "").toLowerCase() === username.toLowerCase());
}

function userExistsByEmail(email) {
  const users = loadFromStorage("users", []);
  return users.some(u => (u.email || "").toLowerCase() === email.toLowerCase());
}

// Autocompletar ciutat (amb codi postal)
function setupCitySelect() {
  const citySelect = document.getElementById("city");
  const postalInput = document.getElementById("postalCode");
  if (!citySelect || !postalInput) return;

  // S'omple el select amb l'array "cities"
  citySelect.innerHTML = `<option value="">Seleccione una población</option>`;
  cities.forEach(c => {
    const opt = document.createElement("option");
    opt.value = c.name;
    opt.textContent = c.name;
    citySelect.appendChild(opt);
  });

  citySelect.addEventListener("change", () => {
    const found = cities.find(c => c.name === citySelect.value);
    postalInput.value = found ? found.postalCode : "";
  });
}

// Guarda l'usuari quan cliquem "save"
function handleSaveClick() {
  const name = (document.getElementById("name")?.value || "").trim();
  const surname = (document.getElementById("surname")?.value || "").trim();
  const address = (document.getElementById("address")?.value || "").trim();
  const city = (document.getElementById("city")?.value || "").trim();
  const postalCode = (document.getElementById("postalCode")?.value || "").trim();
  const email = (document.getElementById("email")?.value || "").trim();
  const username = (document.getElementById("username")?.value || "").trim();
  const password = (document.getElementById("password")?.value || "").trim();

  if (!isNonEmpty(name) || !isNonEmpty(surname) || !isNonEmpty(address)) {
    alert("Omple nom, cognoms i direcció.");
    return;
  }

  if (!isNonEmpty(city) || !isNonEmpty(postalCode)) {
    alert("Selecciona una població (això omple el codi postal).");
    return;
  }

  if (!isValidEmail(email)) {
    alert("Email no vàlid.");
    return;
  }

  if (!isNonEmpty(username)) {
    alert("Usuari (username) és obligatori.");
    return;
  }

  if (!passwordOk(password)) {
    alert("La contrasenya ha de tenir mínim 4 caràcters.");
    return;
  }

  if (userExistsByUsername(username)) {
    alert("Aquest nom d'usuari ja existeix.");
    return;
  }

  if (userExistsByEmail(email)) {
    alert("Aquest email ja està registrat.");
    return;
  }

  const newUser = {
    name,
    surname,
    address,
    city,
    postalCode,
    email,
    username,
    password, // CAT: en real s'hauria d'encriptar
    lists: {
      myTeam: [],
      wishes: []
    }
  };

  const users = loadFromStorage("users", []);
  users.push(newUser);
  saveToStorage("users", users);

  alert("Usuari registrat! Ara pots fer login.");
  window.location.href = "index.html";
}

// Tornar a login
function handleBackToLogin() {
  window.location.href = "index.html";
}

function initRegisterPage() {
  // Si ja hi ha sessió, el podem enviar a la llista
  const currentUser = loadFromStorage("currentUser", null);
  if (currentUser) {
    window.location.href = "indice.html";
    return;
  }

  setupCitySelect();
  setupEmailAutocomplete();

  const saveBtn = document.getElementById("save");
  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleSaveClick();
    });
  }

  const loginBtn = document.getElementById("loginButton");
  if (loginBtn) {
    loginBtn.addEventListener("click", (e) => {
      e.preventDefault();
      handleBackToLogin();
    });
  }
}

document.addEventListener("DOMContentLoaded", initRegisterPage);
