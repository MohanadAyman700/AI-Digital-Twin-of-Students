DT.views.advisor.monitor = {
  render(d) {
    const s = d.student;
    return '<a class="back" href="' + DT.href("monitor") + '">← Back to students</a>' +
      DT.head(DT.esc(s.name), s.id + " · Attendance " + s.attendance + "%", DT.pill(s.riskLevel + " · " + s.riskScore + "%", DT.levelClass(s.riskLevel))) +
      `<div class="tabs"><a href="${DT.href('review', s.id)}">AI Predictions</a><a class="on" href="${DT.href('monitor', s.id)}">Progress</a><a href="${DT.href('plans', s.id)}">Plans</a></div>
      <div class="card"><h2>GPA by term</h2>${DT.charts.trend(d.terms)}</div>`;
  }
};
