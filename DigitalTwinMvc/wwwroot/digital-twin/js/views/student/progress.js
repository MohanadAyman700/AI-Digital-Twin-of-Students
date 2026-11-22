DT.views.student.progress = {
  render(d) {
    return DT.head("Learning Progress", "Your GPA in each term") +
      `<div class="grid g2"><div class="card"><h2>GPA by term</h2>${DT.charts.trend(d.terms)}</div>
      <div class="card"><h2>Terms</h2><div class="list">${d.terms.map(t => `<div class="row sp"><b>${DT.esc(t.term)}</b><span class="pill p-teal">${t.gpa.toFixed(2)}</span></div>`).join("")}
      <div class="row sp"><b>Attendance</b><span class="pill p-teal">${d.attendance}%</span></div></div></div></div>`;
  }
};
