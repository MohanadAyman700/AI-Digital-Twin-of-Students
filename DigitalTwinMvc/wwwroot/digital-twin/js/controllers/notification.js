DT.controllers.NotificationController = {
  async index(id) {
    DT.loading();
    const list = await DT.models.Notification.list();
    const n = id ? list.find(x => x.id === id) : null;
    if (n) {                                   // detail page: opening it marks it as read
      if (!n.read) await DT.models.Notification.markRead(id);
      DT.mount(DT.views.shared.notifications.detail(n), () => DT.views.shared.notifications.bindDetail(id));
      DT.controllers.NotificationController.refreshBadge();
      return;
    }
    DT.mount(DT.views.shared.notifications.list(list), DT.views.shared.notifications.bindList);
  },
  markAll() {
    return DT.guard(async () => { await DT.models.Notification.markAllRead(); location.reload(); });
  },
  unread(id) {
    return DT.guard(async () => { await DT.models.Notification.markUnread(id); location.href = DT.href("notifications"); });
  },
  remove(id) {
    return DT.guard(async () => { await DT.models.Notification.remove(id); location.href = DT.href("notifications"); });
  },
  async refreshBadge() {
    try {
      const list = await DT.models.Notification.list();
      DT.views.shared.layout.setBadge(list.filter(n => !n.read).length);
    } catch (e) { /* the badge is not important */ }
  }
};
