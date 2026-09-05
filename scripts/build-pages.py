"""Build the SCAUTDOM programme as one complete reading journey and reference pages."""
from pathlib import Path
from html import escape
from textwrap import dedent
from application import quiz

ROOT = Path(__file__).resolve().parents[1]
VERSION = 'editorial-20260905c'
CHAPTERS = [('role', 'Роль скаута'), ('models', 'Условия моделей'), ('workflow', 'Как работать'), ('rewards', 'Выплаты'), ('questions', 'Вопросы')]


def action(label, href, secondary=False):
    return f'<a class="button {"secondary" if secondary else "primary"}" href="{href}">{label}<span aria-hidden="true">{"↓" if href.startswith("#") else "→"}</span></a>'


def chapter_head(number, label, title, text=''):
    return f'<div class="chapter-heading"><p class="eyebrow"><span>{number}</span> / {label}</p><h2>{title}</h2></div>' + (f'<p class="chapter-intro">{text}</p>' if text else '')


def next_chapter(number, label, href):
    return f'<a class="next-chapter" href="{href}"><span class="next-caption">Далее в программе</span><span class="next-name"><small>{number}</small>{label}</span><span class="next-arrow" aria-hidden="true">↓</span></a>'


def header(page):
    home = page == 'index.html'
    links = ''.join(f'<a href="{"#" if home else "/#"}{key}" data-chapter-link="{key}"><span>0{i}</span>{label}</a>' for i, (key, label) in enumerate(CHAPTERS, 1))
    return f'''<a class="skip" href="#main">К содержанию</a>
<header class="header"><div class="header-inner wrap">
<a class="brand" href="/" aria-label="SCAUTDOM — вся программа">scautdom<span aria-hidden="true">.</span></a>
<nav class="desktop-nav" aria-label="Разделы программы по порядку">{links}</nav>
<span class="header-note">ПАРТНЁРАМ / 18+</span>
<details class="mobile-nav"><summary>Разделы <span aria-hidden="true">≡</span></summary><nav aria-label="Разделы программы">{links}</nav></details>
</div><div class="reading-row wrap"><span data-reading-current>Программа для скаутов</span><span class="reading-note">Сначала условия. Затем знакомство.</span></div><div class="reading-progress" aria-hidden="true"><div data-reading-progress></div></div></header>'''


def footer():
    return '''<footer class="footer"><div class="wrap"><div class="footer-top"><a class="brand" href="/">scautdom<span>.</span></a><p>Замечать людей.<br>Открывать возможности.</p><nav aria-label="Справочные страницы"><a href="/model.html">Условия работы моделей</a><a href="/scout.html">Инструкция для скаута</a><a href="/payments.html">Правила выплат</a><a href="/privacy.html">Конфиденциальность</a></nav></div><div class="footer-bottom"><span>© 2026 SCAUTDOM · Участники 18+</span><span>Партнёрская программа в сфере вебкам.<br>Не официальный сайт Chaturbate.</span><a href="#main">В начало страницы ↑</a></div></div></footer>'''


def write(page, title, description, body):
    route = '/' if page == 'index.html' else '/' + page
    preload = '<link rel="preload" as="image" href="/assets/portrait.svg">' if page == 'index.html' else ''
    html = f'''<!doctype html>
<html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#10120f"><meta name="referrer" content="strict-origin-when-cross-origin"><title>{escape(title)}</title><meta name="description" content="{escape(description, quote=True)}"><link rel="canonical" href="https://www.scautdom.com{route}"><meta property="og:type" content="website"><meta property="og:locale" content="ru_RU"><meta property="og:site_name" content="SCAUTDOM"><meta property="og:title" content="{escape(title, quote=True)}"><meta property="og:description" content="{escape(description, quote=True)}"><meta property="og:url" content="https://www.scautdom.com{route}"><link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">{preload}<link rel="stylesheet" href="/assets/typeface.css?v={VERSION}"><link rel="stylesheet" href="/assets/site.css?v={VERSION}"><script src="/assets/lead-core.js?v={VERSION}" defer></script><script src="/assets/site.js?v={VERSION}" defer></script></head><body data-release="{VERSION}" data-page="{page}">{header(page)}<main id="main">{body}</main>{footer()}</body></html>'''
    (ROOT / page).write_text(html)


def section(key, number, label, title, intro, content, tone='', following=None):
    end = next_chapter(*following) if following else ''
    return f'<section class="chapter {tone}" id="{key}" data-chapter="{number}" data-chapter-title="{label}"><div class="wrap">{chapter_head(number, label, title, intro)}{content}{end}</div></section>'


ROLE = '''
<div class="role-layout"><div class="reading-copy"><p class="lead">Скаут находит девушек, которым интересна работа вебкам-моделью, помогает разобраться в предложении и знакомит их с командой SCAUTDOM.</p>
<p>Здесь ценится умение общаться: услышать человека, понятно рассказать об условиях и заметить, кому действительно подходит эта работа. Ты можешь начать с личных знакомств, своего профессионального круга или взрослой аудитории в соцсетях.</p>
<p>Скаут и модель — разные роли. Ты занимаешься поиском и первичным знакомством. Команда проводит итоговый отбор, обучает модель, помогает с запуском и дальнейшей работой. Вести эфиры самому скауту не требуется.</p>
<p>Это партнёрская программа: вознаграждение связано с результатом привлечённой модели и выполнением условий, которые подробно разобраны ниже. Для первого обращения достаточно понять программу и описать, как ты планируешь искать кандидатов.</p></div>
<div class="role-manifesto"><span class="eyebrow">Твоя сильная сторона</span><p>Видеть<br>в людях<br><em>потенциал.</em></p><span class="manifesto-foot">Остальное начинается<br>с правильного знакомства.</span></div></div>
<div class="benefit-trio"><article><span class="feature-index">01</span><h3>Начало с того,<br>что уже есть</h3><p>Круг общения, опыт в бьюти, фотографии, создании контента или подборе людей могут стать твоим первым источником кандидатов. Предыдущий опыт скаутинга не обязателен.</p></article><article><span class="feature-index">02</span><h3>Команда берёт<br>на себя запуск</h3><p>После одобрения модели команда помогает подготовиться к эфирам, обучает работе и сопровождает аккаунт. Твоя задача — качественное первичное знакомство.</p></article><article><span class="feature-index">03</span><h3>От первого кандидата<br>к своей сети</h3><p>За модель, завершившую три полных месяца по условиям программы, предусмотрено до $3 000. От 10 активных моделей открывается дополнительный VIP-процент.</p></article></div>
<div class="editor-note"><span>С чего начинается хороший результат</span><p>Человек заранее понимает сферу, график и условия. Поэтому сначала разберись в предложении сам — тогда твой первый разговор будет предметным.</p></div>
'''

MODEL = '''
<div class="reading-grid"><div class="reading-copy"><h3>Девушка, которой интересно освоить эту сферу</h3><p>Программа ориентирована на совершеннолетних девушек, которые хотят начать работу вебкам-моделью с нуля. Приоритет — 18–23 года, желание учиться и готовность к регулярной работе. Кандидаты старше 23 лет рассматриваются индивидуально.</p>
<p><strong>Работа проходит на Chaturbate — платформе прямых эфиров для взрослых, в том числе с эротическим контентом.</strong> Модель ведёт трансляции и общается с аудиторией. Допустимый для неё формат и личные границы обсуждаются с командой до начала работы.</p>
<p>Важно объяснить именно это предложение. Человек должен понимать, что речь идёт о вебкаме, а не о фотосъёмках для брендов или обычном ведении соцсетей. Интерес к реальному формату — основа дальнейшего сотрудничества.</p></div>
<aside class="candidate-facts"><span class="eyebrow">Портрет кандидата</span><dl><div><dt>Возраст</dt><dd>18+<small>Приоритет 18–23 года</small></dd></div><div><dt>Опыт</dt><dd>С нуля<small>Обучение входит в программу</small></dd></div><div><dt>График модели</dt><dd>8 × 5<small>От 8 часов в день, 5 дней в неделю</small></dd></div></dl></aside></div>
<div class="subsection"><div class="subhead"><span class="eyebrow">Обучение и поддержка</span><h3>Не нужно приходить<br>с готовыми навыками.</h3></div><div class="support-list"><article><span>01</span><div><h4>Подготовка к работе</h4><p>Команда объясняет формат, помогает с настройкой оборудования, подготовкой к работе в кадре и общению с аудиторией. Отдельная плата за обучение не предусмотрена.</p></div></article><article><span>02</span><div><h4>Помощь с запуском</h4><p>После одобрения — регистрация и проверка данных, согласование графика, подготовка рабочего места и первые трансляции.</p></div></article><article><span>03</span><div><h4>Сопровождение аккаунта</h4><p>Рекомендации по продвижению, работе с аудиторией и развитию результатов. Обучение продолжается по мере появления практического опыта.</p></div></article></div></div>
<div class="model-economy"><div class="share-figure"><span class="eyebrow">Базовая доля модели</span><strong>50<span>%</span></strong><p>От согласованной базы<br>для распределения дохода</p></div><div class="reading-copy"><h3>Как объяснить доход</h3><p>Базовая доля модели составляет 50%. Например, если база для распределения за расчётный период равна $3 000, доля модели — $1 500. Это пример расчёта: фактический заработок зависит от результатов эфиров.</p><p>За высокую активность и сильный результат доля может увеличиться по VIP-программе. Расчётную базу, возможные удержания, способ и даты выплат модель согласует с компанией перед началом работы.</p><div class="table-scroll"><table><caption>VIP-программа моделей</caption><thead><tr><th scope="col">Результат за месяц</th><th scope="col">Доля модели</th></tr></thead><tbody><tr><th scope="row">$5 000</th><td>52%</td></tr><tr><th scope="row">$8 000</th><td>55%</td></tr><tr><th scope="row">$20 000</th><td>60%</td></tr></tbody></table></div><p class="small">Повышение рассматривается за конкретный месяц при высокой активности и выполнении рабочего плана; для VIP предусмотрен график около 10 часов в сутки. Расчётную базу порогов нужно подтвердить с командой.</p></div></div>
<div class="subsection"><div class="subhead"><span class="eyebrow">Условия старта</span><h3>Рабочее место.<br>График.<br>Готовность учиться.</h3></div><div class="reading-copy"><p>Для модели предусмотрен график от 8 часов в день, 5 дней в неделю. Это время самой модели: график скаута с ним не связан. Уточни готовность к такому режиму до знакомства с командой.</p><ul class="detail-list"><li><strong>Компьютер и камера.</strong> Техника должна стабильно работать во время длительных трансляций. В программе указаны Logitech C920 или C920s как варианты камеры.</li><li><strong>Стабильный интернет.</strong> От 20 Мбит/с на приём и на отдачу. Важна устойчивость соединения.</li><li><strong>Отдельное пространство.</strong> Место, где можно спокойно вести эфиры, настроить свет и соблюдать рабочий график.</li></ul><p>Если часть оборудования ещё нужно подготовить, это обсуждается с командой после предварительного рассмотрения. Возможность запуска также зависит от страны проживания кандидата.</p><p>Публичные эфиры могут записываться и распространяться зрителями. Полную анонимность обещать нельзя. Это часть формата, которую человек должен понимать до решения.</p></div></div>
'''

WORKFLOW = '''
<div class="process-photo"><img src="/assets/conversation.svg" width="1536" height="1024" loading="lazy" alt="Иллюстрация: обсуждение проекта за ноутбуком"><div class="photo-note"><span>Всё начинается</span><strong>с разговора.</strong></div><span class="image-credit">Фотоиллюстрация · ИИ</span></div>
<div class="process-steps"><article><div class="process-number">01</div><div><h3>Выбери свой источник кандидатов</h3><p>Начни с круга, в котором умеешь общаться. Это могут быть совершеннолетние знакомые и их рекомендации, контакты из бьюти-сферы, фотографии и творчества или взрослая аудитория твоей страницы.</p><p>Подумай, почему этому человеку может быть интересно предложение. Первая цель — найти того, кто готов разобраться в работе и обсудить условия.</p></div></article><article><div class="process-number">02</div><div><h3>Расскажи о работе и преимуществах</h3><p>Назови сферу и платформу, объясни обучение, поддержку, график и долю дохода модели. Предложи прочитать условия. Если у девушки есть вопросы, помоги сформулировать их для команды.</p><div class="message-card"><span class="eyebrow">Пример первого сообщения</span><blockquote id="outreach-text">Привет! Я знакомлю девушек с программой SCAUTDOM: команда обучает работе вебкам-моделью на Chaturbate, платформе для взрослых, и помогает с запуском. Можно начать без опыта. Если тебе интересна эта сфера, отправлю подробные условия по графику, обучению и выплатам — посмотришь, подходит ли тебе предложение.</blockquote><button class="text-link" type="button" data-copy-target="outreach-text">Скопировать текст сообщения <span aria-hidden="true">⧉</span></button><p class="small" data-template-status role="status"></p></div><p class="small">Пример для личного разговора со взрослой знакомой. Адаптируй его под ваше общение.</p></div></article><article><div class="process-number">03</div><div><h3>Уточни готовность</h3><p>До передачи кандидата разбери шесть вопросов. Их ответы помогут команде перейти к обсуждению запуска.</p><ul class="interview-list"><li><span>Возраст</span>Сколько полных лет?</li><li><span>Формат</span>Понимает ли, что это вебкам на Chaturbate?</li><li><span>Опыт</span>Начинает с нуля или уже работала?</li><li><span>График</span>Подходят ли 8 часов в день, 5 дней в неделю?</li><li><span>Подготовка</span>Есть ли компьютер, камера, интернет и отдельное место?</li><li><span>Запуск</span>В какой стране и городе находится, когда готова начать?</li></ul></div></article><article><div class="process-number">04</div><div><h3>Познакомь кандидата с командой</h3><p>С согласия девушки передай её имя, полный возраст, страну и город, обычные фотографии, которые она разрешила использовать, и краткие ответы на вопросы выше. Прежде чем передавать первого кандидата, согласуй с командой порядок закрепления модели за тобой.</p><p>Компания проводит итоговый отбор и проверку совершеннолетия напрямую с моделью. Скаут не собирает фотографии документов. После одобрения команда готовит модель к работе и фиксирует дату запуска.</p><p>После передачи рабочие вопросы модели — аккаунты, контент, график, заработок и внутренние процессы — ведёт компания. Так ответственность за сопровождение остаётся у команды.</p></div></article></div>
<div class="editor-note"><span>Как фиксируется результат</span><p>Кандидат, одобрение, дата начала работы, расчётные месяцы и активность подтверждаются компанией. Учёт ведётся вручную через Telegram. Порядок подтверждений нужно согласовать до первой передачи.</p></div>
'''


def calculator():
    return '''<div class="calculator" data-scout-calculator><div class="calc-controls"><span class="eyebrow">Посчитай свой пример</span><h3>От одной модели<br>к нескольким.</h3><div class="range-heading"><label for="model-count">Моделей завершили все 3 месяца</label><output id="model-count-label" for="model-count">3</output></div><input id="model-count" type="range" min="1" max="10" step="1" value="3" aria-describedby="calc-note"><div class="range-labels"><span>1 модель</span><span>10 моделей</span></div><p id="calc-note" class="small">Каждая модель одобрена, выполняет рабочий план и завершает все три полных месяца. VIP-процент в этот пример не входит.</p></div><div class="calc-result"><span class="eyebrow">Вознаграждение за три месяца</span><output class="calc-total" data-total aria-live="polite">$9 000</output><div class="calc-months"><div><span>За 1-й месяц</span><strong data-month>$3 000</strong></div><div><span>За 2-й месяц</span><strong data-month>$3 000</strong></div><div><span>За 3-й месяц</span><strong data-month>$3 000</strong></div></div><p class="small">Это расчёт по условиям программы. Он не предсказывает, сколько моделей ты привлечёшь.</p></div></div>'''


REWARDS = '''
<div class="reward-intro"><div class="reward-number">$3 000<span>за модель</span></div><div class="reading-copy"><p class="lead">Три полных месяца работы.<br>Три этапа вознаграждения.</p><p>За каждую одобренную модель предусмотрено по $1 000 после каждого из первых трёх полных расчётных месяцев при выполнении условий программы.</p><p>Даты периодов фиксируются после запуска. Передача контакта и предварительное одобрение сами по себе не создают выплату. Полное вознаграждение связано с завершением всего трёхмесячного периода.</p></div></div>
<ol class="payment-timeline"><li><span>01 / Первый полный месяц</span><strong>$1 000</strong><p>После подтверждения первого рабочего периода.</p></li><li><span>02 / Второй полный месяц</span><strong>$1 000</strong><p>Модель продолжает работу и выполняет согласованный план.</p></li><li><span>03 / Третий полный месяц</span><strong>$1 000</strong><p>Обязательный период завершён. Всего — $3 000.</p></li></ol>
''' + calculator() + '''
<div class="subsection early-section" id="early"><div class="subhead"><span class="eyebrow">Если модель завершила работу раньше</span><h3>Как меняется<br>окончательный расчёт.</h3><p>Ранние перечисления связаны с прохождением всей программы. При досрочном уходе действуют следующие условия.</p></div><dl class="early-rules"><div><dt>В течение первого месяца</dt><dd>Полный месяц не завершён — вознаграждение не начисляется.</dd></div><div><dt>В течение второго месяца</dt><dd>Ранее перечисленная сумма учитывается как аванс и засчитывается при выплате за следующую одобренную модель этого скаута.</dd></div><div><dt>В течение третьего месяца</dt><dd>Третий платёж не начисляется. Обязательный период не выполнен, поэтому окончательный расчёт пересматривается с компанией.</dd></div><div><dt>Завершены все три месяца</dt><dd>При выполнении рабочего плана полное вознаграждение — $3 000. Низкий доход модели сам по себе не отменяет выплату скауту.</dd></div></dl></div>
<div class="vip-section" id="vip"><div class="vip-heading"><span class="eyebrow">Следующий уровень / VIP для скаутов</span><h3>Развивай сеть.<br><em>Увеличивай долю.</em></h3><p>От 10 активных моделей открывается дополнительный процент от подтверждённого заработка твоей сети.</p></div><div class="vip-levels"><div><span>10–14 активных моделей</span><strong>5<small>%</small></strong><i style="--level:50%" aria-hidden="true"></i></div><div><span>15–19 активных моделей</span><strong>7<small>%</small></strong><i style="--level:70%" aria-hidden="true"></i></div><div><span>20–29 активных моделей</span><strong>9<small>%</small></strong><i style="--level:90%" aria-hidden="true"></i></div><div><span>30+ активных моделей</span><strong>10<small>%</small></strong><i style="--level:100%" aria-hidden="true"></i></div></div><div class="vip-explanation"><div><h4>Учитывается действующая сеть</h4><p>Активная модель одобрена, начала работу, выполняет согласованный график и продолжает сотрудничество. Ушедшие и временно неактивные модели не учитываются до восстановления активности.</p><p>Уровень пересчитывается по текущей сети. Например, при снижении с 20 до 18 активных моделей применяется 7%. Если активных моделей становится меньше 10, VIP-выплаты приостанавливаются.</p></div><div><h4>Как выглядит расчёт</h4><p>Если 10 активных моделей имеют по $3 000 подтверждённого заработка за период, то при ставке 5% пример начисления составляет:</p><p class="vip-equation">10 × $3 000 × 5%<br><strong>= $1 500</strong></p><p class="small">$3 000 здесь — условная расчётная база одной модели. Конкретную базу VIP-начислений нужно подтвердить с компанией.</p></div></div></div>
'''

QUESTIONS = [
('Можно начать без опыта в скаутинге?', 'Да. Начни с изучения программы и одного понятного источника кандидатов. В анкете внизу расскажи, где ты планируешь искать людей и как хочешь начать разговор. Это поможет команде понять твой подход.'),
('Нужно ли скауту самому работать моделью?', 'Нет. Скаут занимается поиском и первичным знакомством. График эфиров, оборудование и доля дохода, описанные в разделе об условиях моделей, относятся к работе модели.'),
('Кто принимает решение о запуске модели?', 'Компания проводит итоговый отбор, проверяет совершеннолетие и согласует условия напрямую с моделью. Первичный интерес кандидата ещё не означает одобрение. Скаут помогает передать понятную и достоверную информацию.'),
('Что происходит, если заработок модели ниже ожиданий?', 'Если компания одобрила модель, она выполнила согласованный рабочий план и завершила три полных месяца, низкий доход сам по себе не отменяет вознаграждение скауту. Это действует при правдивых данных и соблюдении скаутом условий программы.'),
('Когда и каким способом переводятся деньги?', 'На сайте описан порядок начисления после полных расчётных месяцев. Точные даты перевода, валюта, способ и возможные комиссии согласовываются с компанией в Telegram. Завершение рабочего месяца и поступление перевода могут приходиться на разные даты.'),
('Что важно согласовать до первого кандидата?', 'Порядок закрепления модели за скаутом, подтверждение одобрения и даты начала, границы расчётных периодов, базу VIP-процента и способ выплаты. Договорённости стоит зафиксировать в переписке до передачи кандидата.'),
('Когда начисления могут приостановить?', 'При обоснованных признаках мошенничества: вымышленных кандидатах, дубликатах, ложных данных или фотографиях, а также вмешательстве скаута в работу модели. На период проверки начисления могут приостановить. Подтверждённое нарушение может привести к аннулированию связанных выплат и VIP-процента.'),
('Что будет после заполнения анкеты?', 'Сайт подготовит сообщение с твоими ответами. Ты проверишь текст, откроешь Telegram и отправишь сообщение команде. Само заполнение анкеты или открытие чата ещё не означает, что обращение отправлено.')
]


def questions():
    items = ''.join(f'<details><summary>{q}<span aria-hidden="true">+</span></summary><div class="answer"><p>{a}</p></div></details>' for q, a in QUESTIONS)
    return '<div class="faq-toolbar"><p>Можно раскрыть отдельный вопрос или прочитать все ответы подряд.</p><button class="text-link" type="button" data-expand-faq hidden>Развернуть все ответы</button></div><div class="faq">' + items + '</div>'


def application(mode='scout'):
    html = quiz(mode)
    changes = {
        'Твой следующий шаг · около 2 минут': '06 / Анкета скаута',
        'Давай познакомимся.<br><em>С твоего плана.</em>': 'Есть план?<br><em>Давай познакомимся.</em>',
        'Расскажи, какой у тебя круг общения и как хочешь начать. Команда получит конкретное обращение и сможет перейти к делу.': 'Если условия программы тебе подходят, расскажи о своём первом шаге. Так команда сразу поймёт, с кем знакомится и что стоит обсудить.',
        'Мой следующий шаг ↗': 'Далее: мой план →',
        'Можно переходить к знакомству.': 'Проверь сообщение перед отправкой.',
        'Открыть Telegram ↗': 'Открыть чат в Telegram →',
        'Подробнее</a>': 'Как используются ответы</a>',
        '<section class="section application" id="apply">': f'<section class="application chapter" id="apply" data-chapter="06" data-chapter-title="Анкета {"скаута" if mode == "scout" else "модели"}">',
        'Хочу выстроить свой путь': 'Пока выбираю способ поиска',
        'Есть подруги и взрослое окружение': 'Есть совершеннолетние знакомые',
        'Изучаю возможность и готовлю план': 'Хочу обсудить свой первый шаг'
    }
    for old, new in changes.items():
        html = html.replace(old, new)
    if mode == "model":
        html = html.replace("Далее: мой план →", "Далее: готовность к старту →")
    return html


HERO = '''<section class="hero"><div class="hero-media"><img src="/assets/portrait.svg" width="1122" height="1402" fetchpriority="high" alt="Портрет для визуальной истории SCAUTDOM"></div><div class="hero-shade"></div><div class="wrap hero-inner"><div class="hero-copy"><p class="eyebrow">SCAUTDOM / Партнёрская программа для скаутов</p><h1>Твой талант —<br>замечать<br><em>людей.</em></h1><p class="hero-lead">Находи девушек для работы вебкам-моделями на Chaturbate. Знакомь их с командой, которая обучает и помогает запуститься. Получай вознаграждение за результат.</p>''' + action('Узнать, как работает скаут', '#role') + '''<p class="hero-note">Все условия — ниже, по порядку.<br>Анкета для знакомства с командой — в конце.</p></div><div class="hero-side-note"><span>Твой круг общения.</span><span>Новые возможности.</span></div><span class="hero-image-credit">Фотоиллюстрация · ИИ</span></div></section>
<div class="offer-strip"><div class="wrap offer-inner"><p><span>Вознаграждение скаута</span><strong>до $3 000</strong></p><p>За одобренную модель, которая выполнит условия<br>и завершит три полных месяца работы.</p><span class="offer-mark" aria-hidden="true">↓</span></div></div>'''

home = HERO
home += section('role','01','Роль скаута','Хорошее знакомство.<br><em>Большое начало.</em>','',ROLE,following=('02','Условия работы моделей','#models'))
home += section('models','02','Условия моделей','Чтобы заинтересовать,<br><em>нужно понимать.</em>','Вот что важно объяснить девушке до знакомства с командой: сам формат, поддержка, график, подготовка и деньги.',MODEL,'paper',('03','Как работает скаут','#workflow'))
home += section('workflow','03','Как работать','От первого разговора<br><em>до запуска модели.</em>','Четыре последовательных шага. Сначала твоя работа с кандидатом, затем — работа команды.',WORKFLOW,following=('04','Вознаграждение и правила выплат','#rewards'))
home += section('rewards','04','Выплаты','Твой результат.<br><em>В конкретных цифрах.</em>','Разберись в трёхмесячной программе и VIP-проценте. Так ты сможешь планировать работу и правильно объяснять условия.',REWARDS,'paper',('05','Ответы перед началом работы','#questions'))
home += section('questions','05','Вопросы','Остались вопросы?<br><em>Разберём по существу.</em>','',questions(),following=('06','Анкета для знакомства с командой','#apply'))
home += application()
write('index.html','SCAUTDOM — работа скаутом: программа, условия и выплаты','Подробная программа для скаутов SCAUTDOM: роль, условия моделей, порядок работы, вознаграждение до $3 000 за модель и VIP. Анкета после изучения условий.',home)


def reference_hero(number, label, title, description, start):
    return f'<section class="reference-hero wrap"><a class="back-link" href="/">← Вся программа по порядку</a><p class="eyebrow">Раздел {number} / {label}</p><h1>{title}</h1><p class="hero-lead">{description}</p>{action("Читать этот раздел",start)}</section>'


def reference_next(number, label, url):
    return '<div class="wrap reference-next">' + next_chapter(number, label, url) + '</div>'

model_page = reference_hero('02','Условия моделей','Знать предложение.<br><em>Объяснять уверенно.</em>','Материал для скаута: кого приглашать, как устроена работа модели и какие условия важно обсудить заранее.','#models')
model_page += section('models','02','Условия моделей','Что получает модель.<br><em>И как проходит работа.</em>','',MODEL,'paper')
model_page += reference_next('03','Далее: инструкция для скаута','/scout.html')
model_page += '<section class="model-self wrap"><details><summary>Рассматриваешь работу моделью для себя? <span aria-hidden="true">+</span></summary><p>Если ты изучила условия и хочешь обсудить свой старт, здесь можно подготовить отдельное обращение модели.</p>'+application('model')+'</details></section>'
write('model.html','Условия работы моделей — материал для скаута SCAUTDOM','Формат Chaturbate, обучение, график, рабочее место, базовая доля модели 50% и VIP. Подробный материал для первого разговора с кандидатом.',model_page)

scout_page = reference_hero('03','Как работать','Хороший контакт —<br><em>только начало.</em>','Подробная инструкция для скаута: источники кандидатов, первый разговор, вопросы до передачи и знакомство с командой.','#workflow')
scout_page += section('workflow','03','Как работать','Знакомство.<br>Подготовка.<br><em>Передача команде.</em>','',WORKFLOW)
scout_page += '<div id="apply" class="reference-bridge wrap"><p>Следующий раздел объясняет, за что начисляется вознаграждение и как считается досрочный уход. Анкета скаута находится в конце полной программы.</p>'+action('Далее: правила выплат','/payments.html')+ '<a class="text-link" href="/#role">Прочитать программу с начала</a></div>'
write('scout.html','Как работает скаут SCAUTDOM — инструкция и пример сообщения','Как найти подходящего кандидата, объяснить работу вебкам-моделью, уточнить готовность и познакомить с командой. Порядок работы скаута.',scout_page)

payments_page = reference_hero('04','Выплаты','Понимать цифры.<br><em>Планировать рост.</em>','Базовое вознаграждение за три полных месяца, досрочный уход и VIP-процент от активной сети.','#rewards')
payments_page += section('rewards','04','Выплаты','От одной модели<br><em>к активной сети.</em>','',REWARDS,'paper')
payments_page += reference_next('05','Далее: вопросы перед анкетой','/#questions')
write('payments.html','Выплаты скаутам SCAUTDOM — три месяца и VIP','До $3 000 за одобренную модель: три этапа по $1 000, условия досрочного ухода и VIP-программа 5–10%. Наглядный расчёт и подробные правила.',payments_page)

privacy = '''<section class="reference-hero wrap"><a class="back-link" href="/">← Вся программа</a><p class="eyebrow">Информация о данных</p><h1>Твоё сообщение.<br><em>Твой контроль.</em></h1></section><section class="paper chapter"><div class="wrap privacy-copy"><h2>Что делает анкета</h2><p>Анкета подготавливает текст сообщения на твоём устройстве. Ответы не записываются в cookies, localStorage или sessionStorage и не отправляются в базу заявок сайта. После обновления страницы ответы могут исчезнуть.</p><h2>Как команда получает обращение</h2><p>Кнопка Telegram открывает чат @scauttdom с подготовленным текстом. Само открытие чата не означает отправку или получение заявки. Проверь текст и нажми «Отправить» в Telegram. Если текст не подставился, можно скопировать его вручную.</p><p>При переходе текст передаётся сервису Telegram в адресе ссылки для создания черновика. Не вписывай в анкету паспортные данные, документы, сведения о третьих лицах и другую чувствительную информацию.</p><h2>Что входит в сообщение</h2><p>Выбранная роль, ответы анкеты, случайный код обращения и метки рекламного источника, если они были в ссылке. Метки помогают понять, откуда пришёл человек. Не размещайте в них персональные данные. Они передаются по внутренним ссылкам, но не сохраняются в браузерном хранилище.</p><h2>Технические события</h2><p>Сайт создаёт технические события начала анкеты, подготовки текста, использования калькулятора и перехода в Telegram. В них нет ответов анкеты, имени или свободного текста. Отдельный сборщик отчётов не подключён. Рекламный Meta Pixel не загружается. Хостинг и Telegram могут обрабатывать технические данные по своим условиям.</p><h2>Сведения о кандидатах</h2><p>Скаут передаёт информацию о совершеннолетнем кандидате с его разрешения. Проверка личности проводится компанией напрямую. Документы через анкету сайта не запрашиваются.</p><h2>Вопросы о переданной информации</h2><p>Чтобы обсудить исправление или удаление информации, отправленной команде, обратись в тот же <a href="https://t.me/scauttdom" rel="noopener noreferrer">чат @scauttdom в Telegram</a>. Сторону договора и порядок дальнейшей обработки данных нужно согласовать с командой перед передачей документов и началом работы.</p></div></section>'''
write('privacy.html','Конфиденциальность — SCAUTDOM','Как анкета SCAUTDOM подготавливает сообщение и передаёт его в Telegram, какие данные и метки используются.',privacy)
write('404.html','Страница не найдена — SCAUTDOM','Вернуться к полной программе для скаутов SCAUTDOM.','<section class="reference-hero wrap error-page"><p class="eyebrow">Ошибка 404</p><h1>Страница<br><em>не найдена.</em></h1><p class="hero-lead">Все условия программы и анкета скаута доступны на главной странице.</p>'+action('Открыть полную программу','/')+'</section>')
(ROOT/'sitemap.xml').write_text('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join(f'<url><loc>https://www.scautdom.com{p}</loc></url>' for p in ['/','/model.html','/scout.html','/payments.html','/privacy.html'])+'</urlset>')
(ROOT/'robots.txt').write_text('User-agent: *\nAllow: /\nSitemap: https://www.scautdom.com/sitemap.xml\n')
print('Built complete programme and five supporting routes.')
