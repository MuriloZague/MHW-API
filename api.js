const BASE_URL = "https://mhw-db.com";
const MONSTERS_CACHE_KEY = "mhw-nomes-monstros";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos de duração

export async function getAllMonstersNames() {
  //Verifica se está armazenado no cache, se não buscar novamente
  const cache = localStorage.getItem(MONSTERS_CACHE_KEY);
  if (cache) {
    const { timestamp, data } = JSON.parse(cache);
    if (Date.now() - timestamp < CACHE_TIME) {
      return { fromCache: true, data };
    }
  }

  //Buscar novamente
  const res = await fetch(`${BASE_URL}/monsters`);
  if (!res.ok) {
    alert("Erro ao buscar monstros");
  }

  const monstros = await res.json();
  const apenasNomes = monstros.map((monster) => ({
    id: monster.id,
    name: monster.name,
  }));

  localStorage.setItem(
    MONSTERS_CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: apenasNomes,
    })
  );

  return { fromCache: false, data: apenasNomes };
}

export async function getMonsterById(id) {
  try {
    const res = await fetch(`${BASE_URL}/monsters/${id}`);
    if (!res.ok){
      alert("Erro ao buscar detalhes do monstro");
    }
      return await res.json();
  } catch (e) {
    alert("Erro ao buscar detalhes: " + e);
  }
}

//Google tradutor API
export async function translateText(text, targetLanguage = 'pt-br') {
  const apiKey = ''; //key ocultada
  const url = `https://translation.googleapis.com/language/translate/v2?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      q: text,
      source: 'en',
      target: targetLanguage,
      format: 'text'
    })
  });

  const data = await response.json();

  if (data.error){
    alert(data.error.message);
  }
  
  return data.data.translations[0].translatedText;
}