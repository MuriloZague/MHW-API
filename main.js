import { getAllMonstersNames, getMonsterById } from "./api.js";
import { createElement, translateText } from "./utils.js";

const searchInput = document.getElementById("monster-search");
const suggestionsList = document.getElementById("suggestions");
const status = document.getElementById("status");
const details = document.getElementById("monster-details");
const loading = document.querySelector("#monster-details #loading");

let allMonsters = [];

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

async function init() {
  try {
    status.textContent = "Carregando...";
    const { fromCache, data } = await getAllMonstersNames();
    allMonsters = data; //Salva em um array

    status.textContent = fromCache
      ? "Dados carregados do cache."
      : "Dados carregados da API.";
    status.className = fromCache ? "cache-warning" : "";
  } catch (err) {
    status.textContent = "Erro: " + err.message;
  }
}

//Debounce
const buscarDebounce = debounce(() => {
  const query = searchInput.value.toLowerCase().trim();
  suggestionsList.innerHTML = "";

  if (!query) return;

  const filtered = allMonsters.filter((monster) =>
    monster.name.toLowerCase().includes(query)
  );

  //Exibição dos resultados da busca
  filtered.slice(0, 8).forEach((monster) => {
    const item = document.createElement("li");
    item.textContent = monster.name;
    item.style.cursor = "pointer";
    item.style.background = "#3e2e1f";
    item.style.color = "#fffbe0";
    item.style.padding = "5px";
    item.style.border = "1px solid #d6a84f";
    item.style.marginTop = "2px";
    item.style.borderRadius = "4px";

    //Ao clicar em um resultado:
    item.addEventListener("click", async () => {
      searchInput.value = monster.name; //Busca o monstro com o nome escolhido
      suggestionsList.innerHTML = ""; //Limpa as sugestões de pesquisa
      status.textContent = "Carregando detalhes...";
      try {
        const data = await getMonsterById(monster.id);
        renderMonsterDetails(data);
        status.textContent = "";
      } catch (err) {
        status.textContent = "Erro: " + err.message;
      }
    });

    suggestionsList.appendChild(item);
  });
});

searchInput.addEventListener("input", buscarDebounce); //Sempre que o campo de busca mudar ele usa a função debounce

//Mostra todos os detalhes
async function renderMonsterDetails(monster) {
  details.style.display = "block";
  details.innerHTML = "";
  details.appendChild(loading);
  loading.style.display = "block";

  try {
    //Tradução dos textos com a api do google
    const [
      typeLabel,
      speciesLabel,
      elementsLabel,
      noneText,
      ailmentsLabel,
      weaknessesLabel,
      noWeaknessesText,
      locationsLabel,
      resistancesLabel,
      rewardsLabel,
      translatedDescription,
    ] = await Promise.all([
      translateText("Tamanho:"),
      translateText("Espécie:"),
      translateText("Elementos:"),
      translateText("Nenhum"),
      translateText("Ailments:"),
      translateText("Fraquezas:"),
      translateText("Nenhuma fraqueza conhecida"),
      translateText("Localizações:"),
      translateText("Resistências:"),
      translateText("Recompensas:"),
      translateText(monster.description || "Sem descrição disponível"),
    ]);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    //Cria os elementos principais do monstro
    const title = createElement("h2", {}, [monster.name]);
    const descEl = createElement("p", {}, [translatedDescription]);
    const type = createElement("p", {}, [
      `${typeLabel} ${monster.type || "N/A"}`,
    ]);
    const species = createElement("p", {}, [
      `${speciesLabel} ${monster.species || "N/A"}`,
    ]);

    //Elementos
    const elements = createElement("p", {}, [
      `${elementsLabel} ${
        monster.elements.length ? monster.elements.join(", ") : noneText
      }`,
    ]);

    //Doenças
    const ailments = createElement("p", {}, [
      `${ailmentsLabel} ${
        monster.ailments.length
          ? monster.ailments.map((a) => a.name).join(", ")
          : noneText
      }`,
    ]);

    //Localizações
    const locationsSection = createElement("div", {}, [
      createElement("h3", {}, [locationsLabel]),
    ]);

    if (monster.locations && monster.locations.length) {
      const locationItems = monster.locations.map((loc) =>
        createElement("li", {}, [`${loc.name} (${loc.zoneCount} zonas)`])
      );
      locationsSection.appendChild(createElement("ul", {}, locationItems));
    } else {
      locationsSection.appendChild(createElement("p", {}, [noneText]));
    }

    //Fraquezas
    const weaknessesSection = createElement("div", {}, [
      createElement("h3", {}, [weaknessesLabel]),
    ]);

    if (monster.weaknesses.length) {
      const listItems = await Promise.all(
        monster.weaknesses.map(async (w) => {
          const translatedElement = await translateText(w.element);
          const stars = "★".repeat(w.stars);
          return createElement("li", {}, [`${translatedElement} - ${stars}`]);
        })
      );
      weaknessesSection.appendChild(createElement("ul", {}, listItems));
    } else {
      weaknessesSection.appendChild(createElement("p", {}, [noWeaknessesText]));
    }

    //Resistências
    const resistancesSection = createElement("div", {}, [
      createElement("h3", {}, [resistancesLabel]),
    ]);

    if (monster.resistances && monster.resistances.length) {
      const resistanceItems = monster.resistances.map((res) =>
        createElement("li", {}, [`${res.element}`])
      );
      resistancesSection.appendChild(createElement("ul", {}, resistanceItems));
    } else {
      resistancesSection.appendChild(createElement("p", {}, [noneText]));
    }

    //Recompensas
    const rewardsSection = createElement("div", {}, [
      createElement("h3", {}, [rewardsLabel]),
    ]);

    if (monster.rewards && monster.rewards.length) {
      const rewardGroups = {};
      //Agrupa recompensas por item
      monster.rewards.forEach((reward) => {
        if (!rewardGroups[reward.item.name]) {
          rewardGroups[reward.item.name] = {
            item: reward.item,
            conditions: [],
          };
        }
        rewardGroups[reward.item.name].conditions.push(...reward.conditions);
      });

      //Cria itens de recompensa
      const rewardItems = await Promise.all(
        Object.values(rewardGroups).map(async (group) => {
          return createElement(
            "div",
            { style: "margin-bottom: 15px; border-bottom: 1px solid #bfa76f;" },
            [
              createElement("h4", {}, [
                await translateText(group.item.name),
                ` (${group.item.rarity}★)`,
              ]),
              createElement("p", {}, [
                await translateText(group.item.description),
              ]),
            ]
          );
        })
      );

      rewardsSection.append(...rewardItems);
    } else {
      rewardsSection.appendChild(createElement("p", {}, [noneText]));
    }
    //Adiciona todas as seções ao container principal (detalhes)
    details.append(
      title,
      descEl,
      type,
      species,
      elements,
      ailments,
      locationsSection,
      weaknessesSection,
      resistancesSection,
      rewardsSection
    );

    loading.style.display = "none"; //Desativa o gif de loading
  } catch (err) {
    loading.style.display = "none"; //Desativa o gif de loading
    details.appendChild(
      createElement("p", {}, ["Erro ao carregar os dados: " + err.message])
    );
  }
}
init();