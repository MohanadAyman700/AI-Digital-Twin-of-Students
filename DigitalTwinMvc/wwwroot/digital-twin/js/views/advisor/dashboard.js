DT.views.advisor.dashboard = {
  render(d) {
    const rows = d.topRisk.map(s => `<tr class="click" tabindex="0" data-href="${DT.href('review', s.id)}"><td><b>${DT.esc(s.name)}</b><div class="sub sm">${s.id}</div></td>
      <td>${DT.pill(s.riskLevel + " · " + s.riskScore + "%", DT.levelClass(s.riskLevel))}</td></tr>`).join("");
    return DT.head("Advisor dashboard", "Computer Science Department") +
      `<div class="grid g4" style="margin-bottom:16px">${DT.kpi("Students monitored", d.total, '<span class="sub">This term</span>')}${DT.kpi("At risk", d.high + d.medium, DT.pill(d.high + " high", "p-red"))}
      ${DT.kpi("Medium risk", d.medium, DT.pill("Keep watching", "p-amber"))}${DT.kpi("Average attendance", d.averageAttendance + "%", '<span class="sub">All students</span>')}</div>
      <div class="card"><h2>Needs attention first</h2><div class="tbl"><table><tbody>${rows}</tbody></table></div></div>`;
  },
  bind() {
    DT.$$("tr[data-href]").forEach(tr => { tr.onclick = () => { location.href = tr.dataset.href; }; });
  }
};
