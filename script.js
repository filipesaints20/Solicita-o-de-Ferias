const API_URL = "TUA_URL_DO_APPS_SCRIPT"; // <-- substitui pela URL publicada

// ---------------------- LOGIN & CADASTRO ----------------------
function signup() {
  const email = document.getElementById("novoEmail").value.trim();
  const senha = document.getElementById("novaSenha").value.trim();
  const perfil = document.getElementById("perfil").value;

  if (!email.endsWith("@effico.com.br")) {
    document.getElementById("mensagem").innerText = "Use o email corporativo @effico.com.br";
    return;
  }

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ tipo: "usuario", email, senha, perfil }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(msg => document.getElementById("mensagem").innerText = msg)
  .catch(err => console.error("Erro:", err));
}

function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ tipo: "login", email, senha }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.json())
  .then(resp => {
    if (!resp.sucesso) {
      document.getElementById("mensagem").innerText = resp.mensagem;
      return;
    }

    const user = { email, perfil: resp.perfil };
    localStorage.setItem("usuarioLogado", JSON.stringify(user));

    if (resp.perfil === "solicitante") window.location.href = "solicitante.html";
    if (resp.perfil === "gestor") window.location.href = "gestor.html";
    if (resp.perfil === "rh") window.location.href = "rh.html";
  })
  .catch(err => console.error("Erro:", err));
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

// ---------------------- SOLICITANTE ----------------------
function verificarLoginSolicitante() {
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!user || user.perfil !== "solicitante") {
    alert("Acesso não autorizado!");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").innerText = user.email.split("@")[0];
  document.getElementById("emailUsuario").innerText = user.email;

  carregarSolicitacoes(user.email);

  document.getElementById("formSolicitacao")?.addEventListener("submit", e => {
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
    .then(() => {
      alert("Solicitação enviada!");
      e.target.reset();
      carregarSolicitacoes(user.email);
    })
    .catch(err => console.error("Erro:", err));
  });
}

function carregarSolicitacoes(email) {
  fetch(API_URL)
    .then(res => res.json())
    .then(dados => {
      const lista = document.getElementById("listaSolicitacoes");
      lista.innerHTML = "";
      dados.filter((r, i) => i > 0 && r[1] === email).forEach(r => {
        const li = document.createElement("li");
        li.textContent = `${r[2]} → ${r[3]} | Status: ${r[4]}` +
                         (r[5] ? ` | Motivo: ${r[5]}` : "");
        lista.appendChild(li);
      });
    });
}

// ---------------------- GESTOR ----------------------
function verificarLoginGestor() {
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!user || user.perfil !== "gestor") {
    alert("Acesso não autorizado!");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeGestor").innerText = user.email.split("@")[0];
  document.getElementById("emailGestor").innerText = user.email;
  carregarSolicitacoesGestor();
}

function carregarSolicitacoesGestor() {
  fetch(API_URL)
    .then(res => res.json())
    .then(dados => {
      const listaPendentes = document.getElementById("listaPendentes");
      const listaHistorico = document.getElementById("listaHistorico");

      listaPendentes.innerHTML = "";
      listaHistorico.innerHTML = "";

      dados.slice(1).forEach(r => {
        const s = { id: r[0], email: r[1], inicio: r[2], fim: r[3], status: r[4], motivo: r[5] };
        const li = document.createElement("li");
        li.innerHTML = `${s.email} → ${s.inicio} até ${s.fim} | Status: ${s.status}`;

        if (s.status === "Pendente do Gestor") {
          const aprovar = document.createElement("button");
          aprovar.textContent = "✔ Aprovar";
          aprovar.onclick = () => atualizarStatus(s.id, "Aprovado pelo Gestor");

          const rejeitar = document.createElement("button");
          rejeitar.textContent = "✖ Rejeitar";
          rejeitar.onclick = () => {
            const motivo = prompt("Motivo da rejeição:");
            if (motivo) atualizarStatus(s.id, "Rejeitado pelo Gestor", motivo);
          };

          li.append(aprovar, rejeitar);
          listaPendentes.appendChild(li);
        } else {
          if (s.motivo) li.innerHTML += ` | Motivo: ${s.motivo}`;
          listaHistorico.appendChild(li);
        }
      });
    });
}

function atualizarStatus(id, status, motivo = "") {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ tipo: "update", id, status, motivo }),
    headers: { "Content-Type": "application/json" }
  })
  .then(() => carregarSolicitacoesGestor());
}

// ---------------------- RH ----------------------
function verificarLoginRh() {
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!user || user.perfil !== "rh") {
    alert("Acesso não autorizado!");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeRh").innerText = user.email.split("@")[0];
  document.getElementById("emailRh").innerText = user.email;
  carregarSolicitacoesRh();
}

function carregarSolicitacoesRh() {
  fetch(API_URL)
    .then(res => res.json())
    .then(dados => {
      const listaP = document.getElementById("listaRhPendentes");
      const listaH = document.getElementById("listaRhHistorico");
      listaP.innerHTML = "";
      listaH.innerHTML = "";

      dados.slice(1).forEach(r => {
        const s = { id: r[0], email: r[1], inicio: r[2], fim: r[3], status: r[4], motivo: r[5] };
        const li = document.createElement("li");
        li.innerHTML = `${s.email} → ${s.inicio} até ${s.fim} | Status: ${s.status}`;

        if (s.status === "Aprovado pelo Gestor") {
          const validar = document.createElement("button");
          validar.textContent = "✔ Validar RH";
          validar.onclick = () => atualizarStatusRh(s.id, "Validado pelo RH");

          const rejeitar = document.createElement("button");
          rejeitar.textContent = "✖ Rejeitar RH";
          rejeitar.onclick = () => {
            const motivo = prompt("Motivo da recusa:");
            if (motivo) atualizarStatusRh(s.id, "Rejeitado pelo RH", motivo);
          };

          li.append(validar, rejeitar);
          listaP.appendChild(li);
        } else if (s.status.includes("RH")) {
          if (s.motivo) li.innerHTML += ` | Motivo: ${s.motivo}`;
          listaH.appendChild(li);
        }
      });
    });
}

function atualizarStatusRh(id, status, motivo = "") {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({ tipo: "update", id, status, motivo }),
    headers: { "Content-Type": "application/json" }
  })
  .then(() => carregarSolicitacoesRh());
}




