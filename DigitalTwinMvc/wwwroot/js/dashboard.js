
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// stop user text from being read as html
function esc(text) {
  return String(text).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

const memory = {};
const store = {
  get(key, fallback) {
    if (key in memory) return memory[key];
    try {
      const saved = localStorage.getItem("dt_" + key);
      if (saved) { memory[key] = JSON.parse(saved); return memory[key]; }
    } catch (e) { /* ignore */ }
    return fallback;
  },
  set(key, value) {
    memory[key] = value;
    try { localStorage.setItem("dt_" + key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  }
};

function riskInfo(r) {
  if (r >= 70) return ["High", "p-red", "#c4423a"];
  if (r >= 40) return ["Medium", "p-amber", "#d98e1f"];
  return ["Low", "p-green", "#2f8a55"];
}
function gradeLevel(p) {
  if (p < 60) return ["High", "p-red"];
  if (p < 70) return ["Medium", "p-amber"];
  return ["Low", "p-green"];
}
const clamp = v => Math.max(0, Math.min(100, v));
const today = () => new Date().toLocaleDateString("en-GB");

function toast(text) {
  const box = document.createElement("div");
  box.className = "toast";
  box.setAttribute("role", "status");
  box.textContent = text;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 2600);
}


function radar(data) {
  const cx = 160, cy = 160, R = 105, n = data.length;
  const point = (i, v) => {
    const a = -Math.PI / 2 + 2 * Math.PI * i / n;
    return [cx + R * v / 100 * Math.cos(a), cy + R * v / 100 * Math.sin(a)];
  };
  const poly = key => data.map((x, i) => point(i, x[key]).join(",")).join(" ");
  let s = '<svg viewBox="0 0 320 320" width="100%" style="max-width:380px;display:block;margin:0 auto" role="img" aria-label="Radar chart of current and target skills">';
  [25, 50, 75, 100].forEach(level => {
    s += '<polygon points="' + data.map((x, i) => point(i, level).join(",")).join(" ") + '" fill="none" stroke="#dfe5ec"/>';
  });
  data.forEach((x, i) => {
    const [ax, ay] = point(i, 100), [lx, ly] = point(i, 123);
    s += '<line x1="' + cx + '" y1="' + cy + '" x2="' + ax + '" y2="' + ay + '" stroke="#dfe5ec"/>';
    s += '<text x="' + lx + '" y="' + ly + '" font-size="11" font-weight="600" fill="#5d6b7c" text-anchor="middle" dominant-baseline="middle">' + x.n + '</text>';
  });
  s += '<polygon points="' + poly("goal") + '" fill="rgba(217,142,31,.12)" stroke="#d98e1f" stroke-width="2" stroke-dasharray="5 4"/>';
  s += '<polygon points="' + poly("now") + '" fill="rgba(13,122,133,.25)" stroke="#0d7a85" stroke-width="2.5"/>';
  data.forEach((x, i) => {
    const [px, py] = point(i, x.now);
    s += '<circle cx="' + px + '" cy="' + py + '" r="4" fill="#0d7a85"/>';
  });
  return s + '</svg><div class="legend"><span><i style="background:#0d7a85"></i>Skills now</span><span><i style="background:#d98e1f"></i>Career target</span></div>';
}


function trend(hist, pred) {
  const n = hist.length + (pred != null ? 1 : 0);
  const gap = 280 / (n - 1), x0 = 30;
  const y = v => 150 - (v - 2) * 65;
  const label = i => "Y" + (Math.floor(i / 2) + 1) + " T" + (i % 2 + 1);
  const pts = hist.map((v, i) => [x0 + i * gap, y(v)]);
  let s = '<svg viewBox="0 0 340 190" width="100%" style="max-width:560px;display:block;margin:0 auto" role="img" aria-label="GPA by term">';
  s += '<line x1="15" y1="150" x2="325" y2="150" stroke="#dfe5ec"/>';
  s += '<polyline points="' + pts.map(p => p.join(",")).join(" ") + '" fill="none" stroke="#0d7a85" stroke-width="3"/>';
  if (pred != null) {
    const last = pts[pts.length - 1], next = [x0 + hist.length * gap, y(pred)];
    s += '<line x1="' + last[0] + '" y1="' + last[1] + '" x2="' + next[0] + '" y2="' + next[1] + '" stroke="#d98e1f" stroke-width="3" stroke-dasharray="5 4"/>';
    s += '<circle cx="' + next[0] + '" cy="' + next[1] + '" r="4.5" fill="#fff" stroke="#d98e1f" stroke-width="2.5"/>';
    s += '<text x="' + next[0] + '" y="' + (next[1] - 10) + '" font-size="10" font-weight="700" text-anchor="middle" fill="#d98e1f">' + pred.toFixed(2) + '</text>';
    s += '<text x="' + next[0] + '" y="172" font-size="10" text-anchor="middle" fill="#d98e1f">' + label(hist.length) + '</text>';
  }
  pts.forEach((p, i) => {
    s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="#0d7a85"/>';
    s += '<text x="' + p[0] + '" y="' + (p[1] - 10) + '" font-size="10" font-weight="700" text-anchor="middle" fill="#16202e">' + hist[i].toFixed(2) + '</text>';
    s += '<text x="' + p[0] + '" y="172" font-size="10" text-anchor="middle" fill="#5d6b7c">' + label(i) + '</text>';
  });
  s += '</svg>';
  if (pred != null) s += '<div class="legend"><span><i style="background:#0d7a85"></i>Finished terms</span><span><i style="background:#d98e1f"></i>Forecast for this term</span></div>';
  return s;
}


const kpi = (label, value, extra) => `<div class="card kpi"><small>${label}</small><b>${value}</b>${extra}</div>`;
const head = (title, sub, right = "") => `<div class="top"><div><h1>${title}</h1><p class="sub">${sub}</p></div>${right}</div>`;
const statusPill = s => `<span class="pill ${s === "Verified" ? "p-green" : s === "Rejected" ? "p-red" : "p-amber"}">${s}</span>`;
const byRisk = list => list.slice().sort((a, b) => b.risk - a.risk);
const courseLink = name => "#/course/" + encodeURIComponent(name);


function externalCourseUrl(name) {
  const url = COURSE_LINKS[name] || COURSE_URL;
  return /^https?:\/\//i.test(url) ? url : "";
}


function highlight(text, q) {
  const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + q.length)) + "</mark>" + esc(text.slice(i + q.length));
}

function studentTable(list, q = "") {
  let rows = "";
  list.forEach(s => {
    const r = riskInfo(s.risk);
    rows += `<tr class="click" tabindex="0" data-href="#/student/${s.id}/predictions">
      <td><b>${highlight(s.name, q)}</b><div class="sub sm">${highlight(s.id, q)}</div></td>
      <td>${s.gpa.toFixed(2)}</td><td>${s.att}%</td><td>${s.pred.toFixed(2)}</td>
      <td style="min-width:120px"><span class="pill ${r[1]}">${r[0]} · ${s.risk}%</span>
      <div class="bar"><span style="width:${s.risk}%;background:${r[2]}"></span></div></td></tr>`;
  });
  return `<div class="tbl"><table><thead><tr><th>Student</th><th>GPA</th><th>Attendance</th><th>Predicted</th><th>Risk</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function planListHtml(plans) {
  return plans.map(p => `<div><div class="row sp"><b>${esc(p.who)}</b><span class="pill p-teal">${esc(p.type)}</span></div>
    <div class="sub">${esc(p.note)}</div><div class="sub sm">${esc(p.date)}</div></div>`).join("");
}


const getProfile = role => store.get("prof_" + role, PROF[role]);
const getNotes = role => store.get("n_" + role, NOTES[role]);
const unreadCount = role => getNotes(role).filter(n => !n.r).length;
function addNote(role, text, link, linkText, body) {
  const list = getNotes(role).slice();
  list.unshift({ t: text, d: "Just now", r: 0, m: body || text, l: link || "", lt: linkText || "" });
  store.set("n_" + role, list);
}

function coursesFor(s) {
  const entered = store.get("grades", {})[s.id] || {};
  const offset = Math.round((s.gpa - 3.21) * 15);
  const extraDrop = Math.round((s.gpa - s.pred - 0.09) * 30);
  return CO.map(c => {
    const now = c.c in entered ? entered[c.c] : clamp(c.now + offset);
    return { c: c.c, now: now, pred: clamp(now - (c.now - c.pred) - extraDrop) };
  });
}
function skillGaps() {
  return SK.map(s => ({ n: s.n, now: s.now, goal: s.goal, g: s.goal - s.now }))
    .filter(s => s.g > 0).sort((a, b) => b.g - a.g);
}

const defaultUsers = () => ST.map(s => ({
  id: s.id, name: s.name, role: "Student", active: true,
  email: s.name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "") + "@fa-hists.edu.eg"
})).concat([
  { id: "adv1", name: "Dr. Hayam Abdelmordy", email: "hayam@fa-hists.edu.eg", role: "Advisor", active: true }
]);
const defaultCerts = [
  { id: "c1", sid: "420231068", who: "Salah-Eldien Mohammad", file: "aws-cloud-cert.pdf", skill: "Cloud Computing", hours: 20, status: "Pending" },
  { id: "c2", sid: "420230163", who: "Saeed Qassim", file: "python-bootcamp.png", skill: "Python", hours: 40, status: "Pending" },
  { id: "c3", sid: "420230300", who: "Muhannad Ayman", file: "sql-advanced.pdf", skill: "SQL", hours: 30, status: "Verified" }
];
const getUsers = () => store.get("users", defaultUsers());
const getCerts = () => store.get("certs", defaultCerts);


function notificationsView(role, args) {
  const list = getNotes(role);
  // #/notifications/3 opens the fourth notification
  if (args && /^\d+$/.test(args[0] || "") && list[Number(args[0])]) return notificationDetail(role, list, Number(args[0]));

  const markBtn = list.some(n => !n.r) ? '<button class="btn ghost" id="mark">Mark all as read</button>' : "";
  const items = list.length ? list.map((n, i) => {
    const preview = n.m && n.m !== n.t ? esc(n.m.length > 90 ? n.m.slice(0, 90) + "..." : n.m) : "";
    return `<a class="notif ${n.r ? "" : "unread"}" href="#/notifications/${i}">
      <div class="row sp"><b>${esc(n.t)}</b><span class="sub sm">${esc(n.d)}</span></div>
      ${preview ? `<div class="sub sm">${preview}</div>` : ""}</a>`;
  }).join("") : '<p class="sub">No notifications.</p>';
  return [
    head("Notifications", "Select a notification to read the full message", markBtn) + `<div class="card"><div class="list">${items}</div></div>`,
    () => {
      const btn = $("#mark");
      if (btn) btn.onclick = () => { store.set("n_" + role, getNotes(role).map(n => ({ ...n, r: 1 }))); render(); };
    }
  ];
}


function notificationDetail(role, list, i) {
  const n = list[i];
  // opening it marks it as read (the sidebar badge is drawn after this runs)
  if (!n.r) store.set("n_" + role, list.map((x, k) => k === i ? { ...x, r: 1 } : x));
  const goBtn = n.l && n.l.indexOf("#/") === 0 ? `<a class="btn" href="${esc(n.l)}">${esc(n.lt || "Open")}</a>` : "";
  const html = '<a class="back" href="#/notifications">← Back to notifications</a>' +
    head(esc(n.t), esc(n.d)) +
    `<div class="card" style="max-width:760px"><p style="font-size:16px;white-space:pre-wrap">${esc(n.m || n.t)}</p>
      <div class="row wrap" style="margin-top:18px">${goBtn}
      <button class="btn ghost" id="unread" type="button">Mark as unread</button>
      <button class="btn danger" id="del" type="button">Delete</button></div></div>`;
  const bind = () => {
    $("#unread").onclick = () => {
      store.set("n_" + role, getNotes(role).map((x, k) => k === i ? { ...x, r: 0 } : x));
      location.hash = "#/notifications";
    };
    $("#del").onclick = () => {
      store.set("n_" + role, getNotes(role).filter((x, k) => k !== i));
      toast("Notification deleted.");
      location.hash = "#/notifications";
    };
  };
  return [html, bind];
}


function searchView() {
  const html = head("Search Student", "Find a student by name or student ID") + `
    <div class="card">
      <div class="search">
        <div><label class="f" for="q" style="margin-top:0">Name or ID</label><input id="q" type="search" placeholder="Start typing..." autocomplete="off"></div>
        <div><label class="f" for="rf" style="margin-top:0">Risk level</label><select id="rf"><option value="all">All levels</option><option>High</option><option>Medium</option><option>Low</option></select></div>
        <div><label class="f" for="sf" style="margin-top:0">Sort by</label><select id="sf"><option value="risk">Highest risk</option><option value="name">Name</option><option value="gpa">Lowest GPA</option></select></div>
      </div>
      <p class="sub" id="count" style="margin:14px 0 4px" aria-live="polite"></p>
      <div id="results"></div>
    </div>`;
  const bind = () => {
    const draw = () => {
      const q = $("#q").value.trim();
      const level = $("#rf").value;
      const sort = $("#sf").value;
      let list = ST.filter(s => {
        const matchText = !q || s.name.toLowerCase().includes(q.toLowerCase()) || s.id.includes(q);
        const matchRisk = level === "all" || riskInfo(s.risk)[0] === level;
        return matchText && matchRisk;
      });
      if (sort === "risk") list = byRisk(list);
      else if (sort === "gpa") list.sort((a, b) => a.gpa - b.gpa);
      else list.sort((a, b) => a.name.localeCompare(b.name));
      $("#count").textContent = list.length + " of " + ST.length + " students";
      $("#results").innerHTML = list.length ? studentTable(list, q) : '<p class="sub">No students match your search.</p>';
      bindRows();
    };
    ["#q", "#rf", "#sf"].forEach(id => { $(id).addEventListener("input", draw); $(id).addEventListener("change", draw); });
    draw();
    $("#q").focus();
  };
  return [html, bind];
}


const V = { student: {}, advisor: {} };

V.student.dashboard = () => {
  const s = ME, r = riskInfo(s.risk);
  const name = getProfile("student").name;
  const watch = coursesFor(s).filter(c => c.pred < c.now - 4).sort((a, b) => (a.pred - a.now) - (b.pred - b.now));
  const watchHtml = watch.length ? watch.map(c => `<a class="row sp" href="${courseLink(c.c)}" style="padding:12px 0">
      <div><b>${c.c}</b><div class="sub sm">Open the course and start learning</div></div>
      <span><span class="pill p-red">${c.now} to ${c.pred}</span> <span class="link">Open</span></span></a>`).join("")
    : '<p class="sub">No courses are dropping. Keep it up.</p>';
  const msgCount = store.get("gd", []).filter(m => m.to === ME.id).length + 1;
  return [
    head("Welcome back, " + esc(name.split(" ")[0]), esc(name) + " · Computer Science, Year 4", '<span class="pill p-teal">Predictions support decisions and do not replace advisors</span>') +
    (s.risk >= 40 ? `<div class="alert" role="alert">Warning: your risk level is ${r[0]}. Talk to your advisor soon.</div>` : "") +
    `<div class="grid g4" style="margin-bottom:16px">
      ${kpi("Current GPA", s.gpa.toFixed(2), '<span class="sub">Out of 4.00</span>')}
      ${kpi("Predicted GPA, this term", s.pred.toFixed(2), '<span class="pill p-amber">Slightly down</span>')}
      ${kpi("Attendance", s.att + "%", '<span class="pill p-green">On track</span>')}
      ${kpi("Risk level", r[0], `<span class="pill ${r[1]}">${s.risk}%</span>`)}
    </div>
    <div class="grid g2">
      <div class="card"><h2>Courses to watch</h2><p class="sub">Select a course to open its lessons.</p><div class="list">${watchHtml}</div></div>
      <div class="card"><h2>Next steps</h2><div class="list">
        <div><a href="#/recs"><b>Read your recommendations</b></a><div class="sub">${skillGaps().length} skill gaps found. Largest: ${skillGaps()[0].n}.</div></div>
        <div><a href="#/guidance"><b>Advisor guidance</b></a><div class="sub">${msgCount} message(s)</div></div>
      </div></div>
    </div>`
  ];
};

V.student.course = args => {
  const name = decodeURIComponent(args[0] || "");
  const course = coursesFor(ME).find(c => c.c === name);
  const lessons = LESSONS[name];
  if (!course || !lessons) return ['<a class="back" href="#/dashboard">Back to dashboard</a>' + head("Course not found", "")];
  const dropping = course.pred < course.now - 4;
  const lvl = gradeLevel(course.pred);
  const extUrl = externalCourseUrl(name);
  const extBtn = extUrl
    ? `<a class="btn" href="${esc(extUrl)}" target="_blank" rel="noopener noreferrer">Go to the full course</a>`
    : '<button class="btn" id="nolink" type="button">Go to the full course</button>';
  const html = '<a class="back" href="#/dashboard">← Back to dashboard</a>' +
    head(esc(name), "Current " + course.now + " · Forecast " + course.pred, `<span class="pill ${lvl[1]}">${lvl[0]} risk</span>`) +
    (dropping ? `<div class="alert">Your forecast for this course is ${course.now - course.pred} points lower than your current score. Finish the lessons below to turn it around.</div>` : "") +
    `<div class="grid g21">
      <div class="card"><div class="row sp"><h2>Lessons</h2><b id="pct"></b></div>
        <div class="bar"><span id="pbar" style="width:0"></span></div>
        <div id="lessons" style="margin-top:8px"></div></div>
      <div class="card"><h2>More help</h2><div class="list">
        <div>${extBtn}<div class="sub sm" style="margin-top:6px">Opens the full course in a new tab when the link is added.</div></div>
        <div><a class="link" href="#/askai">Ask the AI about ${esc(name)}</a></div>
        <div><a class="link" href="#/guidance">Read your advisor's guidance</a></div>
        <div class="sub">Tip: do one lesson a day and mark it as done.</div></div></div>
    </div>`;
  const bind = () => {
    // no link yet: the button still shows and tells the student
    const noLink = $("#nolink");
    if (noLink) noLink.onclick = () => toast("The course link will be added soon.");
    const progress = store.get("lessons", {});
    const done = (progress[name] || []).slice();
    $("#lessons").innerHTML = lessons.map((l, i) => `<details class="lesson">
        <summary><span>${i + 1}. ${l.t}</span><span class="sub sm">${l.m} min</span></summary>
        <p>${l.x}</p>
        <label class="row" style="justify-content:flex-start"><input type="checkbox" data-i="${i}" ${done.includes(i) ? "checked" : ""}> Mark as done</label>
      </details>`).join("");
    const update = () => {
      const pct = Math.round(done.length / lessons.length * 100);
      $("#pct").textContent = pct + "%";
      $("#pbar").style.width = pct + "%";
    };
    update();
    $$("#lessons input").forEach(box => box.addEventListener("change", () => {
      const i = Number(box.dataset.i);
      const pos = done.indexOf(i);
      if (box.checked && pos < 0) done.push(i);
      if (!box.checked && pos >= 0) done.splice(pos, 1);
      progress[name] = done.slice();
      store.set("lessons", { ...progress });
      update();
      if (done.length === lessons.length) toast("Course finished. Well done!");
    }));
  };
  return [html, bind];
};

V.student.profile = () => {
  const courses = coursesFor(ME);
  const myCerts = getCerts().filter(c => c.sid === ME.id);
  return [
    head("Academic Profile", "Grades, courses and skills") + `<div class="grid g2">
      <div class="card"><h2>Courses</h2><div class="tbl"><table><thead><tr><th>Course</th><th>Current</th><th>Forecast</th></tr></thead><tbody>
        ${courses.map(x => `<tr><td><a class="link" href="${courseLink(x.c)}">${x.c}</a></td><td>${x.now}</td><td>${x.pred}</td></tr>`).join("")}
      </tbody></table></div></div>
      <div class="card"><h2>Skills</h2><div class="list">
        ${SK.map(s => `<div><div class="row sp"><b>${s.n}</b><span class="sub">${s.now} / target ${s.goal}</span></div><div class="bar"><span style="width:${s.now}%"></span></div></div>`).join("")}
      </div></div></div>
    <div class="card" style="margin-top:16px"><h2>Certificates</h2><div class="list">
      ${myCerts.length ? myCerts.map(x => `<div class="row sp"><div><b>${esc(x.file)}</b><div class="sub">${esc(x.skill)}, ${x.hours} hours</div></div>${statusPill(x.status)}</div>`).join("") : '<p class="sub">No certificates yet.</p>'}
    </div></div>`
  ];
};

V.student.progress = () => [head("Learning Progress", "Your cumulative GPA after each finished term, and the forecast for this term") + `<div class="card">${trend(ME.hist, ME.pred)}</div>`];

V.student.predicted = () => [
  head("Predicted Performance", "Forecast and risk level for each course. Select a course to study it.") + `<div class="card"><div class="list">
    ${coursesFor(ME).map(c => {
      const l = gradeLevel(c.pred);
      const cls = c.pred < c.now - 4 ? "p-red" : c.pred < c.now ? "p-amber" : "p-green";
      return `<div><div class="row sp wrap"><a href="${courseLink(c.c)}"><b>${c.c}</b></a>
        <span><span class="pill ${cls}">${c.now} to ${c.pred}</span> <span class="pill ${l[1]}">${l[0]} risk</span></span></div>
        <div class="bar"><span style="width:${c.pred}%;background:${c.pred < 65 ? "#c4423a" : "#0d7a85"}"></span></div></div>`;
    }).join("")}</div></div>`
];

V.student.skills = () => [
  head("Skill Gap Analysis", "Skills now compared with your target career path") + `<div class="grid g2">
    <div class="card"><h2>Your digital twin</h2>${radar(SK)}</div>
    <div class="card"><h2>Skill gaps</h2><div class="list">
      ${skillGaps().map(s => `<div><div class="row sp"><b>${s.n}</b><span class="pill ${s.g > 25 ? "p-red" : "p-amber"}">${s.g} to go</span></div><div class="bar"><span style="width:${s.now}%"></span></div></div>`).join("")}
    </div></div></div>`
];

V.student.recs = () => {
  const draw = () => {
    const fb = store.get("fb", {});
    $("#recs").innerHTML = RE.map((r, i) => `<div class="row sp wrap"><div style="flex:1;min-width:200px"><b>${r.t}</b><div class="sub">${r.why}</div><span class="pill p-teal">${r.k}</span></div>
      <div class="row"><button class="btn ${fb[i] === "up" ? "" : "ghost"} fb" data-i="${i}" data-v="up">${fb[i] === "up" ? "Thanks" : "Helpful"}</button>
      <button class="btn ${fb[i] === "down" ? "" : "ghost"} fb" data-i="${i}" data-v="down">Not useful</button></div></div>`).join("");
    $$(".fb").forEach(b => b.onclick = () => {
      const f = store.get("fb", {});
      f[b.dataset.i] = b.dataset.v;
      store.set("fb", { ...f });
      draw();
      toast("Feedback saved. Your recommendations will improve.");
    });
  };
  return [head("Recommendations", "Rate each one so the system learns what helps you") + '<div class="card"><div class="list" id="recs"></div></div>', draw];
};

V.student.resources = () => [
  head("Learning Resources", "Materials for your missing skills") + `<div class="grid g2">
    ${skillGaps().map(s => `<div class="card"><div class="row sp"><h2>${s.n}</h2><span class="pill p-amber">${s.g} to go</span></div>
      <div class="list">${(RES[s.n] || []).map(x => `<div>${x}</div>`).join("")}</div></div>`).join("")}</div>`
];

V.student.guidance = () => {
  const first = { from: "Dr. Hayam Abdelmordy", text: "Please book a tutoring session for Algorithms before the midterm review.", date: "16/11/2026" };
  const all = [first].concat(store.get("gd", []).filter(m => m.to === ME.id));
  return [head("Advisor Guidance", "Messages from your advisor") + `<div class="card"><div class="list">
    ${all.map(m => `<div><div class="row sp"><b>${esc(m.from)}</b><span class="sub sm">${esc(m.date)}</span></div><div>${esc(m.text)}</div></div>`).join("")}</div></div>`];
};

V.student.upload = () => {
  const drawMine = () => {
    const mine = getCerts().filter(c => c.sid === ME.id);
    $("#empty").hidden = mine.length > 0 || $("#docs").children.length > 0;
    $("#mine").innerHTML = mine.map(x => `<div class="row sp"><div><b>${esc(x.file)}</b><div class="sub">${esc(x.skill)}, ${x.hours} hours</div></div>${statusPill(x.status)}</div>`).join("");
  };
  const html = head("Upload Certificate", "The system reads the certificate. Check the result before it goes to verification.") + `
    <div class="card" style="max-width:760px">
      <label class="drop"><b style="color:var(--ink)">Choose certificate files</b><div>PNG, JPG or PDF</div><input id="file" type="file" accept="image/*,.pdf" multiple hidden></label>
      <p class="sub" id="empty" style="margin-top:14px">No documents yet. Upload your first certificate to update your skills.</p>
      <div class="list" id="docs"></div><div class="list" id="mine"></div></div>`;
  const bind = () => {
    drawMine();
    $("#file").addEventListener("change", e => {
      Array.from(e.target.files).forEach(f => {
        const row = document.createElement("div");
        row.className = "row sp";
        row.innerHTML = '<div><b></b><div class="sub">Reading text...</div></div><span class="pill p-amber">Processing</span>';
        row.querySelector("b").textContent = f.name;
        $("#docs").prepend(row);
        $("#empty").hidden = true;
        // simulated OCR delay
        setTimeout(() => {
          row.querySelector(".sub").textContent = "Detected skill: Cloud Computing, 20 hours";
          const btn = document.createElement("button");
          btn.className = "btn";
          btn.textContent = "Confirm and send";
          btn.onclick = () => {
            const list = getCerts().slice();
            list.unshift({ id: "c" + Date.now(), sid: ME.id, who: ME.name, file: f.name, skill: "Cloud Computing", hours: 20, status: "Pending" });
            store.set("certs", list);
            addNote("advisor", "New certificate from " + ME.name + " is waiting for verification.", "#/credentials", "Verify credentials", ME.name + " uploaded " + f.name + " (Cloud Computing, 20 hours). Check it before it counts toward the skills.");
            row.remove();
            drawMine();
            toast("Certificate sent for verification.");
          };
          row.querySelector(".pill").replaceWith(btn);
        }, 1200);
      });
      e.target.value = "";
    });
  };
  return [html, bind];
};

V.student.askai = () => {
  const html = head("Ask AI", "Ask for an explanation of any topic. Answers come from a built-in knowledge base; the full system will search course material.") + `
    <div class="card" style="max-width:760px">
      <div class="chat" id="chat" aria-live="polite"><div class="msg ai">Hi! Ask me about Machine Learning, SQL, Cloud, Security, Networks or Dynamic Programming.</div></div>
      <form id="ask" class="row"><input id="q" placeholder="Type your question" aria-label="Question" required><button class="btn" type="submit">Ask</button></form></div>`;
  const bind = () => {
    const addMsg = (cls, text) => {
      const m = document.createElement("div");
      m.className = "msg " + cls;
      m.textContent = text;
      $("#chat").appendChild(m);
      $("#chat").scrollTop = 100000;
    };
    $("#ask").addEventListener("submit", e => {
      e.preventDefault();
      const q = $("#q").value.trim();
      if (!q) return;
      addMsg("me", q);
      $("#q").value = "";
      const hit = KB.find(k => k[0].test(q.toLowerCase()));
      addMsg("ai", hit ? hit[1] + " Suggested resource: " + hit[2] + "." : "I could not find that topic yet. Try one of the topics listed above.");
    });
  };
  return [html, bind];
};

V.student.notifications = args => notificationsView("student", args);

V.student.settings = () => {
  const p = getProfile("student");
  return [
    head("Profile Settings", "Your account details") + `<div class="card" style="max-width:520px"><form id="set">
      <label class="f" for="sn">Name</label><input id="sn" value="${esc(p.name)}" required>
      <label class="f" for="se">Email</label><input id="se" type="email" value="${esc(p.email)}" required>
      <button class="btn" style="margin-top:14px" type="submit">Save</button></form></div>`,
    () => $("#set").addEventListener("submit", e => {
      e.preventDefault();
      store.set("prof_student", { name: $("#sn").value.trim() || p.name, email: $("#se").value.trim() });
      toast("Profile saved.");
    })
  ];
};

V.advisor.dashboard = () => {
  const high = ST.filter(s => s.risk >= 70).length;
  const medium = ST.filter(s => s.risk >= 40 && s.risk < 70).length;
  const avgAtt = Math.round(ST.reduce((sum, s) => sum + s.att, 0) / ST.length);
  const pending = getCerts().filter(c => c.status === "Pending").length;
  return [
    head("Advisor dashboard", esc(getProfile("advisor").name) + " · Computer Science Department") + `<div class="grid g4" style="margin-bottom:16px">
      ${kpi("Students monitored", ST.length, '<span class="sub">This term</span>')}
      ${kpi("At risk", high + medium, `<span class="pill p-red">${high} high</span>`)}
      ${kpi("Medium risk", medium, '<span class="pill p-amber">Keep watching</span>')}
      ${kpi("Average attendance", avgAtt + "%", '<span class="sub">All students</span>')}</div>
    <div class="grid g3" style="margin-bottom:16px">
      ${kpi("Users", getUsers().length, '<a class="pill p-teal" href="#/users">Manage</a>')}
      ${kpi("Pending credentials", pending, '<a class="pill p-amber" href="#/credentials">Review</a>')}
      ${kpi("Grades entered", store.get("gradelog", []).length, '<a class="pill p-teal" href="#/grades">Enter grades</a>')}</div>
    <div class="card"><h2>Needs attention first</h2>${studentTable(byRisk(ST).slice(0, 3))}</div>`
  ];
};
V.advisor.search = searchView;
V.advisor.atrisk = () => [head("At-Risk Students", "Students with medium or high risk") + `<div class="card">${studentTable(byRisk(ST.filter(s => s.risk >= 40)))}</div>`];

V.advisor.students = () => {
  const html = head("My Students", "Select a student to open the full record") + `<div class="card">
    <div class="row sp wrap"><h2>All students</h2><select id="filter" style="width:160px" aria-label="Filter by risk"><option value="all">All levels</option><option>High</option><option>Medium</option><option>Low</option></select></div>
    <div id="tb"></div></div>`;
  const bind = () => {
    const draw = () => {
      const f = $("#filter").value;
      $("#tb").innerHTML = studentTable(byRisk(ST).filter(s => f === "all" || riskInfo(s.risk)[0] === f));
      bindRows();
    };
    $("#filter").onchange = draw;
    draw();
  };
  return [html, bind];
};

V.advisor.student = args => {
  const s = ST.find(x => x.id === args[0]);
  if (!s) return ['<a class="back" href="#/students">Back to students</a>' + head("Student not found", "")];
  const tab = ["predictions", "progress", "plans"].includes(args[1]) ? args[1] : "predictions";
  const r = riskInfo(s.risk);
  const tabs = [["predictions", "AI Predictions"], ["progress", "Progress"], ["plans", "Plans"]]
    .map(t => `<a href="#/student/${s.id}/${t[0]}" class="${t[0] === tab ? "on" : ""}">${t[1]}</a>`).join("");
  const top = '<a class="back" href="#/students">← Back to students</a>' +
    head(esc(s.name), s.id + " · GPA " + s.gpa.toFixed(2) + " · Attendance " + s.att + "%", `<span class="row"><span class="pill ${r[1]}">${r[0]} · ${s.risk}%</span><a class="btn ghost" href="#/grades">Enter grades</a></span>`) +
    `<div class="tabs">${tabs}</div>`;

  if (tab === "predictions") {
    return [top + `<div class="grid g2">
      <div class="card"><h2>Why the system flagged this student</h2><ul style="margin:10px 0 0 18px">${s.why.map(w => "<li>" + esc(w) + "</li>").join("")}</ul></div>
      <div class="card"><h2>Predicted grades</h2><div class="list">
        ${coursesFor(s).map(c => { const l = gradeLevel(c.pred); return `<div class="row sp"><b>${c.c}</b><span><span class="pill p-teal">${c.now} to ${c.pred}</span> <span class="pill ${l[1]}">${l[0]}</span></span></div>`; }).join("")}
      </div></div></div>`];
  }
  if (tab === "progress") {
    return [top + `<div class="card"><h2>GPA by term</h2>${trend(s.hist, s.pred)}</div>`];
  }
  const html = top + `<div class="grid g21">
    <div class="card"><h2>Saved plans</h2><div class="list" id="plans"></div><p class="sub" id="noplans">No plans for this student yet.</p></div>
    <div class="card"><h2>New plan</h2>${planForm()}</div></div>`;
  const bind = () => {
    const draw = () => {
      const mine = store.get("plans", []).filter(p => p.sid === s.id);
      $("#plans").innerHTML = planListHtml(mine);
      $("#noplans").hidden = mine.length > 0;
      $("#pnote").value = "";
    };
    draw();
    bindPlanForm(s.id, draw);
  };
  return [html, bind];
};

function planForm() {
  return `<form id="plan"><label class="f" for="ptype">Plan type</label>
    <select id="ptype"><option>Weekly check-in</option><option>Tutoring sessions</option><option>Attendance follow-up</option><option>Course load review</option></select>
    <label class="f" for="pnote">Details</label><textarea id="pnote" rows="4" placeholder="Describe the support you will give..."></textarea>
    <button class="btn" style="margin-top:12px" type="submit">Save intervention plan</button></form>`;
}
function bindPlanForm(sid, after) {
  $("#plan").addEventListener("submit", e => {
    e.preventDefault();
    const note = $("#pnote").value.trim();
    if (!note) { toast("Write the plan details first."); return; }
    const s = ST.find(x => x.id === sid);
    const plans = store.get("plans", []).slice();
    plans.unshift({ sid: sid, who: s.name, type: $("#ptype").value, note: note, date: today() });
    store.set("plans", plans);
    if (sid === ME.id) addNote("student", "Your advisor saved a new plan: " + $("#ptype").value + ".", "#/dashboard", "Go to dashboard", "Type: " + $("#ptype").value + "\n\n" + note);
    toast("Plan saved for " + s.name + ".");
    after();
  });
}

V.advisor.plans = () => [
  head("Intervention Plans", "All saved plans") + '<div class="card"><p class="sub" id="noplans">No plans yet. Open a student and save one.</p><div class="list" id="plans"></div></div>',
  () => {
    const plans = store.get("plans", []);
    $("#plans").innerHTML = planListHtml(plans);
    $("#noplans").hidden = plans.length > 0;
  }
];

V.advisor.guidance = () => {
  const html = head("Send Guidance", "Send advice to a student") + `<div class="grid g2">
    <div class="card"><form id="gf"><label class="f" for="gs">Student</label>
      <select id="gs">${ST.map(s => `<option value="${s.id}">${esc(s.name)}</option>`).join("")}</select>
      <label class="f" for="gt">Message</label><textarea id="gt" rows="5" required></textarea>
      <button class="btn" style="margin-top:12px" type="submit">Send</button></form></div>
    <div class="card"><h2>Sent messages</h2><p class="sub" id="nog">Nothing sent yet.</p><div class="list" id="gl"></div></div></div>`;
  const bind = () => {
    const draw = () => {
      const sent = store.get("gd", []);
      $("#nog").hidden = sent.length > 0;
      $("#gl").innerHTML = sent.map(m => `<div><div class="row sp"><b>${esc(m.toName)}</b><span class="sub sm">${esc(m.date)}</span></div><div class="sub">${esc(m.text)}</div></div>`).join("");
    };
    draw();
    $("#gf").addEventListener("submit", e => {
      e.preventDefault();
      const text = $("#gt").value.trim();
      if (!text) { toast("Write a message first."); return; }
      const s = ST.find(x => x.id === $("#gs").value);
      const sent = store.get("gd", []).slice();
      sent.unshift({ to: s.id, toName: s.name, from: getProfile("advisor").name, text: text, date: today() });
      store.set("gd", sent);
      if (s.id === ME.id) addNote("student", "New guidance from your advisor.", "#/guidance", "Open Advisor Guidance", text);
      $("#gt").value = "";
      draw();
      toast("Guidance sent to " + s.name + ".");
    });
  };
  return [html, bind];
};
V.advisor.notifications = args => notificationsView("advisor", args);

V.advisor.users = () => {
  const html = head("Manage Users", "Add, disable or remove accounts") + `<div class="grid g21">
    <div class="card"><div class="tbl"><table><thead><tr><th>User</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody id="ut"></tbody></table></div></div>
    <div class="card"><h2>Add user</h2><form id="uf">
      <label class="f" for="un">Name</label><input id="un" required>
      <label class="f" for="ue">Email</label><input id="ue" type="email" required>
      <label class="f" for="ur">Role</label><select id="ur"><option>Student</option><option>Advisor</option></select>
      <button class="btn" style="margin-top:12px" type="submit">Add user</button></form></div></div>`;
  const bind = () => {
    const draw = () => {
      $("#ut").innerHTML = getUsers().map(u => `<tr><td><b>${esc(u.name)}</b><div class="sub sm">${esc(u.email)}</div></td><td>${u.role}</td>
        <td>${u.active ? '<span class="pill p-green">Active</span>' : '<span class="pill p-red">Disabled</span>'}</td>
        <td><button class="btn ghost sm" data-t="${esc(u.id)}">${u.active ? "Disable" : "Enable"}</button>
        ${u.id === "adv1" ? "" : `<button class="btn danger sm" data-d="${esc(u.id)}">Delete</button>`}</td></tr>`).join("");
      $$("[data-t]").forEach(b => b.onclick = () => {
        store.set("users", getUsers().map(u => u.id === b.dataset.t ? { ...u, active: !u.active } : u));
        draw();
      });
      $$("[data-d]").forEach(b => b.onclick = () => {
        store.set("users", getUsers().filter(u => u.id !== b.dataset.d));
        draw();
        toast("User deleted.");
      });
    };
    draw();
    $("#uf").addEventListener("submit", e => {
      e.preventDefault();
      const email = $("#ue").value.trim().toLowerCase();
      if (getUsers().some(u => u.email === email)) { toast("This email already exists."); return; }
      store.set("users", getUsers().concat([{ id: "u" + Date.now(), name: $("#un").value.trim(), email: email, role: $("#ur").value, active: true }]));
      $("#uf").reset();
      draw();
      toast("User added.");
    });
  };
  return [html, bind];
};

V.advisor.grades = () => {
  const students = getUsers().filter(u => u.role === "Student");
  const html = head("Enter Grades", "Grades entered here update the student's profile") + `<div class="grid g2">
    <div class="card"><form id="gf">
      <label class="f" for="gs">Student</label><select id="gs">${students.map(s => `<option value="${esc(s.id)}">${esc(s.name)}</option>`).join("")}</select>
      <label class="f" for="gc">Course</label><select id="gc">${CO.map(c => `<option>${c.c}</option>`).join("")}</select>
      <label class="f" for="gv">Grade (0 to 100)</label><input id="gv" type="number" min="0" max="100" step="1" required>
      <button class="btn" style="margin-top:12px" type="submit">Save grade</button></form></div>
    <div class="card"><h2>Recent entries</h2><p class="sub" id="nol">No grades entered yet.</p><div class="list" id="gl"></div></div></div>`;
  const bind = () => {
    const draw = () => {
      const log = store.get("gradelog", []);
      $("#nol").hidden = log.length > 0;
      $("#gl").innerHTML = log.slice(0, 10).map(x => `<div class="row sp"><div><b>${esc(x.who)}</b><div class="sub">${esc(x.course)}</div></div><span class="pill p-teal">${x.v}</span></div>`).join("");
    };
    draw();
    $("#gf").addEventListener("submit", e => {
      e.preventDefault();
      const value = Number($("#gv").value);
      if (!Number.isFinite(value) || value < 0 || value > 100) { toast("Grade must be between 0 and 100."); return; }
      const id = $("#gs").value, course = $("#gc").value;
      const who = $("#gs").selectedOptions[0].textContent;
      const grades = store.get("grades", {});
      grades[id] = { ...(grades[id] || {}), [course]: value };
      store.set("grades", { ...grades });
      store.set("gradelog", [{ who: who, course: course, v: value }].concat(store.get("gradelog", [])));
      if (id === ME.id) addNote("student", "A new grade was entered for " + course + ".", "#/profile", "Open Academic Profile", "Your grade in " + course + " is now " + value + " out of 100.");
      $("#gv").value = "";
      draw();
      toast("Grade saved.");
    });
  };
  return [html, bind];
};

V.advisor.credentials = () => {
  const bind = () => {
    const draw = () => {
      const list = getCerts();
      $("#cl").innerHTML = list.length ? list.map(c => `<div class="row sp wrap"><div style="flex:1;min-width:200px"><b>${esc(c.who)}</b>
        <div class="sub">${esc(c.file)} · ${esc(c.skill)}, ${c.hours} hours</div></div>
        ${c.status === "Pending" ? `<div class="row"><button class="btn sm" data-v="${c.id}" data-s="Verified">Verify</button><button class="btn danger sm" data-v="${c.id}" data-s="Rejected">Reject</button></div>` : statusPill(c.status)}</div>`).join("")
        : '<p class="sub">No certificates.</p>';
      $$("[data-v]").forEach(b => b.onclick = () => {
        const cert = getCerts().find(x => x.id === b.dataset.v);
        store.set("certs", getCerts().map(x => x.id === b.dataset.v ? { ...x, status: b.dataset.s } : x));
        if (cert && cert.sid === ME.id) addNote("student", "Your certificate " + cert.file + " was " + b.dataset.s.toLowerCase() + ".", "#/profile", "Open Academic Profile", "Your certificate " + cert.file + " (" + cert.skill + ", " + cert.hours + " hours) was " + b.dataset.s.toLowerCase() + " by your advisor."); 
        draw();
        toast("Certificate " + b.dataset.s.toLowerCase() + ".");
      });
    };
    draw();
  };
  return [head("Verify Credentials", "Check student certificates before they count") + '<div class="card"><div class="list" id="cl"></div></div>', bind];
};

function bindRows() {
  $$("tr[data-href]").forEach(tr => {
    tr.onclick = () => { location.hash = tr.dataset.href; };
    tr.onkeydown = e => { if (e.key === "Enter") tr.onclick(); };
  });
}

function drawSidebar(role, route) {
  // detail pages keep their parent item highlighted
  let active = route;
  if (route === "course") active = "dashboard";
  if (route === "student") active = "students";
  let links = "";
  MENU[role].forEach(item => {
    const count = item[0] === "notifications" ? unreadCount(role) : 0;
    const cls = "nav" + (item[0] === active ? " on" : "") + (item[0] === "settings" ? " out" : "");
    links += `<a class="${cls}" href="#/${item[0]}">${item[1]}${count ? `<span class="badge">${count}</span>` : ""}</a>`;
  });
  $("#side").innerHTML = '<a class="brand" href="/index.html"><i></i>Digital Twin</a>' + links + '<a class="nav out" href="/login.html" id="logout">Logout</a>';
  $("#logout").onclick = () => store.set("role", null);
}

function render() {
  const role = store.get("role", null);
  if (!role || !MENU[role]) { location.replace("/login.html"); return; }
  const parts = location.hash.replace(/^#\//, "").split("/");
  let route = parts.shift() || "dashboard";
  const allowed = MENU[role].some(m => m[0] === route) || HIDDEN[role].includes(route);
  if (!allowed) route = "dashboard";
  const result = V[role][route](parts);
  drawSidebar(role, route);
  $("#main").innerHTML = result[0];
  if (result[1]) result[1]();
  bindRows();
}

const page = document.body.dataset.page;
if (page === "home") $("#hero-radar").innerHTML = radar(SK);
if (page === "login") {
  $("#form").addEventListener("submit", e => {
    e.preventDefault();
    store.set("role", document.querySelector("input[name=role]:checked").value);
   location.href = "/Home/Dashboard#/dashboard";
  });
}
if (page === "app") {
  render();
  window.addEventListener("hashchange", () => { render(); window.scrollTo(0, 0); });
}
