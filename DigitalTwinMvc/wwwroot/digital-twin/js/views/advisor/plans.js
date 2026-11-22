DT.views.advisor.plans = {
  render(d) {
    const s = d.student;
    return '<a class="back" href="' + DT.href("plans") + '">← Back to students</a>' +
      DT.head(DT.esc(s.name), s.id, DT.pill(s.riskLevel + " · " + s.riskScore + "%", DT.levelClass(s.riskLevel))) +
      `<div class="tabs"><a href="${DT.href('review', s.id)}">AI Predictions</a><a href="${DT.href('monitor', s.id)}">Progress</a><a class="on" href="${DT.href('plans', s.id)}">Plans</a></div>
      <div class="grid g21"><div class="card"><h2>Saved plans</h2><p class="sub" id="noplans">No plans for this student yet.</p><div class="list" id="plans"></div></div>
      <div class="card"><h2>New plan</h2><form id="plan"><label class="f" for="ptype">Plan type</label>
        <select id="ptype"><option>Weekly check-in</option><option>Tutoring sessions</option><option>Attendance follow-up</option><option>Course load review</option></select>
        <label class="f" for="pnote">Details</label><textarea id="pnote" rows="4" placeholder="Describe the support you will give..."></textarea>
        <button class="btn" style="margin-top:12px" type="submit">Save intervention plan</button></form></div></div>`;
  },
  bind(studentId) {
    DT.$("#plan").addEventListener("submit", e => {
      e.preventDefault();
      DT.controllers.PlanController.save(studentId, DT.$("#ptype").value, DT.$("#pnote").value);
    });
  },
  fill(plans) {
    DT.$("#noplans").hidden = plans.length > 0;
    DT.$("#plans").innerHTML = plans.map(p => `<div><div class="row sp"><b>${DT.esc(p.type)}</b><span class="sub sm">${DT.esc(p.date)}</span></div><div class="sub">${DT.esc(p.details)}</div></div>`).join("");
    DT.$("#pnote").value = "";
  }
};
