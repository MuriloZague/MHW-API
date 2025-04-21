const BASE_URL = "https://mhw-db.com";
const MONSTERS_CACHE_KEY = "mhw-monsters-names";
const CACHE_TIME = 5 * 60 * 1000; // 5 minutos

export async function getAllMonstersNames() {
  const cache = localStorage.getItem(MONSTERS_CACHE_KEY);
  if (cache) {
    const { timestamp, data } = JSON.parse(cache);
    if (Date.now() - timestamp < CACHE_TIME) {
      return { fromCache: true, data };
    }
  }

  const res = await fetch(`${BASE_URL}/monsters`);
  if (!res.ok) {
    alert("Erro ao buscar monstros");
  }

  const allMonsters = await res.json();
  const onlyNames = allMonsters.map((monster) => ({
    id: monster.id,
    name: monster.name,
  }));

  localStorage.setItem(
    MONSTERS_CACHE_KEY,
    JSON.stringify({
      timestamp: Date.now(),
      data: onlyNames,
    })
  );

  return { fromCache: false, data: onlyNames };
}

export async function getMonsterById(id) {
  try {
    const res = await fetch(`${BASE_URL}/monsters/${id}`);
    if (!res.ok) throw new Error("Erro ao buscar detalhes do monstro");
    return await res.json();
  } catch (err) {
    throw new Error("Erro ao buscar detalhes: " + err.message);
  }
}