DT.views.student.profile = {
  render(d) {
    const certs = d.certificates.length
      ? d.certificates.map(c => `<div class="row sp"><div><b>${DT.esc(c.fileName)}</b><div class="sub">${DT.esc(c.skill)}, ${c.hours} hours</div></div>${DT.statusPill(c.status)}</div>`).join("")
      : '<p class="sub">No certificates yet.</p>';
    return DT.head("Academic Profile", DT.esc(d.name) + " · " + d.id + " · " + DT.esc(d.major)) +
      `<div class="grid g2"><div class="card"><h2>Courses</h2><div class="tbl"><table><thead><tr><th>Course</th><th>Current grade</th></tr></thead><tbody>
        ${d.courses.map(c => `<tr><td>${DT.esc(c.course)}</td><td>${c.current}</td></tr>`).join("")}</tbody></table></div></div>
      <div class="card"><h2>Skills</h2><div class="list">${d.skills.map(s => `<div><div class="row sp"><b>${DT.esc(s.name)}</b><span class="sub">${s.current} / target ${s.target}</span></div><div class="bar"><span style="width:${s.current}%"></span></div></div>`).join("")}</div></div></div>
      <div class="card" style="margin-top:16px"><h2>Certificates</h2><div class="list">${certs}</div></div>`;
  }
};
