DT.routes = {
  Student: {
    dashboard: ["StudentController", "dashboard"], profile: ["StudentController", "profile"], progress: ["StudentController", "progress"],
    upload: ["CertificateController", "upload"], ask: ["AskController", "index"], notifications: ["NotificationController", "index"]
  },
  Advisor: {
    dashboard: ["RiskController", "dashboard"], atrisk: ["RiskController", "atRisk"], review: ["ReviewController", "index"], monitor: ["MonitorController", "index"],
    plans: ["PlanController", "index"], guidance: ["GuidanceController", "index"], notifications: ["NotificationController", "index"]
  },
  Admin: {
    dashboard: ["AdminController", "dashboard"], users: ["UserController", "index"], grades: ["GradeController", "index"],
    credentials: ["CredentialController", "index"], notifications: ["NotificationController", "index"]
  }
};

DT.guard = async fn => {
  try { await fn(); } catch (e) {
    if (e.status === 401) { DT.session.clear(); location.href = "../login.html"; } else DT.toast(e.message || "Something went wrong.");
  }
};

DT.page = async (role, name) => {
  const session = DT.session.get();
  if (!session) { location.replace("../login.html"); return; }
  if (session.user.role !== role) { location.replace("../" + session.user.role.toLowerCase() + "/dashboard.html"); return; } // wrong role for this page
  DT.$("#side").innerHTML = DT.views.shared.layout.render(session.user, name);
  DT.views.shared.layout.bind();
  DT.controllers.NotificationController.refreshBadge();
  const id = new URLSearchParams(location.search).get("id") || undefined; // review.html?id=420231068
  const target = DT.routes[role][name];
  try {
    await DT.controllers[target[0]][target[1]](id);
  } catch (e) {
    if (e.status === 401) { DT.session.clear(); location.replace("../login.html"); } else DT.showError(e);
  }
};
  