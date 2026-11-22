const MockServer = (function () {
  const KEY = "dt_db_v3";
  let db = null;

  const clamp = v => Math.max(0, Math.min(100, v));
  const levelOf = r => (r >= 70 ? "High" : r >= 40 ? "Medium" : "Low");
  const gradeLevel = p => (p < 60 ? "High" : p < 70 ? "Medium" : "Low");
  const fail = (status, message) => { const e = new Error(message); e.status = status; throw e; };
  let counter = 1;
  const newId = prefix => prefix + Date.now() + "_" + (counter++);

  const SKILLS = [["Python", 78, 90], ["Machine Learning", 52, 85], ["SQL", 74, 80], ["React", 82, 80], ["Cloud", 38, 70], ["Security", 44, 65]];
  
  const COURSES = [["Data Structures", 88, 85], ["Databases", 74, 72], ["Machine Learning", 69, 63], ["Web Development", 91, 92], ["Algorithms", 61, 56], ["Computer Networks", 78, 79]];
  const KB = [
    [/dynamic|\bdp\b/, "Dynamic programming solves a problem by splitting it into overlapping subproblems and storing each answer so it is computed once.", "Algorithms lecture notes"],
    [/machine|\bml\b|learning/, "Machine learning finds patterns in data to make predictions. Start with linear regression and always test on data the model has not seen.", "Machine Learning course material"],
    [/sql|database|join/, "SQL queries describe what data you want. JOIN combines tables on matching keys, GROUP BY summarizes rows, and an index speeds up lookups.", "Databases lecture notes"],
    [/cloud|aws/, "Cloud computing rents servers, storage and databases over the internet. Learn compute, storage, networking and IAM first.", "Cloud practitioner guide"],
    [/secur|xss|injection/, "Web security starts with validating input, escaping output, using HTTPS and storing passwords hashed.", "Web security course"],
    [/network|tcp|\bip\b/, "Networks move data in layers. TCP gives reliable delivery, IP handles addressing and routing, and DNS turns names into addresses.", "Computer Networks lecture notes"]
  ];

  function seed() {
    const students = [
      { id: "420230300", name: "Muhannad Ayman", gpa: 3.6, att: 96, pred: 3.6, risk: 12, hist: [3.4, 3.5, 3.55, 3.6], why: ["Stable grades", "Attendance above 95%"] },
      { id: "420241009", name: "Omar Hassanien", gpa: 3.21, att: 91, pred: 3.12, risk: 34, hist: [3.0, 3.1, 3.2, 3.21], why: ["Algorithms grade falling", "Machine Learning below 70"] },
      { id: "420231068", name: "Salah-Eldien Mohammad", gpa: 2.4, att: 72, pred: 2.1, risk: 78, hist: [2.9, 2.7, 2.5, 2.4], why: ["Attendance fell 18% this term", "Two failed quizzes in Databases", "No activity logged for 3 weeks"] },
      { id: "420230163", name: "Saeed Qassim", gpa: 2.9, att: 83, pred: 2.8, risk: 49, hist: [3.1, 3.0, 2.95, 2.9], why: ["Networks grade dropped 9 points", "Late submissions in 3 courses"] },
      { id: "420220412", name: "Mostafa Ghallab", gpa: 2.2, att: 68, pred: 1.9, risk: 86, hist: [2.8, 2.5, 2.3, 2.2], why: ["Attendance below 70%", "Predicted GPA under 2.0", "Missing two assignments"] },
      { id: "420230088", name: "Ibrahim Hassan", gpa: 3.3, att: 90, pred: 3.3, risk: 18, hist: [3.2, 3.25, 3.3, 3.3], why: ["Consistent performance"] },
      { id: "420230909", name: "Hassan Hany", gpa: 2.7, att: 80, pred: 2.6, risk: 57, hist: [3.0, 2.9, 2.8, 2.7], why: ["Weak result in Algorithms midterm", "Attendance trending down"] }
    ];
    const users = students.map(s => ({ id: s.id, name: s.name, email: s.name.split(" ")[0].toLowerCase().replace(/[^a-z]/g, "") + "@fa-hists.edu.eg", password: "1234", role: "Student", active: true }));
    users.push({ id: "adv1", name: "Dr. Hayam Abdelmordy", email: "hayam@fa-hists.edu.eg", password: "1234", role: "Advisor", active: true });
    users.push({ id: "adm1", name: "System Admin", email: "admin@fa-hists.edu.eg", password: "1234", role: "Admin", active: true });
    return {
      users: users, students: students, grades: {}, gradelog: [], bonus: {}, feedback: {}, plans: [], guidance: [],
      certs: [
        { id: "c1", sid: "420231068", who: "Salah-Eldien Mohammad", fileName: "aws-cloud-cert.pdf", skill: "Cloud Computing", hours: 20, status: "Pending" },
        { id: "c2", sid: "420230163", who: "Saeed Qassim", fileName: "python-bootcamp.png", skill: "Python", hours: 40, status: "Pending" },
        { id: "c3", sid: "420230300", who: "Muhannad Ayman", fileName: "sql-advanced.pdf", skill: "SQL", hours: 30, status: "Verified" }
      ],
      notes: {
        "420241009": [
          { id: "n1", title: "Your Algorithms grade is low.", message: "Your Algorithms score is 61. Ask the AI to explain the topics you find hard.", date: "Today", read: false, link: "#/ask", linkText: "Ask AI" },
          { id: "n2", title: "Dr. Hayam sent you guidance.", message: "Please book a tutoring session for Algorithms before the midterm review.", date: "Yesterday", read: false, link: "", linkText: "" }
        ],
        "adv1": [
          { id: "n3", title: "Mostafa Ghallab moved to high risk.", message: "Mostafa Ghallab's risk is now 86%. Attendance is below 70% and two assignments are missing. Consider creating an intervention plan.", date: "Today", read: false, link: "#/plans/420220412", linkText: "Create a plan" },
          { id: "n4", title: "Salah-Eldien Mohammad has no activity for 3 weeks.", message: "No logins or submissions for three weeks. His risk level is High.", date: "Yesterday", read: false, link: "#/review/420231068", linkText: "Review predictions" }
        ],
        "adm1": [
          { id: "n5", title: "2 certificates are waiting for verification.", message: "Two students uploaded certificates. Check them before they count toward the skills.", date: "Today", read: false, link: "#/credentials", linkText: "Verify credentials" }
        ]
      }
    };
  }
  function load() {
    if (db) return db;
    try { const saved = localStorage.getItem(KEY); if (saved) { db = JSON.parse(saved); return db; } } catch (e) { /* ignore */ }
    db = seed();
    return db;
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) { /* ignore */ } }

  
  const studentOf = id => db.students.find(s => s.id === id) || fail(404, "Student not found.");
  const summary = s => ({ id: s.id, name: s.name, gpa: s.gpa, attendance: s.att, predictedGpa: s.pred, riskScore: s.risk, riskLevel: levelOf(s.risk) });
  function notify(uid, title, message, link, linkText) {
    if (!db.notes[uid]) db.notes[uid] = [];
    db.notes[uid].unshift({ id: newId("n"), title: title, message: message, date: "Just now", read: false, link: link || "", linkText: linkText || "" });
  }
  function courseScores(id) {
    const s = studentOf(id), entered = db.grades[id] || {};
    const offset = Math.round((s.gpa - 3.21) * 15), extra = Math.round((s.gpa - s.pred - 0.09) * 30);
    return COURSES.map(c => {
      const current = c[0] in entered ? entered[c[0]] : clamp(c[1] + offset);
      const predicted = clamp(current - (c[1] - c[2]) - extra);
      return { course: c[0], current: current, predicted: predicted, risk: gradeLevel(predicted) };
    });
  }
  function skillsOf(id) {
    const bonus = db.bonus[id] || {};
    return SKILLS.map(s => ({ name: s[0], current: clamp(s[1] + (bonus[s[0]] || 0)), target: s[2] }));
  }
  function skillKey(name) {
    const n = name.toLowerCase();
    const hit = SKILLS.find(s => n.indexOf(s[0].toLowerCase()) === 0 || s[0].toLowerCase().indexOf(n) === 0);
    return hit ? hit[0] : null;
  }
  const publicUser = u => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active });

  async function handle(method, path, body, token) {
    await new Promise(r => setTimeout(r, 40));
    load();
    const parts = path.split("?"), p = parts[0], q = {};
    new URLSearchParams(parts[1] || "").forEach((v, k) => { q[k] = v; });
    body = body || {};
    let m;
    const is = (verb, re) => method === verb && (m = p.match(re));
    const done = data => { save(); return JSON.parse(JSON.stringify(data === undefined ? null : data)); };

    if (is("POST", /^\/api\/auth\/login$/)) {
      const email = String(body.email || "").trim().toLowerCase();
      const u = db.users.find(x => x.email === email && x.password === body.password);
      if (!u) fail(401, "Wrong email or password.");
      if (!u.active) fail(403, "This account is disabled. Contact the administrator.");
      return done({ token: "mock-" + u.id, user: publicUser(u) });
    }

    const me = db.users.find(u => "mock-" + u.id === token);
    if (!me || !me.active) fail(401, "Please log in again.");
    const only = role => { if (me.role !== role) fail(403, "You are not allowed to do this."); };

    const mine = () => db.notes[me.id] || (db.notes[me.id] = []);
    if (is("GET", /^\/api\/notifications$/)) return done(mine());
    if (is("POST", /^\/api\/notifications\/read-all$/)) { mine().forEach(n => { n.read = true; }); return done({ ok: true }); }
    if (is("POST", /^\/api\/notifications\/([^/]+)\/(read|unread)$/)) {
      const n = mine().find(x => x.id === m[1]) || fail(404, "Notification not found.");
      n.read = m[2] === "read";
      return done(n);
    }
    if (is("DELETE", /^\/api\/notifications\/([^/]+)$/)) { db.notes[me.id] = mine().filter(x => x.id !== m[1]); return done({ ok: true }); }

  
    if (p.indexOf("/api/student/") === 0) {
      only("Student");
      const s = studentOf(me.id);
      if (is("GET", /^\/api\/student\/dashboard$/)) {
        const d = summary(s);
        d.skills = skillsOf(s.id);
        d.alerts = s.risk >= 40 ? ["Warning: your risk level is " + levelOf(s.risk) + ". Talk to your advisor soon."] : [];
        return done(d);
      }
      if (is("GET", /^\/api\/student\/profile$/)) {
        const d = summary(s);
        d.major = "Computer Science, Year 4";
        d.courses = courseScores(s.id);
        d.skills = skillsOf(s.id);
        d.certificates = db.certs.filter(c => c.sid === s.id);
        return done(d);
      }
      if (is("GET", /^\/api\/student\/progress$/)) return done({ attendance: s.att, terms: s.hist.map((g, i) => ({ term: "Term " + (i + 1), gpa: g })) });
      // Upload certificate: step 1, OCR reads the file
      if (is("POST", /^\/api\/student\/certificates\/ocr$/)) {
        const f = String(body.fileName || "").toLowerCase();
        const hit = /python/.test(f) ? ["Python", 40] : /sql/.test(f) ? ["SQL", 30] : ["Cloud", 20];
        return done({ skill: hit[0], hours: hit[1], confidence: 0.93 });
      }
      if (is("POST", /^\/api\/student\/certificates$/)) {
        const hours = Number(body.hours);
        if (!body.fileName || !body.skill || !(hours > 0)) fail(400, "File name, skill and hours are required.");
        const cert = { id: newId("c"), sid: s.id, who: s.name, fileName: body.fileName, skill: body.skill, hours: hours, status: "Pending" };
        db.certs.unshift(cert);
        db.users.filter(u => u.role === "Admin").forEach(a => notify(a.id, "New certificate from " + s.name + " is waiting for verification.", s.name + " uploaded " + cert.fileName + " (" + cert.skill + ", " + cert.hours + " hours).", "#/credentials", "Verify credentials"));
        return done(cert);
      }
      if (is("POST", /^\/api\/student\/ask$/)) {
        const text = String(body.question || "").trim(), low = text.toLowerCase();
        if (!text) fail(400, "Write a question first.");
        const gaps = skillsOf(s.id).map(x => ({ name: x.name, gap: x.target - x.current })).filter(x => x.gap > 0).sort((a, b) => b.gap - a.gap);
        const personal = answer => done({ found: true, topic: false, answer: answer, source: "Your digital twin" });
        if (/skill gap|my skills|weak|gaps?\b/.test(low)) {
          return personal(gaps.length ? "Your biggest skill gaps: " + gaps.slice(0, 3).map(g => g.name + " (" + g.gap + " points to go)").join(", ") + "." : "You reached every skill target.");
        }
        if (/recommend|resource|suggest|what should i (study|learn)/.test(low)) {
          const tips = { "Machine Learning": "Machine Learning Crash Course", "Cloud": "AWS Cloud Practitioner Path", "Security": "Intro to Web Application Security", "Python": "Advanced Python patterns", "SQL": "Window functions workshop" };
          return personal(gaps.length ? "Start with: " + gaps.slice(0, 3).map(g => (tips[g.name] || g.name) + " (for " + g.name + ")").join("; ") + "." : "You are on target. Try a new skill for your career path.");
        }
        if (/how am i|my (gpa|grades?|performance|risk)|perform/.test(low)) {
          const low1 = courseScores(s.id).sort((a, b) => a.current - b.current)[0];
          return personal("Your GPA is " + s.gpa.toFixed(2) + ", your attendance is " + s.att + "% and your risk level is " + levelOf(s.risk) + ". Your lowest course now is " + low1.course + " (" + low1.current + ").");
        }
        const hit = KB.find(k => k[0].test(low));
        return done(hit ? { found: true, topic: true, answer: hit[1], source: hit[2] } : { found: false, topic: false, answer: "I could not find that topic in the course material yet.", source: "" });
      }
    
      if (is("POST", /^\/api\/student\/ask\/video$/)) return done({ title: "Video explanation: " + String(body.question || "").slice(0, 60), url: "", status: "Generated (demo, no real video yet)" });
    }


    if (p.indexOf("/api/advisor/") === 0) {
      only("Advisor");
      if (is("GET", /^\/api\/advisor\/dashboard$/)) {
        const list = db.students.slice().sort((a, b) => b.risk - a.risk);
        return done({
          total: list.length, high: list.filter(s => s.risk >= 70).length, medium: list.filter(s => s.risk >= 40 && s.risk < 70).length,
          averageAttendance: Math.round(list.reduce((t, s) => t + s.att, 0) / list.length), topRisk: list.slice(0, 3).map(summary)
        });
      }
      if (is("GET", /^\/api\/advisor\/students$/)) {
        const text = String(q.q || "").toLowerCase();
        let list = db.students.filter(s => !text || s.name.toLowerCase().indexOf(text) >= 0 || s.id.indexOf(text) >= 0);
        if (q.risk && q.risk !== "all") list = list.filter(s => levelOf(s.risk) === q.risk);
        if (q.atRisk === "true") list = list.filter(s => s.risk >= 40);
        return done(list.sort((a, b) => b.risk - a.risk).map(summary));
      }
      if (is("GET", /^\/api\/advisor\/students\/([^/]+)\/predictions$/)) {
        const s = studentOf(m[1]);
        return done({ student: summary(s), reasons: s.why, courses: courseScores(s.id) });
      }
      if (is("GET", /^\/api\/advisor\/students\/([^/]+)\/progress$/)) {
        const s = studentOf(m[1]);
        return done({ student: summary(s), terms: s.hist.map((g, i) => ({ term: "Term " + (i + 1), gpa: g })) });
      }
      if (is("GET", /^\/api\/advisor\/plans$/)) return done(db.plans.filter(x => !q.studentId || x.studentId === q.studentId));
      if (is("POST", /^\/api\/advisor\/plans$/)) {
        const s = studentOf(body.studentId);
        if (!String(body.details || "").trim()) fail(400, "Write the plan details first.");
        const plan = { id: newId("p"), studentId: s.id, studentName: s.name, type: body.type, details: String(body.details).trim(), date: new Date().toLocaleDateString("en-GB") };
        db.plans.unshift(plan);
        notify(s.id, "Your advisor saved a new plan: " + plan.type + ".", "Type: " + plan.type + "\n\n" + plan.details, "", "");
        return done(plan);
      }
      if (is("GET", /^\/api\/advisor\/guidance$/)) return done(db.guidance);
      if (is("POST", /^\/api\/advisor\/guidance$/)) {
        const s = studentOf(body.studentId);
        if (!String(body.message || "").trim()) fail(400, "Write a message first.");
        const g = { id: newId("g"), studentId: s.id, studentName: s.name, message: String(body.message).trim(), date: new Date().toLocaleDateString("en-GB") };
        db.guidance.unshift(g);
        notify(s.id, "New guidance from your advisor.", g.message, "", "");
        return done(g);
      }
    }

    if (p.indexOf("/api/admin/") === 0) {
      only("Admin");
      if (is("GET", /^\/api\/admin\/dashboard$/)) {
        return done({ users: db.users.length, students: db.users.filter(u => u.role === "Student").length, pendingCredentials: db.certs.filter(c => c.status === "Pending").length, gradesEntered: db.gradelog.length });
      }
      if (is("GET", /^\/api\/admin\/users$/)) return done(db.users.filter(u => !q.role || u.role === q.role).map(publicUser));
      if (is("POST", /^\/api\/admin\/users$/)) {
        const email = String(body.email || "").trim().toLowerCase();
        if (!body.name || !email || !body.password) fail(400, "Name, email and password are required.");
        if (["Student", "Advisor", "Admin"].indexOf(body.role) < 0) fail(400, "Unknown role.");
        if (db.users.some(u => u.email === email)) fail(409, "This email already exists.");
        const u = { id: newId("u"), name: String(body.name).trim(), email: email, password: body.password, role: body.role, active: true };
        db.users.push(u);
        if (u.role === "Student") db.students.push({ id: u.id, name: u.name, gpa: 3.0, att: 90, pred: 3.0, risk: 25, hist: [3.0], why: ["New student, not enough data yet"] });
        return done(publicUser(u));
      }
      if (is("PATCH", /^\/api\/admin\/users\/([^/]+)$/)) {
        const u = db.users.find(x => x.id === m[1]) || fail(404, "User not found.");
        if (u.id === me.id) fail(400, "You cannot disable your own account.");
        u.active = !!body.active;
        return done(publicUser(u));
      }
      if (is("DELETE", /^\/api\/admin\/users\/([^/]+)$/)) {
        if (m[1] === me.id) fail(400, "You cannot delete your own account.");
        db.users = db.users.filter(u => u.id !== m[1]);
        db.students = db.students.filter(s => s.id !== m[1]);
        return done({ ok: true });
      }
      if (is("GET", /^\/api\/admin\/grades$/)) return done(db.gradelog.slice(0, 20));
      if (is("POST", /^\/api\/admin\/grades$/)) {
        const s = studentOf(body.studentId), score = Number(body.score);
        if (!COURSES.some(c => c[0] === body.course)) fail(400, "Unknown course.");
        if (body.score === "" || body.score === null || !Number.isFinite(score) || score < 0 || score > 100) fail(400, "Grade must be between 0 and 100.");
        db.grades[s.id] = Object.assign({}, db.grades[s.id], { [body.course]: score });
        const entry = { studentId: s.id, studentName: s.name, course: body.course, score: score };
        db.gradelog.unshift(entry);
        notify(s.id, "A new grade was entered for " + body.course + ".", "Your grade in " + body.course + " is now " + score + " out of 100.", "#/profile", "Open Academic Profile");
        return done(entry);
      }
      if (is("GET", /^\/api\/admin\/credentials$/)) return done(db.certs);
      if (is("POST", /^\/api\/admin\/credentials\/([^/]+)\/decision$/)) {
        const c = db.certs.find(x => x.id === m[1]) || fail(404, "Certificate not found.");
        if (body.decision !== "Verified" && body.decision !== "Rejected") fail(400, "Decision must be Verified or Rejected.");
        if (c.status !== "Pending") fail(409, "This certificate was already reviewed.");
        c.status = body.decision;
        let extra = "";
        if (c.status === "Verified") {
          const key = skillKey(c.skill);
          if (key) {
            const bump = Math.min(10, Math.round(c.hours / 4));
            db.bonus[c.sid] = Object.assign({}, db.bonus[c.sid], { [key]: ((db.bonus[c.sid] || {})[key] || 0) + bump });
            extra = " Your " + key + " skill went up by " + bump + " points.";
          }
        }
        notify(c.sid, "Your certificate " + c.fileName + " was " + c.status.toLowerCase() + ".", "Your certificate " + c.fileName + " (" + c.skill + ", " + c.hours + " hours) was " + c.status.toLowerCase() + "." + extra, "#/profile", "Open Academic Profile");
        return done(c);
      }
    }
    fail(404, "Not found: " + method + " " + p);
  }

  return { handle: handle, reset: function () { db = null; try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ } } };
})();
