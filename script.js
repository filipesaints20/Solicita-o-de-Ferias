// Captura o formulário
const formSolicitacao = document.getElementById("formSolicitacao");
const solicitacaoSec = document.getElementById("solicitacao");
const aprovacaoGestorSec = document.getElementById("aprovacaoGestor");
const rhSec = document.getElementById("rh");
const resultadoSec = document.getElementById("resultado");

let dados = {}; // Armazena os dados da solicitação

// Etapa 1 - Enviar solicitação
formSolicitacao.addEventListener("submit", (e) => {
  e.preventDefault();
  dados = {
    nome: document.getElementById("nome").value,
    dataInicio: document.getElementById("dataInicio").value,
    dataFim: document.getElementById("dataFim").value
  };

  solicitacaoSec.classList.add("hidden");
  aprovacaoGestorSec.classList.remove("hidden");

  document.getElementById("dadosSolicitacao").innerText =
    `Solicitação de ${dados.nome} para férias de ${dados.dataInicio} até ${dados.dataFim}.`;
});

// Etapa 2 - Aprovação do Gestor
function aprovarGestor() {
  aprovacaoGestorSec.classList.add("hidden");
  rhSec.classList.remove("hidden");

  document.getElementById("dadosRH").innerText =
    `Gestor aprovou a solicitação de ${dados.nome}. Agora precisa da confirmação do RH.`;
}

function rejeitarGestor() {
  aprovacaoGestorSec.classList.add("hidden");
  resultadoSec.classList.remove("hidden");

  document.getElementById("mensagemFinal").innerText =
    `Solicitação de ${dados.nome} foi REJEITADA pelo Gestor. Motivo: falta de alinhamento com a equipa.`;
}

// Etapa 3 - Confirmação do RH
function confirmarRH() {
  rhSec.classList.add("hidden");
  resultadoSec.classList.remove("hidden");

  document.getElementById("mensagemFinal").innerText =
    `RH confirmou as férias de ${dados.nome}. Boa viagem! 🎉`;
}


