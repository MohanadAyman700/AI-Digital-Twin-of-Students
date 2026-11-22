DT.views.advisor.guidance = {
  render(students) {
    return DT.head("Send Guidance", "Send advice to a student. The student gets a notification.") +
      `<div class="grid g2"><div class="card"><form id="gf"><label class="f" for="gs">Student</label>
        <select id="gs">${students.map(s => `<option value="${DT.esc(s.id)}">${DT.esc(s.name)}</option>`).join("")}</select>
        <label class="f" for="gt">Message</label><textarea id="gt" rows="5" required></textarea>
        <button class="btn" style="margin-top:12px" type="submit">Send</button></form></div>
      <div class="card"><h2>Sent messages</h2><p class="sub" id="nog">Nothing sent yet.</p><div class="list" id="gl"></div></div></div>`;
  },
  bind() {
    DT.$("#gf").addEventListener("submit", e => {
      e.preventDefault();
      DT.controllers.GuidanceController.send(DT.$("#gs").value, DT.$("#gt").value);
    });
  },
  fill(sent) {
    DT.$("#nog").hidden = sent.length > 0;
    DT.$("#gl").innerHTML = sent.map(g => `<div><div class="row sp"><b>${DT.esc(g.studentName)}</b><span class="sub sm">${DT.esc(g.date)}</span></div><div class="sub">${DT.esc(g.message)}</div></div>`).join("");
    DT.$("#gt").value = "";
  }
};
