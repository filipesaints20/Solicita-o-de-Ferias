const API_URL = "https://script.google.com/macros/s/AKfycbxfvFVdodZeuNkI2gXRrqwabXZJzcUNVueF3w8iSH5fPTCCtjnuwsF7bO9JJabIHxFW/exechttps://script.google.com/macros/s/AKfycbyWqdx2aylCVuB0XPBznV3W5i3Vzk8nj82Ynr9RBtOEwdtBmYOu6rRkV0CUoC_3WMny/exec";

// Criar conta
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
    body: JSON.stringify({
      tipo: "usuario",
      email,
      senha,
      perfil
    }),
    headers: { "Content-Type": "application/json" }
  })
  .then(res => res.text())
  .then(msg => {
    document.getElementById("mensagem").innerText = msg;
  })
  .catch(err => console.error("Erro:", err));
}

// Login
function login() {
  const email = document.getElementById("email").value.trim();
  const senha = document.getElementById("senha").value.trim();

  fetch(API_URL + "?tipo=usuarios")
    .then(res => res.json())
    .then(dados => {
      for (let i = 1; i < dados.length; i++) {
        const [uEmail, uSenha, uPerfil] = dados[i];
        if (uEmail === email && uSenha === senha) {
          const user = { email: uEmail, perfil: uPerfil };
          localStorage.setItem("usuarioLogado", JSON.stringify(user));

          if (uPerfil === "solicitante") window.location.href = "solicitante.html";
          if (uPerfil === "gestor") window.location.href = "gestor.html";
          if (uPerfil === "rh") window.location.href = "rh.html";
          return;
        }
      }
      document.getElementById("mensagem").innerText = "Credenciais inválidas!";
    })
    .catch(err => console.error("Erro:", err));
}
