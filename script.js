// Estrutura de dados no LocalStorage
let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];

// Função para trocar de menu
function abrirSecao(secaoId) {
  document.querySelectorAll("section").forEach(sec => sec.classList.add("hidden"));
  document.getElementById(secaoId).classList.remove("hidden");
  atualizarListas();
}

// --------------------- SOLICITANTE ---------------------
document.getElementById("formSolicitacao").addEventListener("submit", (e) => {
  e.preventDefault();

  const novaSolicitacao = {
    id: Date.now(),
    nome: document.getElementById("nome").value,
    inicio: document.getElementById("dataInicio").value,
    fim: document.getElementById("dataFim").value,
    status: "Pendente do Gestor",
    motivo: ""
  };

  solicitacoes.push(novaSolicitacao);
  localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));

  e.target.reset();
  atualizarListas();
});

// --------------------- GESTOR ---------------------
function aprovarGestor(id) {
  const s = solicitacoes.find(sol => sol.id === id);
  s.status = "Aprovado pelo Gestor - Pendente do RH";
  localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
  atualizarListas();
}

function rejeitarGestor(id) {
  const motivo = prompt("Motivo da recusa:");
  const s = solicitacoes.find(sol => sol.id === id);
  s.status = "Rejeitado pelo Gestor";
  s.motivo = motivo || "Não informado";
  localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
  atualizarListas();
}

// --------------------- RH ---------------------
function confirmarRH(id) {
  const s = solicitacoes.find(sol => sol.id === id);
  s.status = "Confirmado pelo RH ✅";
  localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
  atualizarListas();
}

// --------------------- ATUALIZAÇÃO DAS LISTAS ---------------------
function atualizarListas() {
  // Lista do solicitante
  const statusUl = document.getElementById("statusSolicitacoes");
  statusUl.innerHTML = "";
  solicitacoes.forEach(sol => {
    const li = document.createElement("li");
    li.textContent = `${sol.nome} | ${sol.inicio} - ${sol.fim} | Status: ${sol.status}` + 
                     (sol.motivo ? ` | Motivo: ${sol.motivo}` : "");
    statusUl.appendChild(li);
  });

  // Lista do gestor
  const gestorUl = document.getElementById("listaGestor");
  gestorUl.innerHTML = "";
  solicitacoes.filter(sol => sol.status === "Pendente do Gestor")
    .forEach(sol => {
      const li = document.createElement("li");
      li.innerHTML = `${sol.nome} (${sol.inicio} a ${sol.fim}) 
        <button onclick="aprovarGestor(${sol.id})">Aprovar</button>
        <button class="rejeitar" onclick="rejeitarGestor(${sol.id})">Rejeitar</button>`;
      gestorUl.appendChild(li);
    });

  // Lista do RH
  const rhUl = document.getElementById("listaRH");
  rhUl.innerHTML = "";
  solicitacoes.filter(sol => sol.status === "Aprovado pelo Gestor - Pendente do RH")
    .forEach(sol => {
      const li = document.createElement("li");
      li.innerHTML = `${sol.nome} (${sol.inicio} a ${sol.fim}) 
        <button onclick="confirmarRH(${sol.id})">Confirmar RH</button>`;
      rhUl.appendChild(li);
    });
}

// Inicializa listas
atualizarListas();


