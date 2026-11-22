DT.controllers.StudentSearch = {
  opts: null,
  open(opts) {
    DT.controllers.StudentSearch.opts = opts;
    DT.mount(DT.views.shared.studentSearch.render(opts), DT.views.shared.studentSearch.bind);
    return DT.controllers.StudentSearch.search("", "all");
  },
  search(q, risk) {
    return DT.guard(async () => {
      const o = DT.controllers.StudentSearch.opts;
      const list = await DT.models.Advisor.students(q, risk, o.atRisk);
      DT.views.shared.studentSearch.fill(list, q, o.base);
    });
  }
};
