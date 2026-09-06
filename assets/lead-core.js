(function (root) {
  'use strict';
  const clean = (v, max = 90) => String(v || '').replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max);
  const labels = {
    readiness: { candidate: 'Уже есть кандидатка', source: 'Знаю, где искать', exploring: 'Пока разбираюсь' },
    source: { network: 'Личные знакомства', audience: 'Своя аудитория', recruiting: 'Опыт подбора', other: 'Другой источник' },
    candidate_stage: { interest: 'Ей интересен формат, готова поговорить с командой', questions: 'Формат обсудили, пока есть вопросы', not_discussed: 'Пока только думаю предложить' },
    interest: { role: 'Как устроена работа скаута', search: 'Где искать первых кандидатов', payments: 'Условия вознаграждения', fit: 'Подойдёт ли это мне' },
    age: { adult: '18–23 года', older: '24+' },
    experience: { new: 'Начинаю с нуля', experienced: 'Есть опыт' },
    schedule: { ready: 'Подходит 8 часов × 5 дней', discuss: 'Хочу обсудить график', no: 'График не подходит' },
    equipment: { ready: 'Рабочее место готово', partial: 'Нужно подготовить часть техники', none: 'Оборудования пока нет' },
    timing: { soon: 'В ближайшие 2 недели', month: 'В течение месяца', exploring: 'Пока изучаю' }
  };
  const known = (k, v) => Object.hasOwn(labels[k], v);
  function assess(mode, a) {
    if (a.age === 'minor') return { status: 'ineligible' };
    if (!['adult', 'older'].includes(a.age) || a.terms !== 'yes' || !clean(a.name, 50)) return { status: 'incomplete' };
    if (mode === 'scout') {
      if (a.age !== 'adult' || !known('readiness', a.readiness)) return { status: 'incomplete' };
      if (a.readiness === 'source') return { status: known('source', a.source) && clean(a.plan, 400) ? 'ready' : 'incomplete' };
      if (a.readiness === 'candidate') return { status: known('candidate_stage', a.candidate_stage) ? 'discuss' : 'incomplete' };
      return { status: known('interest', a.interest) ? 'discuss' : 'incomplete' };
    }
    if (mode !== 'model' || !clean(a.country, 70) || !['experience', 'schedule', 'equipment', 'timing'].every(k => known(k, a[k]))) return { status: 'incomplete' };
    return { status: a.age === 'adult' && a.experience === 'new' && a.schedule === 'ready' && a.equipment === 'ready' && a.timing !== 'exploring' ? 'ready' : 'discuss' };
  }
  function attribution(search) {
    const p = new URLSearchParams(search), out = {};
    for (const k of ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref']) {
      const v = p.get(k);
      if (v && /^[a-zA-Z0-9_.-]{1,64}$/.test(v)) out[k] = v;
    }
    return out;
  }
  function message(mode, a, id, source) {
    if (!['ready', 'discuss'].includes(assess(mode, a).status)) return '';
    const lines = [mode === 'scout' ? 'Здравствуйте! Хочу стать скаутом SCAUTDOM.' : 'Здравствуйте! Хочу обсудить работу моделью в SCAUTDOM.', `Код: ${clean(id, 35)}`, `Имя: ${clean(a.name, 50)}`, mode === 'scout' ? 'Мне исполнилось 18 лет.' : `Возраст: ${labels.age[a.age]}.`];
    if (mode === 'scout') {
      lines.push(`Ситуация: ${labels.readiness[a.readiness]}.`);
      if (a.readiness === 'candidate') {
        lines.push(`Готовность кандидатки: ${labels.candidate_stage[a.candidate_stage]}.`);
        if (clean(a.candidate_context, 400)) lines.push(`Перед знакомством: ${clean(a.candidate_context, 400)}`);
      } else if (a.readiness === 'source') {
        lines.push(`Источник кандидатов: ${labels.source[a.source]}.`, `План: ${clean(a.plan, 400)}`);
      } else {
        lines.push(`Интересует: ${labels.interest[a.interest]}.`);
        if (clean(a.background, 400)) lines.push(`О себе: ${clean(a.background, 400)}`);
      }
      lines.push('Понимаю: работа моделей — вебкам 18+ на Chaturbate. Буду объяснять формат и знакомить кандидатов с командой с их согласия.', 'Изучил(а) выплаты: до $3 000 за модель за три полных месяца, при досрочном уходе — перерасчёт.');
    } else {
      lines.push(`Страна: ${clean(a.country, 70)}`, `Опыт: ${labels.experience[a.experience]}`, `График: ${labels.schedule[a.schedule]}`, `Оборудование: ${labels.equipment[a.equipment]}`, `Старт: ${labels.timing[a.timing]}`, 'Понимаю формат вебкам 18+ на Chaturbate. Обращаюсь добровольно. Изучила базовую долю 50%, график и особенности публичных эфиров.');
    }
    if (clean(a.question, 240)) lines.push(`Мой вопрос: ${clean(a.question, 240)}`);
    const tags = Object.entries(source || {}).filter(([k, v]) => ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'ref'].includes(k) && /^[a-zA-Z0-9_.-]{1,64}$/.test(v)).map(([k, v]) => `${k}=${v}`);
    if (tags.length) lines.push(`Источник: ${tags.join('; ')}`);
    return lines.join('\n');
  }
  function earnings(n) {
    n = Number(n);
    return Number.isInteger(n) && n >= 1 && n <= 10 ? { count: n, monthly: n * 1000, total: n * 3000 } : null;
  }
  const api = { clean, labels, assess, attribution, message, earnings, telegram: text => 'https://t.me/scauttdom?text=' + encodeURIComponent(text) };
  root.ScautdomLead = api;
  if (typeof module === 'object' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
