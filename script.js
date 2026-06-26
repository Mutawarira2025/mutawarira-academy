import { db } from './firebase-config.js';
import { ref, onValue, push, set } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-database.js";

// ── PRICING ──────────────────────────────────────────────────
onValue(ref(db, 'academy/pricing'), (snap) => {
  const data = snap.val();
  const grid = document.getElementById("pricingGrid");
  const types = [
    { key: 'oneOnOne', label: 'One-on-One', desc: 'Private tutoring', featured: false, features: ['Fully personalised', 'Your own pace', 'Direct attention', 'Flexible timing', 'Exam focused'] },
    { key: 'group', label: 'Group Lessons', desc: 'Small group (3–8 students)', featured: true, features: ['Peer learning', 'Affordable option', 'Structured sessions', 'Group practice', 'Great for motivation'] },
    { key: 'homeSchooling', label: 'Home Schooling', desc: 'We come to your home', featured: false, features: ['We travel to you', 'Comfortable learning', 'Full flexibility', 'Family involvement', 'Harare-wide'] }
  ];
  if (!data) {
    grid.innerHTML = types.map(t => `
      <div class="price-card${t.featured?' featured':''}">
        <div class="price-header"><h3>${t.label}</h3><div class="type-desc">${t.desc}</div></div>
        <div class="price-body"><p class="price-loading">Contact us for pricing</p>
        <a href="#enroll" class="btn ${t.featured?'btn-green':'btn-gold'} price-enroll">Enroll for ${t.label}</a>
        </div></div>`).join('');
    return;
  }
  grid.innerHTML = types.map(t => {
    const p = data[t.key] || {};
    const olevel = p.olevel || {};
    const alevel = p.alevel || {};
    return `
      <div class="price-card${t.featured ? ' featured' : ''}">
        <div class="price-header"><h3>${t.label}</h3><div class="type-desc">${t.desc}</div></div>
        <div class="price-body">
          <div class="price-split">
            <div class="price-split-item">
              <div class="price-split-label">O-Level</div>
              <div class="price-amount-sm"><span class="currency">$</span><span class="amount">${olevel.amount || '—'}</span></div>
              <div class="price-per">${olevel.per || 'per month'}</div>
            </div>
            <div class="price-split-divider"></div>
            <div class="price-split-item">
              <div class="price-split-label">A-Level</div>
              <div class="price-amount-sm"><span class="currency">$</span><span class="amount">${alevel.amount || '—'}</span></div>
              <div class="price-per">${alevel.per || 'per month'}</div>
            </div>
          </div>
          <div class="price-features">
            ${t.features.map(f => `<div class="price-feature">${f}</div>`).join('')}
            ${p.note ? `<div class="price-feature" style="color:var(--green);font-weight:600">✦ ${p.note}</div>` : ''}
          </div>
          <a href="#enroll" class="btn ${t.featured ? 'btn-green' : 'btn-gold'} price-enroll">Enroll for ${t.label}</a>
        </div>
      </div>`;
  }).join('');
});

// ── SCHEDULE ─────────────────────────────────────────────────
onValue(ref(db, 'academy/schedule'), (snap) => {
  const data = snap.val();
  const tbody = document.getElementById("scheduleBody");
  if (!data) { tbody.innerHTML = '<tr><td colspan="6" class="schedule-empty">Schedule coming soon — contact us for current times.</td></tr>'; return; }
  const rows = Object.values(data).sort((a, b) => {
    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    return days.indexOf(a.day) - days.indexOf(b.day);
  });
  const badgeClass = { 'General Mathematics': 'math', 'Pure Mathematics': 'pure', 'Computer Science': 'cs' };
  tbody.innerHTML = rows.map(r => `
    <tr>
      <td><strong>${r.day}</strong></td>
      <td>${r.time}</td>
      <td class="sch-subject"><span class="sch-badge ${badgeClass[r.subject] || 'math'}">${r.subject}</span></td>
      <td>${r.level}</td>
      <td>${r.type}</td>
      <td>${r.venue || 'Academy Centre'}</td>
    </tr>`).join('');
});

// ── PASS RATES ───────────────────────────────────────────────
onValue(ref(db, 'academy/passrates'), (snap) => {
  const data = snap.val();
  const grid = document.getElementById("passrateGrid");
  if (!data) { grid.innerHTML = '<p class="passrate-empty">Results coming soon.</p>'; return; }
  grid.innerHTML = Object.values(data).map(r => `
    <div class="passrate-card">
      <div class="passrate-pct">${r.percentage}%</div>
      <div class="passrate-subject">${r.subject}</div>
      <div class="passrate-year">${r.level} · ${r.year}</div>
    </div>`).join('');
});

// ── GALLERY ──────────────────────────────────────────────────
let allGallery = [];
onValue(ref(db, 'academy/gallery'), (snap) => {
  const data = snap.val();
  allGallery = data ? Object.values(data) : [];
  renderGallery('all');
});

window.switchGallery = function(type, btn) {
  document.querySelectorAll('.gtab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  renderGallery(type);
};

function renderGallery(type) {
  const grid = document.getElementById("galleryGrid");
  const items = type === 'all' ? allGallery : allGallery.filter(i => i.type === type);
  if (!items.length) { grid.innerHTML = '<p class="gallery-empty">No items yet.</p>'; return; }
  grid.innerHTML = items.map(item => {
    if (item.type === 'video') {
      const ytId = extractYouTubeId(item.url);
      return `<div class="gallery-item"><div class="video-wrap"><iframe src="https://www.youtube.com/embed/${ytId}" allowfullscreen loading="lazy"></iframe></div><div class="gallery-caption">${item.caption || ''}</div></div>`;
    }
    return `<div class="gallery-item"><img src="${item.url}" alt="${item.caption || 'Academy photo'}" loading="lazy"><div class="gallery-caption">${item.caption || ''}</div></div>`;
  }).join('');
}

function extractYouTubeId(url) {
  const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : url;
}

// ── ENROLLMENT FORM ──────────────────────────────────────────
document.getElementById("enrollForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const status = document.getElementById("enrollStatus");
  const btn = e.target.querySelector("button");
  const enrollment = {
    studentName: document.getElementById("eName").value.trim(),
    parentName: document.getElementById("eParent").value.trim(),
    phone: document.getElementById("ePhone").value.trim(),
    whatsapp: document.getElementById("eWhatsapp").value.trim(),
    form: document.getElementById("eForm").value,
    subject: document.getElementById("eSubject").value,
    lessonType: document.getElementById("eLessonType").value,
    curriculum: document.getElementById("eCurriculum").value,
    notes: document.getElementById("eNotes").value.trim(),
    status: "new",
    timestamp: Date.now()
  };
  if (!enrollment.studentName || !enrollment.parentName || !enrollment.phone || !enrollment.form || !enrollment.subject || !enrollment.lessonType) {
    status.textContent = "Please fill in all required fields.";
    status.className = "form-status error";
    return;
  }
  btn.disabled = true; btn.textContent = "Sending...";
  try {
    await set(push(ref(db, 'academy/enrollments')), enrollment);
    status.textContent = "✅ Enrollment received! We'll contact you within 24 hours to confirm your place.";
    status.className = "form-status success";
    e.target.reset();
  } catch (err) {
    status.textContent = "Something went wrong. Please WhatsApp us directly on 0781181755.";
    status.className = "form-status error";
  } finally { btn.disabled = false; btn.textContent = "Submit Enrollment Request"; }
});

// ── NAV ──────────────────────────────────────────────────────
const toggle = document.getElementById("navToggle");
const nav = document.getElementById("siteNav");
toggle.addEventListener("click", () => nav.classList.toggle("open"));
nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
document.getElementById("year").textContent = new Date().getFullYear();
