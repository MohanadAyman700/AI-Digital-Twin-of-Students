DT.views.student.upload = {
  render() {
    return DT.head("Upload Certificate", "The system reads the certificate. Check the result before it goes to verification.") +
      `<div class="card" style="max-width:760px"><label class="drop"><b style="color:var(--ink)">Choose a certificate file</b><div>PNG, JPG or PDF</div><input id="file" type="file" accept="image/*,.pdf" hidden></label>
      <div class="list" id="scan"></div></div>
      <div class="card" style="max-width:760px;margin-top:16px"><h2>My certificates</h2><div class="list" id="mine"></div></div>`;
  },
  bind() {
    DT.$("#file").addEventListener("change", e => {
      const f = e.target.files[0];
      if (f) DT.controllers.CertificateController.scan(f);
      e.target.value = "";
    });
  },
  showScanning(name) { DT.$("#scan").innerHTML = `<div class="row sp"><div><b>${DT.esc(name)}</b><div class="sub">Reading text...</div></div>${DT.pill("Processing", "p-amber")}</div>`; },
  showResult(file, ocr) {
    DT.$("#scan").innerHTML = `<div><b>${DT.esc(file.name)}</b><div class="sub">Detected skill: ${DT.esc(ocr.skill)}, ${ocr.hours} hours (confidence ${Math.round(ocr.confidence * 100)}%). Check it before you send.</div>
      <div class="row" style="margin-top:10px"><button class="btn" id="send">Confirm and send</button><button class="btn ghost" id="cancel">Cancel</button></div></div>`;
    DT.$("#send").onclick = () => DT.controllers.CertificateController.submit(file.name, ocr);
    DT.$("#cancel").onclick = () => { DT.$("#scan").innerHTML = ""; };
  },
  clearScan() { DT.$("#scan").innerHTML = ""; },
  fillMine(list) {
    DT.$("#mine").innerHTML = list.length ? list.map(c => `<div class="row sp"><div><b>${DT.esc(c.fileName)}</b><div class="sub">${DT.esc(c.skill)}, ${c.hours} hours</div></div>${DT.statusPill(c.status)}</div>`).join("") : '<p class="sub">No certificates yet.</p>';
  }
};
