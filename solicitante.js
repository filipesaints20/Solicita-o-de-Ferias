const API_URL = "https://script.google.com/macros/s/AKfycbyWqdx2aylCVuB0XPBznV3W5i3Vzk8nj82Ynr9RBtOEwdtBmYOu6rRkV0CUoC_3WMny/exec";

function verificarLoginSolicitante() {
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!user || user.perfil !== "solicitante") {
    alert("Acesso não autorizado! Faça login.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").innerText = user.email.split("@")[0];
  document.getElementById("emailUsuario").innerText = user.email;

  document.getElementById("formSolicitacao").addEventListener("submit", (e) => {
    e.preventDefault();

    const nova = {
      tipo: "solicitacao",
      id: Date.now(),
      email: user.email,
      inicio: document.getElementById("dataInicio").value,
      fim: document.getElementById("dataFim").value,
      status: "Pendente do Gestor",
      motivo: ""
    };

    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(nova),
      headers: { "Content-Type": "application/json" }
    })
    .then(res => res.text())
    .then(() => {
      e.target.reset();
      carregarSolicitacoes(user.email);
    });
  });

  carregarSolicitacoes(user.email);
}

function carregarSolicitacoes(email) {
  fetch(API_URL)
    .then(res => res.json())
    .then(dados => {
      const lista = document.getElementById("listaSolicitacoes");
      lista.innerHTML = "";

      for (let i = 1; i < dados.length; i++) {
        if (dados[i][1] === email) {
          const li = document.createElement("li");
          li.textContent = `${dados[i][2]} → ${dados[i][3]} | Status: ${dados[i][4]}` +
                           (dados[i][5] ? ` | Motivo: ${dados[i][5]}` : "");
          lista.appendChild(li);
        }
      }
    });
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

verificarLoginSolicitante();
