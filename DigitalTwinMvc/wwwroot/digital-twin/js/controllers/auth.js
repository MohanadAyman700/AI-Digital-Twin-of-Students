DT.controllers.AuthController = {
  showLogin() {
    const session = DT.session.get();
    if (session) { location.href = session.user.role.toLowerCase() + "/dashboard.html"; return; } // already logged in
    DT.mount(DT.views.shared.login.render(), DT.views.shared.login.bind);
  },
  async login(email, password) {
    try {
      const result = await DT.models.Auth.login(email, password); // { token, user }
      DT.session.set(result);
      location.href = result.user.role.toLowerCase() + "/dashboard.html"; // student/ advisor/ or admin/
    } catch (e) {
      DT.views.shared.login.showError(e.message); // the "Display login error" use case
    }
  },
  logout() {
    DT.session.clear();
    location.href = "../login.html";
  }
};
