import { getAllMonstersNames, getMonsterById } from "./api.js";
import { createElement, translateText } from "./utils.js";

const select = document.querySelector("select");
const status = document.getElementById("status");
const details = document.getElementById("monster-details");
const loading = document.querySelector("#monster-details #loading");

async function init() {
  try {
    status.textContent = "Carregando...";

    const { fromCache, data } = await getAllMonstersNames();

    data.forEach((monster) => {
      const option = createElement("option", { value: monster.id }, [
        monster.name,
      ]);
      select.appendChild(option);
    });

    status.textContent = fromCache
      ? "Dados carregados do cache."
      : "Dados carregados da API.";
    status.className = fromCache ? "cache-warning" : "";
  } catch (err) {
    status.textContent = "Erro: " + err.message;
  }
}

select.addEventListener("change", async (e) => {
  const id = e.target.value;
  if (!id) return;

  status.textContent = "Carregando detalhes...";

  try {
    const monster = await getMonsterById(id);
    renderMonsterDetails(monster);
    status.textContent = "";
  } catch (err) {
    status.textContent = "Erro: " + err.message;
  }
});

async function renderMonsterDetails(monster) {
  details.style.display = "block";
  details.innerHTML = "";
  details.appendChild(loading);
  loading.style.display = "block";

  try {
    // Tradução dos textos
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

    // Cria os elementos principais do monstro
    const title = createElement("h2", {}, [monster.name]);
    const descEl = createElement("p", {}, [translatedDescription]);
    const type = createElement("p", {}, [
      `${typeLabel} ${monster.type || "N/A"}`,
    ]);
    const species = createElement("p", {}, [
      `${speciesLabel} ${monster.species || "N/A"}`,
    ]);

    // Elementos
    const elements = createElement("p", {}, [
      `${elementsLabel} ${
        monster.elements.length ? monster.elements.join(", ") : noneText
      }`,
    ]);

    // Doenças
    const ailments = createElement("p", {}, [
      `${ailmentsLabel} ${
        monster.ailments.length
          ? monster.ailments.map((a) => a.name).join(", ")
          : noneText
      }`,
    ]);

    // Localizações
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

    // Fraquezas
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

    // Resistências
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

    // Recompensas
    const rewardsSection = createElement("div", {}, [
      createElement("h3", {}, [rewardsLabel]),
    ]);

    if (monster.rewards && monster.rewards.length) {
      const rewardGroups = {};

      // Agrupa recompensas por item
      monster.rewards.forEach((reward) => {
        if (!rewardGroups[reward.item.name]) {
          rewardGroups[reward.item.name] = {
            item: reward.item,
            conditions: [],
          };
        }
        rewardGroups[reward.item.name].conditions.push(...reward.conditions);
      });

      // Cria itens de recompensa
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

    // Adiciona todas as seções ao container principal
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

    loading.style.display = "none";
  } catch (err) {
    loading.style.display = "none";
    details.appendChild(
      createElement("p", {}, ["Erro ao carregar os dados: " + err.message])
    );
  }
}

init();