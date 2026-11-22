DT.views.shared.notifications = {
  list(items) {
    const markAll = items.some(n => !n.read) ? '<button class="btn ghost" id="markall">Mark all as read</button>' : "";
    const rows = items.length ? items.map(n => {
      const preview = n.message && n.message !== n.title ? DT.esc(n.message.length > 90 ? n.message.slice(0, 90) + "..." : n.message) : "";
      return `<a class="notif ${n.read ? "" : "unread"}" href="${DT.href('notifications', n.id)}">
        <div class="row sp"><b>${DT.esc(n.title)}</b><span class="sub sm">${DT.esc(n.date)}</span></div>${preview ? `<div class="sub sm">${preview}</div>` : ""}</a>`;
    }).join("") : '<p class="sub">No notifications.</p>';
    return DT.head("Notifications", "Select a notification to read the full message", markAll) + `<div class="card"><div class="list">${rows}</div></div>`;
  },
  bindList() {
    const b = DT.$("#markall");
    if (b) b.onclick = () => DT.controllers.NotificationController.markAll();
  },
  detail(n) {
    const target = DT.link(n.link);
    const go = target ? `<a class="btn" href="${DT.esc(target)}">${DT.esc(n.linkText || "Open")}</a>` : "";
    return '<a class="back" href="notifications.html">← Back to notifications</a>' + DT.head(DT.esc(n.title), DT.esc(n.date)) +
      `<div class="card" style="max-width:760px"><p style="font-size:16px;white-space:pre-wrap">${DT.esc(n.message || n.title)}</p>
      <div class="row wrap" style="margin-top:18px">${go}<button class="btn ghost" id="unread" type="button">Mark as unread</button><button class="btn danger" id="del" type="button">Delete</button></div></div>`;
  },
  bindDetail(id) {
    DT.$("#unread").onclick = () => DT.controllers.NotificationController.unread(id);
    DT.$("#del").onclick = () => DT.controllers.NotificationController.remove(id);
  }
};
