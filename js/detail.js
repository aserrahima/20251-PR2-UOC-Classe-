//"ENUNCIAT": 
/*Este script carga la información del Pokemon seleccionado y la muestra en la página de detalles.*/
/* Añadir las funciones que consideréis necesarias*/


//Exercici: Carregar la info del Pokemon seleccionat i mostrar-la en la pàgina de detalls

//funcions afegides:
// Si no existeix la clau, retornem un valor per defecte. Llegeix del LocalStorage.
function loadFromStorage(key, defaultValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (e) {
    console.error("Error llegint LocalStorage:", e);
    return defaultValue;
  }
}

// Agafar paràmetres de la URL
function getQueryParam(paramName) {
  const params = new URLSearchParams(window.location.search);
  return params.get(paramName);
}

// Trobar el Pokémon per id dins els pokémons guardats
function getPokemonById(id) {
  const pokemons = loadFromStorage("pokemons", []);
  return pokemons.find(p => Number(p.id) === Number(id)) || null;
}

//Tipus "render" per pintar a la pantalla
// Posem les dades del Pokémon dins del HTML. 

IMPORTANT: aquests IDs han d'existir al teu detail.html
*/
function renderPokemonDetail(pokemon) {
  document.getElementById("pokemonName").textContent = pokemon.name;
  document.getElementById("pokemonImage").src = pokemon.sprites;
  document.getElementById("pokemonImage").alt = pokemon.name;

  document.getElementById("pokemonDescription").textContent = pokemon.description || "Sense descripció";
  document.getElementById("pokemonTypes").textContent = (pokemon.types || []).join(", ");
}

// Inici de la pàgina
function initDetailPage() {
  const id = getQueryParam("id");
  if (!id) {
    console.error("Falta el paràmetre id a la URL.");
    return;
  }

  const pokemon = getPokemonById(id);
  if (!pokemon) {
    console.error("No s'ha trobat el Pokémon amb id:", id);
    return;
  }

  renderPokemonDetail(pokemon);
}

document.addEventListener("DOMContentLoaded", initDetailPage);
