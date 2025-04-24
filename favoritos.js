const statusEl = document.getElementById("status");
const detalhesEl = document.getElementById("monster-details");

const obterFavoritos = () => {
  return JSON.parse(localStorage.getItem("favoritos")) || [];
};

const renderizarFavoritos = () => {
  const favoritos = obterFavoritos();

  if (favoritos.length === 0) {
    statusEl.textContent = "Você ainda não favoritou nenhum monstro.";
    detalhesEl.style.display = "none";
    return;
  }

  statusEl.textContent = `Você tem ${favoritos.length} monstro(s) favorito(s):`;
  detalhesEl.innerHTML = "";
  detalhesEl.style.display = "block";

  favoritos.forEach(monstro => {
    const card = document.createElement("div");
    card.style.padding = "10px";
    card.style.marginBottom = "30px";

    const nome = document.createElement("h2");
    nome.textContent = monstro.name;

    const tipo = document.createElement("p");
    tipo.textContent = `Tamanho: ${monstro.type}`;

    const especie = document.createElement("p");
    especie.textContent = `Espécie: ${monstro.species}`;

    const elementos = document.createElement("p");
    elementos.textContent = `Elementos: ${monstro.elements.join(", ") || "Nenhum"}`;

    const descricao = document.createElement("p");
    descricao.textContent = monstro.description;

    card.append(nome, tipo, especie, elementos, descricao);
    detalhesEl.appendChild(card);
  });
};

renderizarFavoritos();