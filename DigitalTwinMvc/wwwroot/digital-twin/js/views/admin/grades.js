DT.views.admin.grades = {
  courses: ["Data Structures", "Databases", "Machine Learning", "Web Development", "Algorithms", "Computer Networks"],
  render(students) {
    return DT.head("Enter Grades", "Grades entered here update the student's profile") + `<div class="grid g2">
      <div class="card"><form id="gf"><label class="f" for="gs">Student</label><select id="gs">${students.map(s => `<option value="${DT.esc(s.id)}">${DT.esc(s.name)}</option>`).join("")}</select>
        <label class="f" for="gc">Course</label><select id="gc">${DT.views.admin.grades.courses.map(c => `<option>${c}</option>`).join("")}</select>
        <label class="f" for="gv">Grade (0 to 100)</label><input id="gv" type="number" min="0" max="100" step="1" required>
        <button class="btn" style="margin-top:12px" type="submit">Save grade</button></form></div>
      <div class="card"><h2>Recent entries</h2><p class="sub" id="nol">No grades entered yet.</p><div class="list" id="gl"></div></div></div>`;
  },
  bind() {
    DT.$("#gf").addEventListener("submit", e => {
      e.preventDefault();
      DT.controllers.GradeController.save(DT.$("#gs").value, DT.$("#gc").value, DT.$("#gv").value);
    });
  },
  fill(log) {
    DT.$("#nol").hidden = log.length > 0;
    DT.$("#gl").innerHTML = log.slice(0, 10).map(x => `<div class="row sp"><div><b>${DT.esc(x.studentName)}</b><div class="sub">${DT.esc(x.course)}</div></div>${DT.pill(String(x.score), "p-teal")}</div>`).join("");
    DT.$("#gv").value = "";
  }
};
