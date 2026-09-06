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
    if (navigator.globalPrivacyControl || navigator.doNotTrack === '1') return;
    const detail = { event, flow, step };
    window.dispatchEvent(new CustomEvent('scautdom:event', { detail }));
    window.ScautdomAnalytics?.track(event, flow, step);
  }
  const source = core.attribution(location.search);
  document.querySelectorAll('a[href]').forEach(a => {
    const raw = a.getAttribute('href');
    if (raw.startsWith('#')) return;
    const u = new URL(raw, location.href);
    if (u.origin !== location.origin) return;
    Object.entries(source).forEach(([k, v]) => u.searchParams.set(k, v));
    a.href = u.pathname + u.search + u.hash;
    if (u.pathname === '/' && u.hash === '#apply') a.addEventListener('click', () => track('application_cta', 'scout', 0));
  });
  document.querySelectorAll('a[href="#apply"]').forEach(a => a.addEventListener('click', () => track('application_cta', 'scout', 0)));
  document.querySelectorAll('[data-direct-chat]').forEach(a => a.addEventListener('click', () => track('direct_chat', 'scout', 0)));
  track('page_view', 'site', 0);

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
  form.noValidate = true;
  const mode = form.dataset.quiz;
  if ('IntersectionObserver' in window) {
    const seen = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { track('application_viewed', mode, 1); seen.disconnect(); }
    }, { threshold: 0.1 });
    seen.observe(form);
  }
  const steps = [...form.querySelectorAll('[data-step]')];
  const controls = [...form.querySelectorAll('input[name], select[name], textarea[name]')];
  const error = form.querySelector('[data-error]');
  const next = form.querySelector('[data-next]');
  const back = form.querySelector('[data-back]');
  const draftStatus = form.querySelector('[data-draft-status]');
  const clearDraft = form.querySelector('[data-clear-draft]');
  const draftKey = 'scautdom:draft:v2:' + mode;
  const ttl = 24 * 60 * 60 * 1000;
  let current = 0, id = '', started = false, saving, submittedMessage = '';
  const submitApplication = form.querySelector('[data-save-application]');
  const saveStatus = form.querySelector('[data-save-status]');
  let formSource = source;
  function rawAnswers() {
    const result = {};
    controls.forEach(c => {
      if (!['checkbox', 'radio'].includes(c.type) || c.checked) result[c.name] = c.value;
    });
    return result;
  }
  function answers() {
    const raw = rawAnswers(), result = {};
    controls.forEach(c => {
      const route = c.closest('[data-route]');
      if ((!route || route.dataset.route === raw.readiness) && Object.hasOwn(raw, c.name)) result[c.name] = raw[c.name];
    });
    return result;
  }
  function routeFields() {
    const readiness = rawAnswers().readiness;
    form.querySelectorAll('[data-route]').forEach(group => {
      const active = group.dataset.route === readiness;
      group.hidden = !active;
      group.querySelectorAll('input, select, textarea').forEach(c => { c.disabled = !active; });
    });
    const tip = form.querySelector('[data-route-tip]');
    if (tip) tip.textContent = {
      candidate: 'Обсудим, что уже известно и что нужно уточнить перед знакомством. Данные и документы кандидатки здесь не нужны.',
      source: 'Назови свой источник и ближайший шаг. Достаточно одной понятной мысли.',
      exploring: 'Готовый план не нужен. Выбери тему, которую хочешь разобрать первой.'
    }[readiness] || '';
  }
  function saveDraft() {
    clearTimeout(saving);
    const data = rawAnswers();
    clearDraft.hidden = Object.keys(data).length === 0;
    if (clearDraft.hidden) return;
    try {
      sessionStorage.setItem(draftKey, JSON.stringify({ savedAt: Date.now(), data, step: current, id, submittedMessage, source: formSource }));
      draftStatus.textContent = 'Черновик сохранён в этой вкладке на 24 часа.';
    } catch {
      draftStatus.textContent = 'Браузер не разрешил сохранить черновик. Перед уходом скопируй готовое сообщение.';
    }
  }
  function show(index, focus = true) {
    current = index;
    steps.forEach((step, i) => { step.hidden = i !== index; step.disabled = i !== index; });
    routeFields();
    const names = mode === 'scout' ? ['Твоя ситуация', 'Детали', 'Сообщение'] : ['О себе', 'Готовность к старту', 'Сообщение'];
    form.querySelector('[data-counter]').textContent = `0${index + 1} / ${names[index]}`;
    form.querySelectorAll('.progress i').forEach((bar, i) => bar.classList.toggle('active', i <= index));
    form.querySelector('[data-controls]').hidden = index === 2;
    back.hidden = index === 0;
    next.textContent = index === 1 ? 'Проверить сообщение →' : mode === 'scout' ? 'Далее: детали →' : 'Далее: готовность к старту →';
    error.textContent = '';
    if (focus) {
      steps[index].querySelector('legend').focus({ preventScroll: true });
      form.scrollIntoView({ block: 'start', behavior: reducedMotion.matches ? 'auto' : 'smooth' });
    }
    queueReading();
  }
  function prepareMessage() {
    const a = answers(), state = core.assess(mode, a);
    if (!['ready', 'discuss'].includes(state.status)) return false;
    if (id && submittedMessage && core.message(mode, a, id, formSource) !== submittedMessage) { id = ''; submittedMessage = ''; }
    if (!id) {
      const random = crypto.randomUUID ? crypto.randomUUID().replaceAll('-', '').slice(0, 20) : Array.from(crypto.getRandomValues(new Uint8Array(10)), b => b.toString(16).padStart(2, '0')).join('');
      id = `SD-${mode === 'scout' ? 'S' : 'M'}-${random.toUpperCase()}`;
    }
    const message = core.message(mode, a, id, formSource);
    form.querySelector('[data-message]').value = message;
    form.querySelector('[data-telegram]').href = core.telegram(message);
    form.querySelector('[data-review-status]').textContent = `Код обращения: ${id}. Проверь ответы, сохрани обращение и продолжи разговор в Telegram.`;
    saveStatus.textContent = '';
    return true;
  }
  function changed() {
    error.textContent = '';
    routeFields();
    if (!started) { started = true; track('application_started', mode, 1); }
    clearTimeout(saving);
    saving = setTimeout(saveDraft, 250);
  }
  form.addEventListener('input', changed);
  form.addEventListener('change', changed);
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (current === 2) return;
    const a = answers();
    if (a.age === 'minor') { error.textContent = 'Сотрудничество доступно только с 18 лет.'; return; }
    for (const control of steps[current].querySelectorAll('input, select, textarea')) {
      if (!control.disabled && !control.checkValidity()) { control.reportValidity(); return; }
    }
    if (current === 0) {
      if (mode === 'scout' && !Object.hasOwn(core.labels.readiness, a.readiness)) { error.textContent = 'Выбери свою ситуацию.'; return; }
      if (mode === 'model' && !core.clean(a.country, 70)) { error.textContent = 'Укажи страну проживания.'; return; }
      show(1); saveDraft(); track('application_step', mode, 2); return;
    }
    if (!prepareMessage()) { error.textContent = 'Заполни обязательные поля и подтверди, что условия понятны.'; return; }
    show(2); saveDraft(); track('message_prepared', mode, 3);
  });
  back.addEventListener('click', () => { show(Math.max(0, current - 1)); saveDraft(); });
  form.querySelector('[data-edit]').addEventListener('click', () => {
    form.querySelector('[data-copy-status]').textContent = ''; show(1); saveDraft();
  });
  form.querySelector('[data-copy]').addEventListener('click', () => {
    const message = form.querySelector('[data-message]');
    copy(message.value, message, form.querySelector('[data-copy-status]'));
    track('message_copied', mode, 3);
  });
  form.querySelector('[data-telegram]').addEventListener('click', () => {
    saveDraft(); track('telegram_handoff', mode, 3);
  });
  submitApplication.addEventListener('click', async () => {
    if (submitApplication.disabled || !prepareMessage()) return;
    const a = answers();
    submittedMessage = form.querySelector('[data-message]').value;
    saveDraft();
    submitApplication.disabled = true;
    submitApplication.textContent = 'Сохраняем обращение…';
    form.querySelector('[data-edit]').disabled = true;
    clearDraft.disabled = true;
    saveStatus.textContent = 'Подтверждаем сохранение. Ответы останутся в черновике.';
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://scautdom-crm-control.tutu5744.chatgpt.site/api/applications', {
        method: 'POST', mode: 'cors', credentials: 'omit', signal: controller.signal,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, mode, answers: a, source: formSource, analytics: window.ScautdomAnalytics?.context(), website: rawAnswers().website || '' })
      });
      if (!response.headers.get('content-type')?.includes('application/json')) throw new Error('Сервис сохранения пока недоступен. Попробуй ещё раз или открой Telegram кнопкой ниже.');
      const receipt = await response.json();
      if (!response.ok) {
        if (response.status === 409) { id = ''; submittedMessage = ''; prepareMessage(); saveDraft(); }
        throw new Error(receipt.error || 'Не удалось подтвердить сохранение. Можно повторить или отправить текст в Telegram.');
      }
      if (receipt.id !== id || receipt.status !== 'received' || !receipt.receivedAt) throw new Error('Подтверждение не получено. Повтори сохранение с тем же кодом или отправь текст в Telegram.');
      saveStatus.textContent = 'Обращение сохранено. В Telegram нажми «Отправить», чтобы продолжить разговор.';
      track('application_received', mode, 3);
      track('telegram_handoff', mode, 3);
      // Same-tab navigation works on mobile without asynchronous popup blocking.
      location.assign(core.telegram(form.querySelector('[data-message]').value));
    } catch (e) {
      saveStatus.textContent = e.name === 'AbortError' ? 'Подтверждение не пришло вовремя. Повтори сохранение — дубль с тем же кодом не создастся. Или открой Telegram кнопкой ниже.' : e.message;
      track('application_save_failed', mode, 3);
    } finally {
      clearTimeout(timeout);
      submitApplication.disabled = false;
      submitApplication.textContent = 'Сохранить и открыть Telegram →';
      form.querySelector('[data-edit]').disabled = false;
      clearDraft.disabled = false;
    }
  });
  clearDraft.addEventListener('click', () => {
    clearTimeout(saving);
    try { sessionStorage.removeItem(draftKey); } catch { /* Storage may be unavailable. */ }
    form.reset(); id = ''; started = false; submittedMessage = ''; formSource = source;
    form.querySelector('[data-message]').value = '';
    form.querySelector('[data-telegram]').href = 'https://t.me/scauttdom';
    form.querySelector('[data-copy-status]').textContent = '';
    saveStatus.textContent = '';
    clearDraft.hidden = true;
    draftStatus.textContent = 'Черновик удалён. Можно начать заново.';
    show(0);
  });
  addEventListener('pagehide', () => { if (started) saveDraft(); });
  let initialStep = 0;
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey) || 'null');
    if (draft && Number.isFinite(draft.savedAt) && Date.now() - draft.savedAt >= 0 && Date.now() - draft.savedAt < ttl && draft.data && typeof draft.data === 'object') {
      controls.forEach(c => {
        const value = draft.data[c.name];
        if (typeof value !== 'string') return;
        if (['checkbox', 'radio'].includes(c.type)) c.checked = value === c.value;
        else if (c.tagName !== 'SELECT' || [...c.options].some(o => o.value === value)) c.value = value.slice(0, c.maxLength > 0 ? c.maxLength : 400);
      });
      id = typeof draft.id === 'string' && /^SD-[SM]-[A-Z0-9]{8,20}$/.test(draft.id) ? draft.id : '';
      // Previously generated short codes remain valid in Telegram; new server
      // submissions use the current 80-bit code format.
      if (id && !/^SD-[SM]-[A-Z0-9]{20}$/.test(id)) id = '';
      submittedMessage = typeof draft.submittedMessage === 'string' ? draft.submittedMessage.slice(0, 3000) : '';
      formSource = { ...core.attribution(new URLSearchParams(draft.source || {}).toString()), ...source };
      started = true; clearDraft.hidden = false;
      initialStep = [0, 1, 2].includes(draft.step) ? draft.step : 0;
      if (initialStep === 2 && !prepareMessage()) initialStep = 1;
      draftStatus.textContent = 'Восстановили твой черновик. Можешь продолжить или удалить его.';
    } else if (draft) sessionStorage.removeItem(draftKey);
  } catch { /* Form remains usable without session storage. */ }
  show(initialStep, false);
})();
