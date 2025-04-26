import { getAllMonstersNames, getMonsterById, translateText } from "./api.js";
import { createElement } from "./utils.js";

const caixaPesquisa = document.getElementById("monster-search");
const listaSujestao = document.getElementById("suggestions");
const status = document.getElementById("status");
const detalhes = document.getElementById("monster-details");
const loading = document.querySelector("#monster-details #loading");

let nomeMonstros = [];
let monstroAtual = null;

async function init() {
  try {
    status.textContent = "Carregando...";
    const { fromCache, data } = await getAllMonstersNames(); //Pega o nome de todos os monstros
    nomeMonstros = data; //Salva em um array

    status.textContent = fromCache ? "Dados carregados do cache." : "Dados carregados da API.";
    status.className = fromCache ? "cache-warning" : "";
  } catch (e) {
    status.textContent = "Erro: " + e;
  }
}

//Função para salvar favoritos no localStorage
const salvarFavoritos = (favoritos) => {
  localStorage.setItem("favoritos", JSON.stringify(favoritos));
}

//Função para obter favoritos no localStorage
const obterFavoritos = () => {
  return JSON.parse(localStorage.getItem("favoritos")) || [];
}

//Alterna entre adicionar e remover o monstro dos favoritos
async function alternarFavorito(monstro) {
  const favoritos = obterFavoritos();
  const index = favoritos.findIndex(fav => fav.id === monstro.id); //Retorna -1 se o item não estiver na lista

  if (index === -1) {
    const traduzido = {
      id: monstro.id,
      name: await translateText(monstro.name),
      type: await translateText(monstro.type || "Nenhum"),
      species: await translateText(monstro.species || "Nenhuma"),
      elements: await Promise.all(monstro.elements.map(el => translateText(el || "Nenhum"))),
      description: await translateText(monstro.description || "Sem descrição disponível"),
    };
    favoritos.push(traduzido);
  } else {
    favoritos.splice(index, 1);
  }

  salvarFavoritos(favoritos); //Atualiza o array de favoritos
  renderizarMonstro(monstroAtual);
};

const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
  clearTimeout(timer);
  timer = setTimeout(() => fn(...args), delay);
  };
}

//Debounce
const buscarDebounce = debounce(() => {
  listaSujestao.innerHTML = "";
  const pesquisa = caixaPesquisa.value.toLowerCase().trim(); //Pegar os dados da caixa de pesquisa

  if (!pesquisa){
    return;
  }

  const filtro = nomeMonstros.filter((monster) => monster.name.toLowerCase().includes(pesquisa));
  //Exibição dos resultados da busca
  listarMonstros(filtro)
}, 500);

const listarMonstros = (value) => {
  value.slice(0, 8).forEach((monster) => {
    const item = document.createElement("li");
    item.textContent = monster.name;
    item.style.cursor = "pointer";
    item.style.background = "#3e2e1f";
    item.style.color = "#fffbe0";
    item.style.padding = "5px";
    item.style.paddingInline = "50px";
    item.style.border = "1px solid #d6a84f";
    item.style.marginTop = "10px";
    item.style.borderRadius = "4px";
    item.style.textAlign = 'center';

    listaSujestao.appendChild(item);

    //Ao clicar em um resultado:
    item.addEventListener("click", async () => {
      listaSujestao.innerHTML = ""; //Limpa as sugestões de pesquisa
      status.textContent = "Carregando detalhes...";
      try {
        const data = await getMonsterById(monster.id);
        renderizarMonstro(data);
        status.textContent = "";
      } catch (e) {
        status.textContent = "Erro: " + e;
      }
    });
  });
}

caixaPesquisa.addEventListener("keyup", (e) => {buscarDebounce(e.target.value)}); //Sempre que o campo de busca mudar ele usa a função debounce

//Mostra todos os detalhes
async function renderizarMonstro(monster) {

  detalhes.style.display = "block";
  detalhes.innerHTML = "";
  detalhes.appendChild(loading);
  loading.style.display = "block";

  try {
    //Tradução dos textos com a api do google
    const [
      tipo,
      especie,
      elementos,
      semTexto,
      doencas,
      fraquezas,
      semFraquezas,
      localizacao,
      resistencias,
      recompensas,
      descricao,
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

    await new Promise((resolve) => setTimeout(resolve, 2000)); //Delay proposital de 2 segundos

    //Cria os elementos principais do monstro
    const title = createElement("h2", {}, [monster.name]);
    monstroAtual = monster; //Salva o monstro atual para referência

    // Botão de favorito
    const favoritos = obterFavoritos();
    const botaoFav = createElement("button", {style: "margin-left: 10px; cursor: pointer; font-size: 24px; background: none; border: none;",});

    //Img favoritar
    const estrelaImg = document.createElement("img");
    estrelaImg.src = favoritos.some(fav => fav.id === monster.id) ? "./src/estrela-completa.png" : "./src/estrela-vazia.png"; //Verficar favorito
    estrelaImg.width = 35;
    estrelaImg.height = 35;
    botaoFav.appendChild(estrelaImg)

    botaoFav.addEventListener("click", () => {
      alternarFavorito(monster);
    });

    title.appendChild(botaoFav); // Adiciona o botão ao lado do nome do monstro

    const descEl = createElement("p", {}, [descricao]);
    const type = createElement("p", {}, [
      `${tipo} ${monster.type || "N/A"}`,
    ]);
    const species = createElement("p", {}, [
      `${especie} ${monster.species || "N/A"}`,
    ]);

    //Elementos
    const elements = createElement("p", {}, [
      `${elementos} ${
        monster.elements.length ? monster.elements.join(", ") : semTexto
      }`,
    ]);

    //Doenças
    const ailments = createElement("p", {}, [
      `${doencas} ${
        monster.ailments.length
          ? monster.ailments.map((a) => a.name).join(", ")
          : semTexto
      }`,
    ]);

    //Localizações
    const locationsSection = createElement("div", {}, [
      createElement("h3", {}, [localizacao]),
    ]);

    if (monster.locations && monster.locations.length) {
      const locationItems = monster.locations.map((loc) =>
        createElement("li", {}, [`${loc.name} (${loc.zoneCount} zonas)`])
      );
      locationsSection.appendChild(createElement("ul", {}, locationItems));
    } else {
      locationsSection.appendChild(createElement("p", {}, [semTexto]));
    }

    //Fraquezas
    const weaknessesSection = createElement("div", {}, [
      createElement("h3", {}, [fraquezas]),
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
      weaknessesSection.appendChild(createElement("p", {}, [semFraquezas]));
    }

    //Resistências
    const resistancesSection = createElement("div", {}, [
      createElement("h3", {}, [resistencias]),
    ]);

    if (monster.resistances && monster.resistances.length) {
      const resistanceItems = monster.resistances.map((res) =>
        createElement("li", {}, [`${res.element}`])
      );
      resistancesSection.appendChild(createElement("ul", {}, resistanceItems));
    } else {
      resistancesSection.appendChild(createElement("p", {}, [semTexto]));
    }

    //Recompensas
    const rewardsSection = createElement("div", {}, [
      createElement("h3", {}, [recompensas]),
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
      rewardsSection.appendChild(createElement("p", {}, [semTexto]));
    }
    //Adiciona todas as seções ao container principal (detalhes)
    detalhes.append(
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
    detalhes.appendChild(
      createElement("p", {}, ["Erro ao carregar os dados: " + err.message])
    );
  }
}

init();