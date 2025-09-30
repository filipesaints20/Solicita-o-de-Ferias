const API_URL = "https://script.google.com/macros/s/AKfycbyWqdx2aylCVuB0XPBznV3W5i3Vzk8nj82Ynr9RBtOEwdtBmYOu6rRkV0CUoC_3WMny/exec"; // <-- coloca a URL publicada

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
  fetch(API_URL) // GET -> devolve todas as solicitações
    .then(res => res.json())
    .then(dados => {
      const listaPendentes = document.getElementById("listaPendentes");
      const listaHistorico = document.getElementById("listaHistorico");

      listaPendentes.innerHTML = "";
      listaHistorico.innerHTML = "";

      // a primeira linha é o cabeçalho no Sheets
      for (let i = 1; i < dados.length; i++) {
        const s = {
          id: dados[i][0],
          email: dados[i][1],
          inicio: dados[i][2],
          fim: dados[i][3],
          status: dados[i][4],
          motivo: dados[i][5]
        };

        const li = document.createElement("li");
        li.innerHTML = `${s.email} → ${s.inicio} até ${s.fim} | Status: ${s.status}`;

        if (s.status === "Pendente do Gestor") {
          const aprovarBtn = document.createElement("button");
          aprovarBtn.textContent = "✔ Aprovar";
          aprovarBtn.onclick = () => atualizarStatusGoogle(s.id, "Aprovado pelo Gestor");

          const rejeitarBtn = document.createElement("button");
          rejeitarBtn.textContent = "✖ Rejeitar";
          rejeitarBtn.onclick = () => {
            const motivo = prompt("Digite o motivo da rejeição:");
            if (motivo) atualizarStatusGoogle(s.id, "Rejeitado pelo Gestor", motivo);
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
      }
    });
}

function atualizarStatusGoogle(id, novoStatus, motivo = "") {
  fetch(API_URL, {
    method: "POST",
    body: JSON.stringify({
      tipo: "update",
      id,
      status: novoStatus,
      motivo
    }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(r => {
    console.log("Resposta do Sheets:", r);
    carregarSolicitacoesGestor(); // recarrega a lista
  })
  .catch(err => console.error("Erro:", err));
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "index.html";
}

verificarLoginGestor();
