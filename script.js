// Simulação de "base de dados" no localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];

function signup() {
  const email = document.getElementById("novoEmail").value;
  const senha = document.getElementById("novaSenha").value;
  const perfil = document.getElementById("perfil").value;

  if (!email.endsWith("@effico.com.br")) {
    document.getElementById("mensagem").innerText = "Use o email corporativo @effico.com.br";
    return;
  }

  if (users.find(u => u.email === email)) {
    document.getElementById("mensagem").innerText = "Este email já está registado.";
    return;
  }

  users.push({ email, senha, perfil });
  localStorage.setItem("users", JSON.stringify(users));
  document.getElementById("mensagem").innerText = "Conta criada com sucesso!";
}

function login() {
  const email = document.getElementById("email").value;
  const senha = document.getElementById("senha").value;

  const user = users.find(u => u.email === email && u.senha === senha);
  if (!user) {
    document.getElementById("mensagem").innerText = "Credenciais inválidas!";
    return;
  }

  localStorage.setItem("usuarioLogado", JSON.stringify(user));

  // Redireciona conforme o perfil
  if (user.perfil === "solicitante") window.location.href = "solicitante.html";
  if (user.perfil === "gestor") window.location.href = "gestor.html";
  if (user.perfil === "rh") window.location.href = "rh.html";
}
// ---------------------- SOLICITANTE ----------------------
function verificarLoginSolicitante() {
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!user || user.perfil !== "solicitante") {
    alert("Acesso não autorizado! Faça login.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeUsuario").innerText = user.email.split("@")[0];
  document.getElementById("emailUsuario").innerText = user.email;
  atualizarListaSolicitacoes(user.email);

  document.getElementById("formSolicitacao")?.addEventListener("submit", (e) => {
    e.preventDefault();

    let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];

    const nova = {
      id: Date.now(),
      email: user.email,
      inicio: document.getElementById("dataInicio").value,
      fim: document.getElementById("dataFim").value,
      status: "Pendente do Gestor",
      motivo: ""
    };

    solicitacoes.push(nova);
    localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
    atualizarListaSolicitacoes(user.email);

    e.target.reset();
    alert("Solicitação enviada!");
  });
}

function atualizarListaSolicitacoes(email) {
  let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];
  const lista = document.getElementById("listaSolicitacoes");
  if (!lista) return;

  lista.innerHTML = "";
  solicitacoes.filter(s => s.email === email).forEach(s => {
    const li = document.createElement("li");
    li.textContent = `${s.inicio} → ${s.fim} | Status: ${s.status}` +
                     (s.motivo ? ` | Motivo: ${s.motivo}` : "");
    lista.appendChild(li);
  });
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

if (window.location.pathname.includes("solicitante.html")) {
  verificarLoginSolicitante();
}
// ---------------------- GESTOR ----------------------
function verificarLoginGestor() {
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!user || user.perfil !== "gestor") {
    alert("Acesso não autorizado! Faça login.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeGestor").innerText = user.email.split("@")[0];
  document.getElementById("emailGestor").innerText = user.email;
  carregarSolicitacoesGestor();
}

function carregarSolicitacoesGestor() {
  let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];

  const listaPendentes = document.getElementById("listaPendentes");
  const listaHistorico = document.getElementById("listaHistorico");

  listaPendentes.innerHTML = "";
  listaHistorico.innerHTML = "";

  solicitacoes.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${s.email} → ${s.inicio} até ${s.fim} | Status: ${s.status}`;

    if (s.status === "Pendente do Gestor") {
      const aprovarBtn = document.createElement("button");
      aprovarBtn.textContent = "✔ Aprovar";
      aprovarBtn.onclick = () => atualizarStatus(i, "Aprovado pelo Gestor");

      const rejeitarBtn = document.createElement("button");
      rejeitarBtn.textContent = "✖ Rejeitar";
      rejeitarBtn.onclick = () => {
        const motivo = prompt("Digite o motivo da rejeição:");
        if (motivo) atualizarStatus(i, "Rejeitado pelo Gestor", motivo);
      };

      li.appendChild(aprovarBtn);
      li.appendChild(rejeitarBtn);
      listaPendentes.appendChild(li);
    } else {
      if (s.motivo) {
        li.innerHTML += ` | Motivo: ${s.motivo}`;
      }
      listaHistorico.appendChild(li);
    }
  });
}

function atualizarStatus(index, novoStatus, motivo = "") {
  let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];
  solicitacoes[index].status = novoStatus;
  solicitacoes[index].motivo = motivo;
  localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
  carregarSolicitacoesGestor();
}
// ---------------------- RH ----------------------
function verificarLoginRh() {
  const user = JSON.parse(localStorage.getItem("usuarioLogado"));
  if (!user || user.perfil !== "rh") {
    alert("Acesso não autorizado! Faça login.");
    window.location.href = "index.html";
    return;
  }

  document.getElementById("nomeRh").innerText = user.email.split("@")[0];
  document.getElementById("emailRh").innerText = user.email;
  carregarSolicitacoesRh();
}

function carregarSolicitacoesRh() {
  let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];

  const listaPendentes = document.getElementById("listaRhPendentes");
  const listaHistorico = document.getElementById("listaRhHistorico");

  listaPendentes.innerHTML = "";
  listaHistorico.innerHTML = "";

  solicitacoes.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `${s.email} → ${s.inicio} até ${s.fim} | Status: ${s.status}`;

    // Só entra aqui se o gestor já aprovou
    if (s.status === "Aprovado pelo Gestor") {
      const aprovarBtn = document.createElement("button");
      aprovarBtn.textContent = "✔ Validar RH";
      aprovarBtn.onclick = () => atualizarStatusRh(i, "Validado pelo RH");

      const rejeitarBtn = document.createElement("button");
      rejeitarBtn.textContent = "✖ Rejeitar RH";
      rejeitarBtn.onclick = () => {
        const motivo = prompt("Digite o motivo da recusa pelo RH:");
        if (motivo) atualizarStatusRh(i, "Rejeitado pelo RH", motivo);
      };

      li.appendChild(aprovarBtn);
      li.appendChild(rejeitarBtn);
      listaPendentes.appendChild(li);
    } else if (s.status.includes("RH")) {
      // Tudo que já passou pelo RH
      if (s.motivo) {
        li.innerHTML += ` | Motivo: ${s.motivo}`;
      }
      listaHistorico.appendChild(li);
    }
  });
}

function atualizarStatusRh(index, novoStatus, motivo = "") {
  let solicitacoes = JSON.parse(localStorage.getItem("solicitacoes")) || [];
  solicitacoes[index].status = novoStatus;
  solicitacoes[index].motivo = motivo;
  localStorage.setItem("solicitacoes", JSON.stringify(solicitacoes));
  carregarSolicitacoesRh();
}

if (window.location.pathname.includes("rh.html")) {
  verificarLoginRh();
}



