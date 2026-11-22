DT.views.shared.studentSearch = {
  render(o) {
    return DT.head(o.title, o.sub) + `<div class="card"><div class="search">
      <div><label class="f" for="q" style="margin-top:0">Name or student ID</label><input id="q" type="search" placeholder="Start typing..." autocomplete="off"></div>
      <div><label class="f" for="rf" style="margin-top:0">Risk level</label><select id="rf"><option value="all">All levels</option><option>High</option><option>Medium</option><option>Low</option></select></div>
      <div></div></div>
      <p class="sub" id="count" style="margin:14px 0 4px" aria-live="polite"></p><div id="results"></div></div>`;
  },
  bind() {
    const run = () => DT.controllers.StudentSearch.search(DT.$("#q").value.trim(), DT.$("#rf").value);
    DT.$("#q").addEventListener("input", run);
    DT.$("#rf").addEventListener("change", run);
  },
  fill(list, q, base) {
    DT.$("#count").textContent = list.length + " student(s)";
    const rows = list.map(s => `<tr class="click" tabindex="0" data-href="${DT.href(base, s.id)}">
      <td><b>${DT.highlight(s.name, q)}</b><div class="sub sm">${DT.highlight(s.id, q)}</div></td>
      <td>${s.gpa.toFixed(2)}</td><td>${s.attendance}%</td><td>${s.predictedGpa.toFixed(2)}</td>
      <td style="min-width:120px">${DT.pill(s.riskLevel + " · " + s.riskScore + "%", DT.levelClass(s.riskLevel))}<div class="bar"><span style="width:${s.riskScore}%;background:${DT.levelColor(s.riskLevel)}"></span></div></td></tr>`).join("");
    DT.$("#results").innerHTML = list.length
      ? `<div class="tbl"><table><thead><tr><th>Student</th><th>GPA</th><th>Attendance</th><th>Predicted</th><th>Risk</th></tr></thead><tbody>${rows}</tbody></table></div>`
      : '<p class="sub">No students match your search.</p>';
    DT.$$("#results tr[data-href]").forEach(tr => {
      tr.onclick = () => { location.href = tr.dataset.href; };
      tr.onkeydown = e => { if (e.key === "Enter") tr.onclick(); };
    });
  }
};
