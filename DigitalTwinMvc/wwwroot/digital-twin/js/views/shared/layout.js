DT.views.shared.layout = {
  menus: {
    Student: [["dashboard", "Dashboard"], ["profile", "Academic Profile"], ["progress", "Learning Progress"], ["upload", "Upload Certificate"], ["ask", "Ask AI"], ["notifications", "Notifications"]],
    Advisor: [["dashboard", "Dashboard"], ["atrisk", "At-Risk Students"], ["review", "Review Predictions"], ["monitor", "Monitor Progress"], ["plans", "Intervention Plans"], ["guidance", "Send Guidance"], ["notifications", "Notifications"]],
    Admin: [["dashboard", "Dashboard"], ["users", "Manage Users"], ["grades", "Enter Grades"], ["credentials", "Verify Credentials"], ["notifications", "Notifications"]]
  },
  render(user, active) {
    const links = DT.views.shared.layout.menus[user.role].map(item => {
      const badge = item[0] === "notifications" ? '<span class="badge" id="nbadge" hidden></span>' : "";
      return `<a class="nav${item[0] === active ? " on" : ""}" href="${DT.href(item[0])}">${item[1]}${badge}</a>`;
    }).join("");
    return '<a class="brand" href="../index.html"><i></i>Digital Twin</a>' +
      `<div class="who">${DT.esc(user.name)}<br>${DT.esc(user.role)}</div>` + links +
      '<a class="nav out" href="../login.html" id="logout">Logout</a>';
  },
  bind() {
    DT.$("#logout").onclick = e => { e.preventDefault(); DT.controllers.AuthController.logout(); };
  },
  setBadge(count) {
    const b = DT.$("#nbadge");
    if (!b) return;
    b.textContent = count;
    b.hidden = !count;
  }
};
