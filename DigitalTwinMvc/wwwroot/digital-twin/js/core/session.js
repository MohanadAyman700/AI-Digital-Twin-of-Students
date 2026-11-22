DT.session = {
  cache: null,
  get() {
    if (DT.session.cache) return DT.session.cache;
    try {
      const saved = localStorage.getItem("dt_session");
      if (saved) { DT.session.cache = JSON.parse(saved); return DT.session.cache; }
    } catch (e) { /* storage blocked */ }
    return null;
  },

  set(data) {
    DT.session.cache = data;
    try { localStorage.setItem("dt_session", JSON.stringify(data)); } catch (e) { /* ignore */ }
  },
  clear() {
    DT.session.cache = null;
    try { localStorage.removeItem("dt_session"); } catch (e) { /* ignore */ }
  }
};
