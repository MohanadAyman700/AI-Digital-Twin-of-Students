DT.controllers.AskController = {
  index() {
    DT.mount(DT.views.student.askai.render(), DT.views.student.askai.bind);
  },
  ask(question) {
    return DT.guard(async () => {
      const v = DT.views.student.askai;
      v.addMessage("me", question);
      const res = await DT.models.Student.ask(question);
      v.addMessage("ai", res.answer + (res.source ? " Source: " + res.source + "." : ""));
      if (res.topic) v.addVideoButton(question); // only topic explanations can become a video
    });
  },
  video(question) {
    return DT.guard(async () => {
      const res = await DT.models.Student.askVideo(question);
      const text = res.url ? res.title + " " + res.url : res.title + " (" + res.status + ")";
      DT.views.student.askai.addMessage("ai", text);
    });
  }
};
