const WEBAPP_URL = "https://script.google.com/macros/s/AKfycbw0Se8TGHPqePe-fCMIRDAkfric__T0vWCQEviaZcscOYW6bZsUdb5_jaSOVY2szGtUDA/exec";

function mostrar(secao) {
  document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
  document.getElementById(secao).classList.add('active');
}

function exibirMensagem(tipo, mensagem, destinoId) {
  const destino = document.getElementById(destinoId);
  destino.innerHTML = `<div class="${tipo}">${mensagem}</div>`;
}

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, tag => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[tag]));
}

document.getElementById('formEnvio').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  const inicio = new Date(data.inicio);
  const fim = new Date(data.fim);
  if (fim <= inicio) {
    exibirMensagem('error', 'A data de fim deve ser após a data de início.', 'respEnvio');
    return;
  }
  data.obs = escapeHTML(data.obs || '');
  try {
    const resp = await fetch(WEBAPP_URL, {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(data)
    });
    const r = await resp.json();
    if(r.ok) {
      e.target.reset();
      exibirMensagem('success', `Solicitação enviada! ID: ${r.id}`, 'respEnvio');
    } else {
      exibirMensagem('error', `Erro: ${JSON.stringify(r)}`, 'respEnvio');
    }
  } catch(err) {
    exibirMensagem('error', `Falha: ${err.message}`, 'respEnvio');
  }
});

document.getElementById('formConsulta').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = e.target.email.value;
  const out = document.getElementById('resultadoConsulta');
  out.innerHTML = 'Consultando...';
  try {
    const resp = await fetch(`${WEBAPP_URL}?check=${encodeURIComponent(email)}`);
    const data = await resp.json();
    if(!data || data.length === 0){
      exibirMensagem('error', 'Nenhuma solicitação encontrada.', 'resultadoConsulta');
      return;
    }
    let html = '<ul>';
    data.forEach(s => {
      html += `<li><b>ID:</b> ${s.id}<br><b>Período:</b> ${s.inicio} até ${s.fim}<br><b>Status:</b> ${s.status}${s.linkDocumento ? `<br><a href="${s.linkDocumento}" target="_blank">📄 Documento</a>` : ''}</li>`;
    });
    html += '</ul>';
    out.innerHTML = html;
  } catch(err) {
    exibirMensagem('error', `Erro: ${err.message}`, 'resultadoConsulta');
  }
});

const params = new URLSearchParams(location.search);
const id = params.get('id');
const token = params.get('token');
document.getElementById('infoUpload').innerText = id && token ? `ID da solicitação: ${id}` : 'Link inválido.';
if (!id || !token) document.getElementById('formUpload').style.display = 'none';

document.getElementById('formUpload').addEventListener('submit', async (e) => {
  e.preventDefault();
  const file = document.getElementById('fileUpload').files[0];
  if(!file) return alert('Selecione o arquivo');
  if(file.size > 5 * 1024 * 1024) return alert('O arquivo deve ter no máximo 5MB.');
  if (!confirm("Tem certeza que deseja enviar este PDF?")) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(',')[1];
    const payload = {
      action: 'upload',
      id: id,
      token: token,
      fileName: file.name,
      mimeType: file.type || 'application/pdf',
      fileData: base64
    };
    try {
      const resp = await fetch(WEBAPP_URL, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const r = await resp.json();
      if(r.ok){
        exibirMensagem('success', `Arquivo enviado com sucesso! <a href="${r.url}" target="_blank">Ver PDF</a>`, 'respUpload');
      } else {
        exibirMensagem('error', `Erro: ${r.error || JSON.stringify(r)}`, 'respUpload');
      }
    } catch(err){
      exibirMensagem('error', `Falha: ${err.message}`, 'respUpload');
    }
  };
  reader.readAsDataURL(file);
});
