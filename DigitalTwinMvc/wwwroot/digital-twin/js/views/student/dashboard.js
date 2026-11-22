DT.views.student.dashboard = {
  render(d) {
    const alerts = d.alerts.map(a => `<div class="alert" role="alert">${DT.esc(a)}</div>`).join("");
    return DT.head("Welcome back, " + DT.esc(d.name.split(" ")[0]), DT.esc(d.name) + " · Computer Science, Year 4", '<span class="pill p-teal">Predictions support decisions and do not replace advisors</span>') + alerts +
      `<div class="grid g3" style="margin-bottom:16px">
        ${DT.kpi("Current GPA", d.gpa.toFixed(2), '<span class="sub">Out of 4.00</span>')}
        ${DT.kpi("Attendance", d.attendance + "%", DT.pill(d.attendance >= 85 ? "On track" : "Low", d.attendance >= 85 ? "p-green" : "p-red"))}
        ${DT.kpi("Risk level", d.riskLevel, DT.pill(d.riskScore + "%", DT.levelClass(d.riskLevel)))}</div>
      <div class="grid g2"><div class="card"><h2>Your digital twin</h2><p class="sub">Skills now compared with your target career path.</p>${DT.charts.radar(d.skills)}</div>
      <div class="card"><h2>Go to</h2><div class="list">
        <div><a class="link" href="${DT.href('profile')}">Academic profile</a></div><div><a class="link" href="${DT.href('progress')}">Learning progress</a></div>
        <div><a class="link" href="${DT.href('upload')}">Upload a certificate</a></div><div><a class="link" href="${DT.href('ask')}">Ask the AI</a></div></div></div></div>`;
  }
};
