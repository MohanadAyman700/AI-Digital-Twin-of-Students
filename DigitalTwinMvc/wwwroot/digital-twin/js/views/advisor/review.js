DT.views.advisor.review = {
  render(d) {
    const s = d.student;
    return '<a class="back" href="' + DT.href("review") + '">← Back to students</a>' +
      DT.head(DT.esc(s.name), s.id + " · GPA " + s.gpa.toFixed(2) + " · Predicted " + s.predictedGpa.toFixed(2) + " · Attendance " + s.attendance + "%", DT.pill(s.riskLevel + " · " + s.riskScore + "%", DT.levelClass(s.riskLevel))) +
      `<div class="tabs"><a class="on" href="${DT.href('review', s.id)}">AI Predictions</a><a href="${DT.href('monitor', s.id)}">Progress</a><a href="${DT.href('plans', s.id)}">Plans</a></div>
      <div class="grid g2"><div class="card"><h2>Why the system flagged this student</h2><ul style="margin:10px 0 0 18px">${d.reasons.map(r => "<li>" + DT.esc(r) + "</li>").join("")}</ul></div>
      <div class="card"><h2>Predicted grades</h2><div class="list">${d.courses.map(c => `<div class="row sp"><b>${DT.esc(c.course)}</b><span>${DT.pill(c.current + " to " + c.predicted, "p-teal")} ${DT.pill(c.risk, DT.levelClass(c.risk))}</span></div>`).join("")}</div></div></div>`;
  }
};
