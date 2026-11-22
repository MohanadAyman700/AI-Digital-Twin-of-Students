DT.controllers.RiskController = {
  async dashboard() {
    DT.loading();
    DT.mount(DT.views.advisor.dashboard.render(await DT.models.Advisor.dashboard()), DT.views.advisor.dashboard.bind);
  },
  // Identify at-risk students
  atRisk() {
    return DT.controllers.StudentSearch.open({ title: "At-Risk Students", sub: "Students with medium or high risk. Select one to review the predictions.", base: "review", atRisk: true });
  }
};

DT.controllers.ReviewController = {   // Review AI-based predictions
  async index(id) {
    if (!id) return DT.controllers.StudentSearch.open({ title: "Review AI-Based Predictions", sub: "Find a student", base: "review", atRisk: false });
    DT.loading();
    DT.mount(DT.views.advisor.review.render(await DT.models.Advisor.predictions(id)));
  }
};

DT.controllers.MonitorController = {  // Monitor student progress
  async index(id) {
    if (!id) return DT.controllers.StudentSearch.open({ title: "Monitor Student Progress", sub: "Find a student", base: "monitor", atRisk: false });
    DT.loading();
    DT.mount(DT.views.advisor.monitor.render(await DT.models.Advisor.progress(id)));
  }
};

DT.controllers.PlanController = {     // Create intervention plans
  async index(id) {
    if (!id) return DT.controllers.StudentSearch.open({ title: "Intervention Plans", sub: "Find a student to create or view plans", base: "plans", atRisk: false });
    DT.loading();
    const info = await DT.models.Advisor.predictions(id);
    DT.mount(DT.views.advisor.plans.render(info), () => DT.views.advisor.plans.bind(id));
    DT.views.advisor.plans.fill(await DT.models.Advisor.plans(id));
  },
  save(studentId, type, details) {
    return DT.guard(async () => {
      await DT.models.Advisor.createPlan(studentId, type, details);
      DT.views.advisor.plans.fill(await DT.models.Advisor.plans(studentId));
      DT.toast("Plan saved.");
    });
  }
};

DT.controllers.GuidanceController = { // Send personalized guidance
  async index() {
    DT.loading();
    const students = await DT.models.Advisor.students("", "all", false);
    DT.mount(DT.views.advisor.guidance.render(students), DT.views.advisor.guidance.bind);
    DT.views.advisor.guidance.fill(await DT.models.Advisor.guidanceSent());
  },
  send(studentId, message) {
    return DT.guard(async () => {
      await DT.models.Advisor.sendGuidance(studentId, message);
      DT.views.advisor.guidance.fill(await DT.models.Advisor.guidanceSent());
      DT.toast("Guidance sent.");
    });
  }
};
