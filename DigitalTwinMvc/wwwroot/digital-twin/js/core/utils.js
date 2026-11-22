const DT = { models: {}, views: { shared: {}, student: {}, advisor: {}, admin: {} }, controllers: {}, charts: {} };

DT.$ = sel => document.querySelector(sel);
DT.$$ = sel => Array.from(document.querySelectorAll(sel));

// stop user text from being read as html
DT.esc = text => String(text == null ? "" : text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

DT.levelOfRisk = score => (score >= 70 ? "High" : score >= 40 ? "Medium" : "Low");
DT.levelClass = level => (level === "High" ? "p-red" : level === "Medium" ? "p-amber" : "p-green");
DT.levelColor = level => (level === "High" ? "#c4423a" : level === "Medium" ? "#d98e1f" : "#2f8a55");
DT.pill = (text, cls) => `<span class="pill ${cls}">${DT.esc(text)}</span>`;
DT.statusPill = s => DT.pill(s, s === "Verified" ? "p-green" : s === "Rejected" ? "p-red" : "p-amber");
DT.head = (title, sub, right = "") => `<div class="top"><div><h1>${title}</h1><p class="sub">${sub}</p></div>${right}</div>`;
DT.kpi = (label, value, extra = "") => `<div class="card kpi"><small>${label}</small><b>${DT.esc(value)}</b>${extra}</div>`;
// links between pages. Every screen is its own html file: review.html?id=420231068
DT.href = (route, id) => route + ".html" + (id ? "?id=" + encodeURIComponent(id) : "");
// turns a stored link like "#/profile" or "#/plans/42" (sent by the backend inside a notification) into a page link
DT.link = link => { const m = /^#\/([A-Za-z-]+)(?:\/(.+))?$/.exec(link || ""); return m ? DT.href(m[1], m[2]) : ""; };
DT.today = () => new Date().toLocaleDateString("en-GB");

DT.toast = text => {
  const box = document.createElement("div");
  box.className = "toast";
  box.setAttribute("role", "status");
  box.textContent = text;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
};

DT.highlight = (text, q) => {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return DT.esc(text);
  return DT.esc(text.slice(0, i)) + "<mark>" + DT.esc(text.slice(i, i + q.length)) + "</mark>" + DT.esc(text.slice(i + q.length));
};


DT.mount = (html, bind) => {
  DT.$("#main").innerHTML = html;
  if (bind) bind();
};
DT.loading = () => DT.mount('<p class="sub" style="padding:28px 32px">Loading...</p>');
DT.showError = err => DT.mount('<div class="alert" role="alert" style="margin:28px 32px">' + DT.esc(err.message || "Something went wrong.") + "</div>");

DT.charts.radar = skills => {
  const cx = 160, cy = 160, R = 105, n = skills.length;
  const point = (i, v) => {
    const a = -Math.PI / 2 + 2 * Math.PI * i / n;
    return [cx + R * v / 100 * Math.cos(a), cy + R * v / 100 * Math.sin(a)];
  };
  const poly = key => skills.map((x, i) => point(i, x[key]).join(",")).join(" ");
  let s = '<svg viewBox="0 0 320 320" width="100%" style="max-width:380px;display:block;margin:0 auto" role="img" aria-label="Radar chart of current and target skills">';
  [25, 50, 75, 100].forEach(level => {
    s += '<polygon points="' + skills.map((x, i) => point(i, level).join(",")).join(" ") + '" fill="none" stroke="#dfe5ec"/>';
  });
  skills.forEach((x, i) => {
    const [ax, ay] = point(i, 100), [lx, ly] = point(i, 123);
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ax + '" y2="' + ay + '" stroke="#dfe5ec"/>';
    s += '<text x="' + lx + '" y="' + ly + '" font-size="11" font-weight="600" fill="#5d6b7c" text-anchor="middle" dominant-baseline="middle">' + DT.esc(x.name) + "</text>";
  });
  s += '<polygon points="' + poly("target") + '" fill="rgba(217,142,31,.12)" stroke="#d98e1f" stroke-width="2" stroke-dasharray="5 4"/>';
  s += '<polygon points="' + poly("current") + '" fill="rgba(13,122,133,.25)" stroke="#0d7a85" stroke-width="2.5"/>';
  skills.forEach((x, i) => {
    const [px, py] = point(i, x.current);
    s += '<circle cx="' + px + '" cy="' + py + '" r="4" fill="#0d7a85"/>';
  });
  return s + '</svg><div class="legend"><span><i style="background:#0d7a85"></i>Skills now</span><span><i style="background:#d98e1f"></i>Career target</span></div>';
};

DT.charts.trend = terms => {
  if (!terms.length) return '<p class="sub">No term data yet.</p>';
  const step = terms.length > 1 ? 240 / (terms.length - 1) : 0;
  const pts = terms.map((t, i) => [40 + i * step, 150 - (t.gpa - 2) * 65]);
  let s = '<svg viewBox="0 0 320 190" width="100%" style="max-width:440px;display:block;margin:0 auto" role="img" aria-label="GPA by term">';
  s += '<line x1="20" y1="150" x2="300" y2="150" stroke="#dfe5ec"/>';
  s += '<polyline points="' + pts.map(p => p.join(",")).join(" ") + '" fill="none" stroke="#0d7a85" stroke-width="3"/>';
  pts.forEach((p, i) => {
    s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="#0d7a85"/>';
    s += '<text x="' + p[0] + '" y="' + (p[1] - 10) + '" font-size="11" font-weight="700" text-anchor="middle" fill="#16202e">' + terms[i].gpa.toFixed(2) + "</text>";
    s += '<text x="' + p[0] + '" y="172" font-size="11" text-anchor="middle" fill="#5d6b7c">' + DT.esc(terms[i].term) + "</text>";
  });
  return s + "</svg>";
};
