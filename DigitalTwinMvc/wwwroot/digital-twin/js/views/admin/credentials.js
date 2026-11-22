DT.views.admin.credentials = {
  render(list) {
    const rows = list.length ? list.map(c => `<div class="row sp wrap"><div style="flex:1;min-width:200px"><b>${DT.esc(c.who)}</b>
      <div class="sub">${DT.esc(c.fileName)} · ${DT.esc(c.skill)}, ${c.hours} hours</div></div>
      ${c.status === "Pending" ? `<div class="row"><button class="btn sm dec" data-id="${DT.esc(c.id)}" data-v="Verified">Verify</button><button class="btn danger sm dec" data-id="${DT.esc(c.id)}" data-v="Rejected">Reject</button></div>` : DT.statusPill(c.status)}</div>`).join("") : '<p class="sub">No certificates.</p>';
    return DT.head("Verify Credentials", "A verified certificate updates the student's digital twin") + `<div class="card"><div class="list">${rows}</div></div>`;
  },
  bind() {
    DT.$$(".dec").forEach(b => b.onclick = () => DT.controllers.CredentialController.decide(b.dataset.id, b.dataset.v));
  }
};
