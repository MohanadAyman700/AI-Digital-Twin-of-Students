DT.views.admin.dashboard = {
  render(d) {
    return DT.head("Admin dashboard", "System overview") + `<div class="grid g4">
      ${DT.kpi("Users", d.users, '<a class="pill p-teal" href="' + DT.href("users") + '">Manage</a>')}${DT.kpi("Students", d.students, '<span class="sub">Accounts</span>')}
      ${DT.kpi("Pending credentials", d.pendingCredentials, '<a class="pill p-amber" href="' + DT.href("credentials") + '">Review</a>')}${DT.kpi("Grades entered", d.gradesEntered, '<a class="pill p-teal" href="' + DT.href("grades") + '">Enter grades</a>')}</div>`;
  }
};
