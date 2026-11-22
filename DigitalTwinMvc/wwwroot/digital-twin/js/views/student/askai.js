DT.views.student.askai = {
  render() {
    return DT.head("Ask AI", "Ask for an explanation of a topic. Ask about a topic, your skills, what to study, or how you are doing.") +
      `<div class="card" style="max-width:760px"><div class="chat" id="chat" aria-live="polite"><div class="msg ai">Hi! I can explain a topic from your courses, show your skill gaps, suggest what to study, or tell you how you are doing.</div></div>
      <div class="row wrap" id="chips" style="margin-bottom:12px"></div>
      <form id="ask" class="row"><input id="q" placeholder="Type your question" aria-label="Question" required><button class="btn" type="submit">Ask</button></form></div>`;
  },
  bind() {
    const quick = ["What are my skill gaps?", "What do you recommend I study?", "How am I doing?", "Explain dynamic programming"];
    DT.$("#chips").innerHTML = quick.map((q, i) => `<button class="btn ghost sm chip" type="button" data-i="${i}">${DT.esc(q)}</button>`).join("");
    DT.$$(".chip").forEach(b => b.onclick = () => DT.controllers.AskController.ask(quick[Number(b.dataset.i)]));
    DT.$("#ask").addEventListener("submit", e => {
      e.preventDefault();
      const q = DT.$("#q").value.trim();
      if (q) { DT.$("#q").value = ""; DT.controllers.AskController.ask(q); }
    });
  },
  addMessage(cls, text) {
    const m = document.createElement("div");
    m.className = "msg " + cls;
    m.textContent = text;
    DT.$("#chat").appendChild(m);
    DT.$("#chat").scrollTop = 100000;
    return m;
  },
  addVideoButton(question) {
    const b = document.createElement("button");
    b.className = "btn ghost sm";
    b.type = "button";
    b.textContent = "Generate a video explanation";
    b.onclick = () => { b.remove(); DT.controllers.AskController.video(question); };
    DT.$("#chat").appendChild(b);
  }
};
