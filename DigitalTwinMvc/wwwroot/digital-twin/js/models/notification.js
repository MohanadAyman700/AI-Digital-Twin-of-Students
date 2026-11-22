DT.models.Notification = {
  list: () => DT.api.get("/api/notifications"),
  markRead: id => DT.api.post("/api/notifications/" + id + "/read"),
  markUnread: id => DT.api.post("/api/notifications/" + id + "/unread"),
  markAllRead: () => DT.api.post("/api/notifications/read-all"),
  remove: id => DT.api.del("/api/notifications/" + id)
};
