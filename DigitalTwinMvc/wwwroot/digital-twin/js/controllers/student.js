DT.controllers.StudentController = {
  async dashboard() {      // View Digital Twin dashboard
    DT.loading();
    DT.mount(DT.views.student.dashboard.render(await DT.models.Student.dashboard()));
  },
  async profile() {        // View Academic Profile
    DT.loading();
    DT.mount(DT.views.student.profile.render(await DT.models.Student.profile()));
  },
  async progress() {       // Track Learning Progress
    DT.loading();
    DT.mount(DT.views.student.progress.render(await DT.models.Student.progress()));
  }
};
