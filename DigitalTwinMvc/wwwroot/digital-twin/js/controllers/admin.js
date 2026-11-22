DT.controllers.AdminController = {
  async dashboard() {
    DT.loading();
    DT.mount(DT.views.admin.dashboard.render(await DT.models.Admin.dashboard()));
  }
};

DT.controllers.UserController = {     // Manage user accounts
  async index() {
    DT.mount(DT.views.admin.users.render(), DT.views.admin.users.bind);
    await DT.controllers.UserController.refresh();
  },
  async refresh() {
    DT.views.admin.users.fill(await DT.models.Admin.users(), DT.session.get().user.id);
  },
  add(user) {
    return DT.guard(async () => {
      await DT.models.Admin.addUser(user);
      DT.views.admin.users.resetForm();
      await DT.controllers.UserController.refresh();
      DT.toast("User added.");
    });
  },
  toggle(id, active) {
    return DT.guard(async () => { await DT.models.Admin.setActive(id, active); await DT.controllers.UserController.refresh(); });
  },
  remove(id) {
    return DT.guard(async () => { await DT.models.Admin.deleteUser(id); await DT.controllers.UserController.refresh(); DT.toast("User deleted."); });
  }
};

DT.controllers.GradeController = {    // Enter student grades
  async index() {
    DT.loading();
    const students = await DT.models.Admin.users("Student");
    DT.mount(DT.views.admin.grades.render(students), DT.views.admin.grades.bind);
    DT.views.admin.grades.fill(await DT.models.Admin.grades());
  },
  save(studentId, course, score) {
    return DT.guard(async () => {
      await DT.models.Admin.saveGrade(studentId, course, score);
      DT.views.admin.grades.fill(await DT.models.Admin.grades());
      DT.toast("Grade saved.");
    });
  }
};

DT.controllers.CredentialController = { // Verify credentials (then the digital twin is updated)
  async index() {
    DT.loading();
    DT.mount(DT.views.admin.credentials.render(await DT.models.Certificate.list()), DT.views.admin.credentials.bind);
  },
  decide(id, decision) {
    return DT.guard(async () => {
      await DT.models.Certificate.decide(id, decision);
      await DT.controllers.CredentialController.index();
      DT.toast("Certificate " + decision.toLowerCase() + ".");
    });
  }
};
