/* ============================================================
   Reusable quiz engine for lessons. Data-driven; no per-lesson JS.

   Usage in a lesson:
     <div id="quiz"></div>
     <script src="../assets/quiz.js"></script>
     <script>Quiz.mount('#quiz', { id:'0001', sections:[...] })</script>

   Section: { key, title, blurb }
   Question: { section, stem, options:[{html, ok}], right, wrong }
     - stem/option html may contain markup.
     - exactly one option has ok:true
     - `right` shows after a correct pick, `wrong` after an incorrect one;
       both are shown together as one explanation block so the learner
       always sees the full reasoning, not just a verdict.

   Design constraint: options within a question are kept to near-equal
   length deliberately, so length never leaks the answer.
   ============================================================ */

const Quiz = (() => {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  function mount(sel, spec) {
    const root = document.querySelector(sel);
    if (!root) return;

    const state = { answered: 0, total: spec.questions.length, byKey: {} };
    for (const s of spec.sections) state.byKey[s.key] = { got: 0, of: 0, ...s };
    for (const q of spec.questions) state.byKey[q.section].of++;

    let html = '<div class="quiz">';
    let n = 0;
    let lastSection = null;

    for (const q of spec.questions) {
      if (q.section !== lastSection) {
        const s = state.byKey[q.section];
        html += `<h3>${esc(s.title)}</h3>`;
        if (s.blurb) html += `<p class="gloss">${s.blurb}</p>`;
        lastSection = q.section;
      }
      n++;
      html += `<div class="q" data-q="${n}" data-section="${esc(q.section)}">
        <div class="q-num">Question ${n}</div>
        <div class="q-stem">${q.stem}</div>
        <ul class="opts">${q.options.map((o, i) =>
          `<li><button class="opt" data-i="${i}" data-ok="${o.ok ? 1 : 0}">${o.html}</button></li>`
        ).join('')}</ul>
        <div class="feedback" hidden>
          <p><span class="verdict"></span></p>
          ${q.right ? `<p>${q.right}</p>` : ''}
          ${q.wrong ? `<p>${q.wrong}</p>` : ''}
        </div>
      </div>`;
    }
    html += '</div>';

    html += `<div class="scorecard" hidden>
      <h3 style="margin-top:0">Your diagnostic</h3>
      <div class="score-rows"></div>
      <p style="margin-top:1.2rem;font-size:.95rem">
        Copy the line below and paste it back into the chat. That is how I place you —
        I cannot see what you clicked.
      </p>
      <div class="result-code"></div>
    </div>`;

    root.innerHTML = html;

    root.addEventListener('click', (e) => {
      const btn = e.target.closest('.opt');
      if (!btn || btn.disabled) return;

      const card = btn.closest('.q');
      const ok = btn.dataset.ok === '1';
      const key = card.dataset.section;

      card.querySelectorAll('.opt').forEach((b) => {
        b.disabled = true;
        if (b.dataset.ok === '1') b.classList.add('reveal-right');
      });
      btn.classList.add(ok ? 'picked-right' : 'picked-wrong');

      const fb = card.querySelector('.feedback');
      const v = fb.querySelector('.verdict');
      v.textContent = ok ? 'Correct' : 'Not this one';
      v.className = 'verdict ' + (ok ? 'ok' : 'no');
      fb.hidden = false;

      if (ok) state.byKey[key].got++;
      state.answered++;
      if (state.answered === state.total) finish(root, state, spec);
    });
  }

  function finish(root, state, spec) {
    const card = root.querySelector('.scorecard');
    const rows = card.querySelector('.score-rows');
    const parts = [];

    rows.innerHTML = Object.values(state.byKey).map((s) => {
      const pct = Math.round((s.got / s.of) * 100);
      parts.push(`${s.key} ${s.got}/${s.of}`);
      return `<div class="score-row">
        <span class="score-label">${esc(s.title)}</span>
        <span class="bar"><span style="width:${pct}%"></span></span>
        <span class="score-val">${s.got}/${s.of}</span>
      </div>`;
    }).join('');

    card.querySelector('.result-code').textContent =
      `DIAG-${spec.id} | ` + parts.join(' | ');
    card.hidden = false;
    card.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return { mount };
})();
