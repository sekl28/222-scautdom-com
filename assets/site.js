(function () {
  'use strict';

  const nav = document.querySelector('.mobile-nav');
  if (nav) {
    document.addEventListener('click', e => { if (!nav.contains(e.target)) nav.open = false; });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') nav.open = false; });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { nav.open = false; }));
  }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const chapters = [...document.querySelectorAll('[data-chapter]')];
  const chapterLinks = [...document.querySelectorAll('[data-chapter-link]')];
  const currentChapter = document.querySelector('[data-reading-current]');
  const progress = document.querySelector('[data-reading-progress]');
  const header = document.querySelector('.header');
  const nativeProgress = window.CSS && CSS.supports('animation-timeline', 'scroll()');
  let readingQueued = false;
  function updateReading() {
    readingQueued = false;
    const line = (header ? header.offsetHeight : 96) + 70;
    let active = null;
    chapters.forEach(section => {
      if (section.getClientRects().length && section.getBoundingClientRect().top <= line) active = section;
    });
    if (currentChapter) currentChapter.textContent = active
      ? `${active.dataset.chapter} / ${active.dataset.chapterTitle}`
      : 'Программа для скаутов';
    chapterLinks.forEach(a => {
      if (active && a.dataset.chapterLink === active.id) a.setAttribute('aria-current', 'location');
      else a.removeAttribute('aria-current');
    });
    if (progress && (!nativeProgress || reducedMotion.matches)) {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const fraction = distance > 0 ? Math.max(0, Math.min(1, window.scrollY / distance)) : 0;
      progress.style.transform = `scaleX(${fraction})`;
    }
  }
  function queueReading() {
    if (!readingQueued) { readingQueued = true; requestAnimationFrame(updateReading); }
  }
  addEventListener('scroll', queueReading, { passive: true });
  addEventListener('resize', queueReading, { passive: true });
  addEventListener('load', queueReading);
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', queueReading);
  document.querySelectorAll('details').forEach(d => d.addEventListener('toggle', queueReading));
  updateReading();

  const expand = document.querySelector('[data-expand-faq]');
  if (expand) {
    const questions = [...document.querySelectorAll('.faq > details')];
    function updateExpand() {
      const allOpen = questions.every(d => d.open);
      expand.textContent = allOpen ? 'Свернуть все ответы' : 'Развернуть все ответы';
      expand.setAttribute('aria-expanded', String(allOpen));
    }
    expand.hidden = false;
    expand.addEventListener('click', () => {
      const open = !questions.every(d => d.open);
      questions.forEach(d => { d.open = open; });
      updateExpand();
    });
    questions.forEach(d => d.addEventListener('toggle', updateExpand));
    updateExpand();
  }

  const core = window.ScautdomLead;
  if (!core) return;
  window.SCAUTDOM_CONFIG = Object.freeze({ telegram: 'scauttdom', legacyMetaPixelId: '1033836855675200', advertisingTrackingEnabled: false });
  function track(event, flow, step) {
    const detail = { event, flow, step };
    window.dispatchEvent(new CustomEvent('scautdom:event', { detail }));
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(detail);
  }
  const source = core.attribution(location.search);
  document.querySelectorAll('a[href]').forEach(a => {
    const raw = a.getAttribute('href');
    if (raw.startsWith('#')) return;
    const u = new URL(raw, location.href);
    if (u.origin !== location.origin) return;
    Object.entries(source).forEach(([k, v]) => u.searchParams.set(k, v));
    a.href = u.pathname + u.search + u.hash;
  });

  const usd = n => '$' + new Intl.NumberFormat('ru-RU').format(n);
  document.querySelectorAll('[data-scout-calculator]').forEach(box => {
    const input = box.querySelector('input');
    function update() {
      const v = core.earnings(input.value);
      if (!v) return;
      box.querySelector('#model-count-label').textContent = v.count;
      box.querySelector('[data-total]').textContent = usd(v.total);
      box.querySelectorAll('[data-month]').forEach(el => { el.textContent = usd(v.monthly); });
      input.style.setProperty('--range-fill', ((v.count - 1) / 9 * 100) + '%');
      input.setAttribute('aria-valuetext', `${v.count}: за три месяца ${usd(v.total)}`);
    }
    input.addEventListener('input', update);
    input.addEventListener('change', () => track('calculator_used', 'scout', 0));
    update();
  });

  async function copy(text, el, status) {
    try {
      if (!navigator.clipboard) throw Error('clipboard');
      await navigator.clipboard.writeText(text);
      status.textContent = 'Скопировано.';
    } catch {
      if (el && el.select) { el.focus(); el.select(); }
      else if (el) {
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection.removeAllRanges(); selection.addRange(range);
      }
      status.textContent = 'Выделили текст. Скопируй его вручную.';
    }
  }
  document.querySelectorAll('[data-copy-target]').forEach(button => {
    button.addEventListener('click', () => {
      const el = document.getElementById(button.dataset.copyTarget);
      copy(el.textContent, el, button.parentElement.querySelector('[data-template-status]'));
    });
  });

  const form = document.querySelector('[data-quiz]');
  if (!form) return;
  form.hidden = false;
  const mode = form.dataset.quiz;
  const steps = [...form.querySelectorAll('[data-step]')];
  const error = form.querySelector('[data-error]');
  const next = form.querySelector('[data-next]');
  const back = form.querySelector('[data-back]');
  let current = 0, id = '', started = false;
  function answers() {
    steps.forEach(s => { s.disabled = false; });
    const a = Object.fromEntries(new FormData(form));
    steps.forEach((s, i) => { s.disabled = i !== current; });
    return a;
  }
  function show(index, focus = true) {
    current = index;
    steps.forEach((s, i) => { s.hidden = i !== index; s.disabled = i !== index; });
    const names = mode === 'scout' ? ['Способ поиска', 'Мой план', 'Сообщение'] : ['О себе', 'Готовность к старту', 'Сообщение'];
    form.querySelector('[data-counter]').textContent = `0${index + 1} / ${names[index]}`;
    form.querySelectorAll('.progress i').forEach((bar, i) => bar.classList.toggle('active', i <= index));
    form.querySelector('[data-controls]').hidden = index === 2;
    back.hidden = index === 0;
    next.textContent = index === 1 ? 'Проверить сообщение →' : mode === 'scout' ? 'Далее: мой план →' : 'Далее: готовность к старту →';
    error.textContent = '';
    if (focus) {
      steps[index].querySelector('legend').focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
    queueReading();
  }
  const tips = {
    network: 'Начни с совершеннолетней знакомой, которой интересна эта сфера. Как ты планируешь объяснить ей предложение?',
    audience: 'Какой контент поможет твоей взрослой аудитории понять предложение? Расскажи о своей странице и плане.',
    recruiting: 'Какие источники и навыки подбора хочешь использовать? Опиши первый практический шаг.',
    exploring: 'Выбери один канал поиска. С чего готов начать и что хочешь уточнить у команды?'
  };
  form.addEventListener('change', () => {
    error.textContent = '';
    if (!started) { started = true; track('application_started', mode, 1); }
  });
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (current === 2) return;
    const a = answers();
    if (a.age === 'minor') { error.textContent = 'Сотрудничество доступно только с 18 лет.'; return; }
    for (const control of steps[current].querySelectorAll('input,select,textarea')) {
      if (!control.checkValidity()) { control.reportValidity(); return; }
    }
    if (current === 0) {
      if (mode === 'scout') {
        if (!Object.hasOwn(tips, a.source)) { error.textContent = 'Выбери способ поиска.'; return; }
        form.querySelector('[data-route-tip]').textContent = tips[a.source];
      } else if (!core.clean(a.country, 70)) { error.textContent = 'Укажи страну проживания.'; return; }
      show(1); return;
    }
    const state = core.assess(mode, a);
    if (!['ready', 'discuss'].includes(state.status)) {
      error.textContent = mode === 'scout'
        ? 'Укажи имя, опиши план хотя бы в 20 символах и подтверди условия.'
        : 'Проверь обязательные поля и подтверждение условий.';
      return;
    }
    if (!id) id = 'SD-' + (mode === 'scout' ? 'S' : 'M') + '-' + (crypto.randomUUID ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10)).toUpperCase();
    const msg = core.message(mode, a, id, source);
    form.querySelector('[data-message]').value = msg;
    form.querySelector('[data-telegram]').href = core.telegram(msg);
    form.querySelector('[data-review-status]').textContent = state.status === 'ready'
      ? 'В сообщении есть твои ответы и подтверждение условий. Проверь текст и переходи к знакомству с командой.'
      : 'Твоя ситуация и вопросы добавлены в сообщение. Проверь текст и обсуди начало работы с командой.';
    track('message_prepared', mode, 3);
    show(2);
  });
  back.addEventListener('click', () => show(Math.max(0, current - 1)));
  form.querySelector('[data-edit]').addEventListener('click', () => {
    form.querySelector('[data-copy-status]').textContent = ''; show(1);
  });
  form.querySelector('[data-copy]').addEventListener('click', () => {
    const message = form.querySelector('[data-message]');
    copy(message.value, message, form.querySelector('[data-copy-status]'));
  });
  form.querySelector('[data-telegram]').addEventListener('click', () => track('telegram_handoff', mode, 3));
  show(0, false);
})();
