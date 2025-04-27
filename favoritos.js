const statusEl = document.getElementById("status");
const detalhesEl = document.getElementById("monster-details");

//Criação dos botões de paginação
const paginacao = document.createElement("div");
const voltarBtn = document.createElement("button");
const avancarBtn = document.createElement("button");

voltarBtn.textContent = "Anterior";
avancarBtn.textContent = "Próxima";

paginacao.appendChild(voltarBtn);
paginacao.appendChild(avancarBtn);
document.body.appendChild(paginacao); // coloca no final da página (pode mudar depois)

let currentPage = 1;
const itemsPagina = 5;  

const obterFavoritos = () => {
  return JSON.parse(localStorage.getItem("favoritos")) || [];
};

const renderizarFavoritos = () => {
  const favoritos = obterFavoritos();

  if (favoritos.length === 0) {
    statusEl.textContent = "Você ainda não favoritou nenhum monstro.";
    detalhesEl.style.display = "none";
    paginacao.style.display = "none"; //Esconder botões se não tiver favoritos
    return;
  }

  statusEl.textContent = `Você tem ${favoritos.length} monstro(s) favorito(s):`;
  detalhesEl.innerHTML = "";
  detalhesEl.style.display = "block";

  const startIndex = (currentPage - 1) * itemsPagina;
  const endIndex = startIndex + itemsPagina;
  const favoritosPaginados = favoritos.slice(startIndex, endIndex);

  favoritosPaginados.forEach(monstro => {
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

  //Atualiza estado dos botões
  voltarBtn.disabled = currentPage === 1;
  avancarBtn.disabled = endIndex >= favoritos.length;
};

voltarBtn.addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderizarFavoritos();
  }
});

avancarBtn.addEventListener("click", () => {
  const favoritos = obterFavoritos();
  const totalPages = Math.ceil(favoritos.length / itemsPagina);
  if (currentPage < totalPages) {
    currentPage++;
    renderizarFavoritos();
  }
});

renderizarFavoritos();