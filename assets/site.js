/* =====================================================================
   Port-Artur — shared site script
   i18n (extensible), header/footer injection, calendar, booking form.
   No backend. State kept in localStorage with in-memory fallback.
   ===================================================================== */
(function () {
  "use strict";

  /* ----------------------------- CONFIG ----------------------------- */
  // To add a language: add an entry here + provide data-l="<code>" blocks
  // in page content and a matching column in the I18N dictionary below.
  var LANGS = [
    { code: "ru", label: "RU" },
    { code: "zh", label: "中文" }
  ];

  var CONTACTS = {
    telegram: { handle: "placeholder", label: "@placeholder" },
    wechat:   { id: "ID-placeholder" },
    email:    "name@example.com"
  };

  var PROGRAMS = {
    "dalian": {
      ru: { name: "Центр Даляня", dur: "4–5 часов", price: "от 1000 ¥",
            tip: "Город-палимпсест четырёх эпох: круглая площадь Чжуншань, русская улица, вокзал, японский квартал, порт. Пешком, 4–5 часов." },
      zh: { name: "大连市中心", dur: "4–5 小时", price: "自 1000 ¥",
            tip: "四个时代的层叠之城：中山圆形广场、俄罗斯风情街、火车站、日式街区、港口。步行，4–5 小时。" },
      href: "dalian.html"
    },
    "port-artur": {
      ru: { name: "Порт-Артур / Люйшунь", dur: "6–8 часов", price: "от 1800 ¥",
            tip: "Места войны 1904–1905 годов: высоты, форты, военное кладбище. Пять точек, собранных в одну линию разговора. 6–8 часов." },
      zh: { name: "旅顺", dur: "6–8 小时", price: "自 1800 ¥",
            tip: "1904–1905年战争发生地：高地、堡垒、军人墓地。五个地点串成一条叙述线。6–8 小时。" },
      href: "port-artur.html"
    }
  };
  var PROGRAM_ORDER = ["dalian", "port-artur"];

  /* Illustrative availability stub. Real data connects later.
     Deterministic: marks some weekdays busy for the displayed months. */
  function isBusy(d) {
    // busy if (day-of-month * (month+1)) % 7 === 0  → scattered, deterministic
    var k = (d.getDate() * (d.getMonth() + 1)) % 7;
    return k === 0 || k === 3;
  }

  /* ----------------------------- I18N ------------------------------- */
  var I18N = {
    ru: {
      brand_name: "Историк в Даляне",
      brand_sub: "Авторские исторические программы",
      nav_home: "Главная",
      nav_dalian: "Центр Даляня",
      nav_portartur: "Порт-Артур",
      nav_historian: "Историк",
      nav_contacts: "Контакты",
      cta_request: "Запросить дату",
      hdr_write: "Написать",
      foot_rights: "Авторские исторические программы",
      foot_programs: "Программы",
      contact_eyebrow: "Контакты",
      contact_h: "Запросить дату и обсудить программу",
      contact_lead: "Напишите в удобный канал. Отвечает автор; согласуем дату, число участников и детали маршрута.",
      c_telegram: "Telegram",
      c_wechat: "WeChat",
      c_email: "Email",
      c_city: "Город",
      c_city_val: "Далянь · Люйшунь, КНР",
      booking_eyebrow: "Запись",
      booking_h: "Календарь и заявка",
      plaques_label: "Описание программ",
      plaque_here: "вы здесь",
      crosslink_pre: "Посмотреть прогулку",
      booking_lead: "Выберите свободную дату и оставьте заявку. Это не оплата: форма собирает данные и формирует текст для отправки в мессенджер или на почту.",
      cal_illustrative: "Календарь иллюстративный. Реальные свободные даты подключаются позже — итоговую дату подтверждает автор.",
      lg_free: "свободно",
      lg_busy: "занято",
      lg_sel: "выбрано",
      f_program: "Программа",
      f_date: "Дата",
      f_people: "Человек",
      f_name: "Имя",
      f_comment: "Комментарий",
      f_comment_ph: "Пожелания, язык гостей, вопросы по маршруту",
      f_pick_date: "— выберите в календаре —",
      f_make: "Сформировать заявку",
      f_send_label: "Отправить заявку:",
      f_send_tg: "В Telegram",
      f_send_email: "На email",
      f_copy: "Скопировать текст",
      f_copied: "Скопировано",
      f_need_date: "Выберите дату в календаре.",
      f_need_name: "Укажите имя.",
      req_title: "Заявка на историческую программу",
      req_program: "Программа",
      req_date: "Дата",
      req_people: "Человек",
      req_name: "Имя",
      req_comment: "Комментарий",
      people_unit: "чел.",
      ru_notice: ""
    },
    zh: {
      brand_name: "大连历史讲者",
      brand_sub: "作者历史项目",
      nav_home: "首页",
      nav_dalian: "大连市中心",
      nav_portartur: "旅顺",
      nav_historian: "讲者",
      nav_contacts: "联系",
      cta_request: "预约日期",
      hdr_write: "联系",
      foot_rights: "作者历史项目",
      foot_programs: "项目",
      contact_eyebrow: "联系",
      contact_h: "预约日期并商讨项目内容",
      contact_lead: "请通过方便的渠道联系。由作者本人回复，确认日期、人数与路线细节。",
      c_telegram: "Telegram",
      c_wechat: "微信",
      c_email: "邮箱",
      c_city: "城市",
      c_city_val: "中国 · 大连 · 旅顺",
      booking_eyebrow: "预约",
      booking_h: "日历与申请",
      plaques_label: "项目说明",
      plaque_here: "当前页面",
      crosslink_pre: "查看项目",
      booking_lead: "选择空闲日期并提交申请。这不是付款：表单仅收集信息并生成可发送至即时通讯或邮箱的文本。",
      cal_illustrative: "日历仅供示意。真实空闲日期稍后接入 — 最终日期由作者确认。",
      lg_free: "空闲",
      lg_busy: "已约",
      lg_sel: "已选",
      f_program: "项目",
      f_date: "日期",
      f_people: "人数",
      f_name: "姓名",
      f_comment: "备注",
      f_comment_ph: "需求、客人语言、关于路线的问题",
      f_pick_date: "— 在日历中选择 —",
      f_make: "生成申请",
      f_send_label: "发送申请：",
      f_send_tg: "发往 Telegram",
      f_send_email: "发往邮箱",
      f_copy: "复制文本",
      f_copied: "已复制",
      f_need_date: "请在日历中选择日期。",
      f_need_name: "请填写姓名。",
      req_title: "历史项目申请",
      req_program: "项目",
      req_date: "日期",
      req_people: "人数",
      req_name: "姓名",
      req_comment: "备注",
      people_unit: "人",
      ru_notice: "本项目以俄语进行。"
    }
  };

  var DOW = {
    ru: ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"],
    zh: ["一", "二", "三", "四", "五", "六", "日"]
  };
  var MONTHS = {
    ru: ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"],
    zh: ["一月","二月","三月","四月","五月","六月","七月","八月","九月","十月","十一月","十二月"]
  };

  /* ---------------------------- STATE ------------------------------- */
  var mem = {};
  function store(k, v) {
    try { localStorage.setItem(k, v); } catch (e) { mem[k] = v; }
  }
  function restore(k) {
    try { var v = localStorage.getItem(k); return v === null ? mem[k] : v; }
    catch (e) { return mem[k]; }
  }

  var state = {
    lang: "ru",
    selDate: null,         // Date object
    calYear: null,
    calMonth: null
  };

  function t(key) {
    var d = I18N[state.lang] || I18N.ru;
    return (key in d) ? d[key] : (I18N.ru[key] || key);
  }

  /* --------------------------- LANGUAGE ----------------------------- */
  function applyLangVisibility() {
    // CSS already hides [data-l] of inactive langs for ru/zh. For extra langs,
    // inject rules dynamically so adding a LANG needs no CSS edit.
    document.documentElement.setAttribute("data-lang", state.lang);
  }

  function ensureLangCss() {
    if (document.getElementById("lang-css")) return;
    var css = "";
    LANGS.forEach(function (L) {
      LANGS.forEach(function (Other) {
        if (L.code !== Other.code) {
          css += '[data-lang="' + L.code + '"] [data-l="' + Other.code + '"]{display:none !important;}';
        }
      });
    });
    var s = document.createElement("style");
    s.id = "lang-css";
    s.textContent = css;
    document.head.appendChild(s);
  }

  function setLang(code) {
    state.lang = code;
    store("pa_lang", code);
    document.documentElement.lang = code;
    applyLangVisibility();
    applyI18n();
    renderCalendar();
    // reflect on switch buttons
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === code ? "true" : "false");
    });
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      el.textContent = t(el.getAttribute("data-i18n"));
    });
    document.querySelectorAll("[data-i18n-ph]").forEach(function (el) {
      el.setAttribute("placeholder", t(el.getAttribute("data-i18n-ph")));
    });
  }

  /* ---------------------------- HEADER ------------------------------ */
  function buildHeader() {
    var host = document.querySelector("[data-site-header]");
    if (!host) return;
    var page = host.getAttribute("data-page") || "";

    var langBtns = LANGS.map(function (L) {
      return '<button type="button" data-lang="' + L.code + '" aria-pressed="' +
        (L.code === state.lang ? "true" : "false") + '">' + L.label + "</button>";
    }).join("");

    var nav = [
      ["index.html", "nav_home", "home"],
      ["dalian.html", "nav_dalian", "dalian"],
      ["port-artur.html", "nav_portartur", "port-artur"],
      ["historian.html", "nav_historian", "historian"],
      ["contacts.html", "nav_contacts", "contacts"]
    ].map(function (n) {
      return '<a href="' + n[0] + '"' + (n[2] === page ? ' aria-current="page"' : "") +
        ' data-i18n="' + n[1] + '"></a>';
    }).join("");

    host.innerHTML =
      '<div class="site-header">' +
        '<div class="site-header-top">' +
          '<a class="brand" href="index.html">' +
            '<span class="brand-glyph">大连</span>' +
            '<span><span class="brand-name" data-i18n="brand_name"></span>' +
            '<span class="brand-sub" data-i18n="brand_sub"></span></span>' +
          '</a>' +
          '<div class="header-actions">' +
            '<div class="header-contacts">' +
              '<a href="https://t.me/' + CONTACTS.telegram.handle + '" data-i18n="c_telegram"></a>' +
              '<a href="mailto:' + CONTACTS.email + '" data-i18n="c_email"></a>' +
            '</div>' +
            '<div class="lang-switch">' + langBtns + '</div>' +
            '<a href="#booking" class="btn btn--sm" data-i18n="cta_request"></a>' +
            '<button type="button" class="nav-toggle" aria-label="Menu" aria-expanded="false"><span></span></button>' +
          '</div>' +
        '</div>' +
        '<nav class="site-nav"><div class="site-nav-inner">' + nav + '</div></nav>' +
      '</div>';

    var headerEl = host.querySelector(".site-header");
    host.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.addEventListener("click", function () { setLang(b.dataset.lang); });
    });
    var toggle = host.querySelector(".nav-toggle");
    toggle.addEventListener("click", function () {
      var open = headerEl.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    host.querySelectorAll(".site-nav a").forEach(function (a) {
      a.addEventListener("click", function () {
        headerEl.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
    // shadow on scroll
    var onScroll = function () {
      if (window.scrollY > 8) headerEl.classList.add("scrolled");
      else headerEl.classList.remove("scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  /* ---------------------------- FOOTER ------------------------------ */
  function buildFooter() {
    var host = document.querySelector("[data-site-footer]");
    if (!host) return;
    var year = new Date().getFullYear();
    host.innerHTML =
      '<section class="contact-band" id="contacts">' +
        '<div class="wrap contact-grid">' +
          '<div>' +
            '<div class="eyebrow" data-i18n="contact_eyebrow"></div>' +
            '<h2 data-i18n="contact_h"></h2>' +
            '<p class="lead" style="color:rgba(239,231,210,0.7);max-width:46ch" data-i18n="contact_lead"></p>' +
          '</div>' +
          '<dl class="contact-list">' +
            '<dt data-i18n="foot_programs"></dt>' +
            '<dd><a href="dalian.html" data-i18n="nav_dalian"></a></dd>' +
            '<dd><a href="port-artur.html" data-i18n="nav_portartur"></a></dd>' +
            '<dd><a href="historian.html" data-i18n="nav_historian"></a></dd>' +
            '<dd><a href="contacts.html" data-i18n="nav_contacts"></a></dd>' +
          '</dl>' +
          '<dl class="contact-list">' +
            '<dt data-i18n="c_telegram"></dt><dd><a href="https://t.me/' + CONTACTS.telegram.handle + '">' + CONTACTS.telegram.label + '</a></dd>' +
            '<dt data-i18n="c_wechat"></dt><dd>' + CONTACTS.wechat.id + '</dd>' +
            '<dt data-i18n="c_email"></dt><dd><a href="mailto:' + CONTACTS.email + '">' + CONTACTS.email + '</a></dd>' +
            '<dt data-i18n="c_city"></dt><dd data-i18n="c_city_val"></dd>' +
          '</dl>' +
        '</div>' +
        '<div class="foot">' +
          '<span>© ' + year + ' · <span data-i18n="foot_rights"></span></span>' +
          '<span data-i18n="c_city_val"></span>' +
        '</div>' +
      '</section>';
  }

  /* --------------------------- CALENDAR ----------------------------- */
  function sameDay(a, b) {
    return a && b && a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  function renderCalendar() {
    var host = document.querySelector("[data-calendar]");
    if (!host) return;
    var now = new Date(); now.setHours(0, 0, 0, 0);
    if (state.calYear === null) { state.calYear = now.getFullYear(); state.calMonth = now.getMonth(); }

    var y = state.calYear, m = state.calMonth;
    var first = new Date(y, m, 1);
    var startDow = (first.getDay() + 6) % 7; // Monday-first
    var daysInMonth = new Date(y, m + 1, 0).getDate();

    var dow = DOW[state.lang].map(function (d) { return "<span>" + d + "</span>"; }).join("");

    var cells = "";
    for (var i = 0; i < startDow; i++) cells += '<div class="cal-cell empty"></div>';
    for (var day = 1; day <= daysInMonth; day++) {
      var d = new Date(y, m, day);
      var cls = "cal-cell ";
      var disabled = false;
      if (d < now) { cls += "past"; disabled = true; }
      else if (isBusy(d)) { cls += "busy"; disabled = true; }
      else { cls += "free"; }
      if (sameDay(d, state.selDate)) cls += " sel";
      cells += '<button type="button" class="' + cls + '"' +
        (disabled ? " disabled" : "") +
        ' data-day="' + day + '">' + day + "</button>";
    }

    host.innerHTML =
      '<div class="cal">' +
        '<div class="cal-head">' +
          '<div class="cal-title">' + MONTHS[state.lang][m] + " " + y + '</div>' +
          '<div class="cal-nav">' +
            '<button type="button" data-cal="prev" aria-label="prev">‹</button>' +
            '<button type="button" data-cal="next" aria-label="next">›</button>' +
          '</div>' +
        '</div>' +
        '<div class="cal-dow">' + dow + '</div>' +
        '<div class="cal-grid">' + cells + '</div>' +
        '<div class="cal-legend">' +
          '<span class="lg-free"><i></i><span data-i18n="lg_free"></span></span>' +
          '<span class="lg-busy"><i></i><span data-i18n="lg_busy"></span></span>' +
          '<span class="lg-sel"><i></i><span data-i18n="lg_sel"></span></span>' +
        '</div>' +
        '<div class="cal-illus" data-i18n="cal_illustrative"></div>' +
        '<div class="cal-weather" data-cal-weather></div>' +
      '</div>';

    host.querySelector('[data-cal="prev"]').addEventListener("click", function () {
      state.calMonth--; if (state.calMonth < 0) { state.calMonth = 11; state.calYear--; } renderCalendar();
    });
    host.querySelector('[data-cal="next"]').addEventListener("click", function () {
      state.calMonth++; if (state.calMonth > 11) { state.calMonth = 0; state.calYear++; } renderCalendar();
    });
    host.querySelectorAll(".cal-cell.free, .cal-cell.sel").forEach(function (c) {
      if (c.disabled) return;
      c.addEventListener("click", function () {
        state.selDate = new Date(state.calYear, state.calMonth, parseInt(c.dataset.day, 10));
        renderCalendar();
        syncDateField();
      });
    });
    applyI18n();
    updateWeather();
  }

  /* --------------------------- WEATHER ------------------------------ */
  // Live forecast for Dalian via Open-Meteo (no key). Playful utility next
  // to the calendar; fails silently if offline.
  var WX = null;
  var WX_DESC = {
    0:  { ru: "ясно",            zh: "晴",     ic: "\u2600" },
    1:  { ru: "в основном ясно", zh: "大致晴",  ic: "\u2600" },
    2:  { ru: "переменная облачность", zh: "多云", ic: "\u26C5" },
    3:  { ru: "пасмурно",        zh: "阴",     ic: "\u2601" },
    45: { ru: "туман",          zh: "雾",     ic: "\u2601" },
    48: { ru: "изморозь",       zh: "雾凇",   ic: "\u2601" },
    51: { ru: "морось",         zh: "毛毛雨", ic: "\u2614" },
    53: { ru: "морось",         zh: "毛毛雨", ic: "\u2614" },
    55: { ru: "морось",         zh: "毛毛雨", ic: "\u2614" },
    61: { ru: "небольшой дождь", zh: "小雨",   ic: "\u2614" },
    63: { ru: "дождь",          zh: "中雨",   ic: "\u2614" },
    65: { ru: "сильный дождь",  zh: "大雨",   ic: "\u2614" },
    71: { ru: "небольшой снег", zh: "小雪",   ic: "\u2744" },
    73: { ru: "снег",           zh: "中雪",   ic: "\u2744" },
    75: { ru: "сильный снег",   zh: "大雪",   ic: "\u2744" },
    80: { ru: "ливень",         zh: "阵雨",   ic: "\u2614" },
    81: { ru: "ливень",         zh: "阵雨",   ic: "\u2614" },
    82: { ru: "сильный ливень", zh: "强阵雨", ic: "\u2614" },
    95: { ru: "гроза",          zh: "雷雨",   ic: "\u26A1" }
  };
  function loadWeather() {
    if (!document.querySelector("[data-calendar]")) return;
    var url = "https://api.open-meteo.com/v1/forecast?latitude=38.91&longitude=121.61" +
      "&daily=weathercode,temperature_2m_max,temperature_2m_min&timezone=Asia%2FShanghai&forecast_days=16";
    fetch(url).then(function (r) { return r.json(); }).then(function (j) {
      if (j && j.daily && j.daily.time) {
        WX = {};
        j.daily.time.forEach(function (d, i) {
          WX[d] = { code: j.daily.weathercode[i], hi: Math.round(j.daily.temperature_2m_max[i]), lo: Math.round(j.daily.temperature_2m_min[i]) };
        });
        updateWeather();
      }
    }).catch(function () { /* silent */ });
  }
  function wxLine(key, dayObj, isToday) {
    var dd = WX_DESC[dayObj.code] || { ru: "", zh: "", ic: "\u2601" };
    var label = isToday
      ? (state.lang === "zh" ? "今日大连" : "Сегодня в Даляне")
      : (state.lang === "zh" ? "当日预报" : "Прогноз на дату");
    return '<span class="wx-label">' + label + '</span>' +
      '<span class="wx-ico">' + dd.ic + '</span>' +
      '<span class="wx-temp">+' + dayObj.hi + '\u00B0 / +' + dayObj.lo + '\u00B0</span>' +
      '<span class="wx-desc">' + (state.lang === "zh" ? dd.zh : dd.ru) + '</span>';
  }
  function updateWeather() {
    var el = document.querySelector("[data-cal-weather]");
    if (!el) return;
    if (!WX) {
      el.innerHTML = '<span class="wx-muted">' + (state.lang === "zh" ? "正在加载大连天气\u2026" : "Погода в Даляне загружается\u2026") + '</span>';
      return;
    }
    var todayKey = fmtDate(new Date());
    if (state.selDate) {
      var k = fmtDate(state.selDate);
      if (WX[k]) { el.innerHTML = wxLine(k, WX[k], k === todayKey); return; }
      el.innerHTML = '<span class="wx-muted">' + (state.lang === "zh" ? "该日期较远，临近时再看预报。" : "Дата далёкая — прогноз появится ближе к ней.") + '</span>';
      return;
    }
    if (WX[todayKey]) { el.innerHTML = wxLine(todayKey, WX[todayKey], true); return; }
    el.innerHTML = '';
  }

  function fmtDate(d) {
    if (!d) return "";
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate());
  }

  function syncDateField() {
    var f = document.querySelector("[data-bk-date]");
    if (f) f.value = state.selDate ? fmtDate(state.selDate) : "";
  }

  /* --------------------------- BOOKING ------------------------------ */
  function buildBooking() {
    var host = document.querySelector("[data-booking]");
    if (!host) return;
    var preset = host.getAttribute("data-program") || "";

    var progOptions = Object.keys(PROGRAMS).map(function (key) {
      var sel = key === preset ? " selected" : "";
      return '<option value="' + key + '"' + sel + ' data-name-ru="' + PROGRAMS[key].ru.name +
        '" data-name-zh="' + PROGRAMS[key].zh.name + '">' + PROGRAMS[key].ru.name +
        " / " + PROGRAMS[key].zh.name + "</option>";
    }).join("");

    function plaqueHtml(key, idx) {
      var P = PROGRAMS[key];
      var cur = key === preset ? " is-current" : "";
      var badge = key === preset
        ? '<span class="plaque-kick" style="color:var(--copper)" data-i18n="plaque_here"></span>'
        : '<span class="plaque-kick">0' + (idx + 1) + '</span>';
      return '<a class="plaque tip' + cur + '" href="' + P.href + '">' +
        badge +
        '<span class="plaque-title"><span data-l="ru">' + P.ru.name + '</span><span data-l="zh">' + P.zh.name + '</span></span>' +
        '<span class="plaque-foot">' +
          '<span class="plaque-price"><span data-l="ru">' + P.ru.price + '</span><span data-l="zh">' + P.zh.price + '</span></span>' +
          '<span class="plaque-go"><span data-l="ru">Подробнее →</span><span data-l="zh">详情 →</span></span>' +
        '</span>' +
        '<span class="tip-pop"><span data-l="ru">' + P.ru.tip + '</span><span data-l="zh">' + P.zh.tip + '</span></span>' +
      '</a>';
    }
    var plaquesHtml =
      '<div class="plaques">' +
        '<div class="plaques-label" data-i18n="plaques_label"></div>' +
        '<div class="plaque-row">' +
          PROGRAM_ORDER.map(function (k, i) { return plaqueHtml(k, i); }).join("") +
        '</div>' +
      '</div>';

    var crossHtml = "";
    if (preset) {
      var otherKey = PROGRAM_ORDER.filter(function (k) { return k !== preset; })[0];
      if (otherKey) {
        var O = PROGRAMS[otherKey];
        crossHtml =
          '<a class="crosslink" href="' + O.href + '">' +
            '<span data-i18n="crosslink_pre"></span>&nbsp;—&nbsp;' +
            '<b><span data-l="ru">' + O.ru.name + '</span><span data-l="zh">' + O.zh.name + '</span></b>&nbsp;→' +
          '</a>';
      }
    }

    host.innerHTML =
      '<section class="booking" id="booking">' +
        '<div class="wrap">' +
          '<div class="section-head">' +
            '<span class="eyebrow" data-i18n="booking_eyebrow"></span>' +
            '<h2 class="cu" data-i18n="booking_h"></h2>' +
          '</div>' +
          '<p class="lead" style="margin-bottom:clamp(32px,4vw,48px)" data-i18n="booking_lead"></p>' +
          '<div class="booking-grid">' +
            '<div><div data-calendar></div>' + crossHtml + '</div>' +
            '<form class="bk-form" novalidate>' +
              '<div class="bk-field">' +
                '<label data-i18n="f_program"></label>' +
                '<select data-bk-program>' + progOptions + '</select>' +
              '</div>' +
              '<div class="bk-row">' +
                '<div class="bk-field">' +
                  '<label data-i18n="f_date"></label>' +
                  '<input type="text" data-bk-date readonly data-i18n-ph="f_pick_date">' +
                '</div>' +
                '<div class="bk-field">' +
                  '<label data-i18n="f_people"></label>' +
                  '<input type="number" min="1" max="12" value="2" data-bk-people>' +
                '</div>' +
              '</div>' +
              '<div class="bk-field">' +
                '<label data-i18n="f_name"></label>' +
                '<input type="text" data-bk-name autocomplete="name">' +
              '</div>' +
              '<div class="bk-field">' +
                '<label data-i18n="f_comment"></label>' +
                '<textarea data-bk-comment data-i18n-ph="f_comment_ph"></textarea>' +
              '</div>' +
              '<div class="bk-actions">' +
                '<button type="submit" class="btn" data-i18n="f_make"></button>' +
              '</div>' +
              '<div class="bk-send" data-bk-send>' +
                '<div class="bk-send-label" data-i18n="f_send_label"></div>' +
                '<div class="bk-send-row">' +
                  '<a class="btn btn--sm" target="_blank" rel="noopener" data-bk-tg data-i18n="f_send_tg"></a>' +
                  '<a class="btn btn--sm btn--ghost" data-bk-email data-i18n="f_send_email"></a>' +
                  '<button type="button" class="btn btn--sm btn--ghost" data-bk-copy data-i18n="f_copy"></button>' +
                '</div>' +
                '<div class="bk-preview" data-bk-preview></div>' +
              '</div>' +
            '</form>' +
          '</div>' +
          plaquesHtml +
        '</div>' +
      '</section>';

    var form = host.querySelector(".bk-form");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitBooking(host);
    });
    host.querySelector("[data-bk-copy]").addEventListener("click", function () {
      var txt = host.querySelector("[data-bk-preview]").textContent;
      var btn = this;
      navigator.clipboard && navigator.clipboard.writeText(txt).then(function () {
        btn.textContent = t("f_copied");
        setTimeout(function () { btn.textContent = t("f_copy"); }, 1600);
      });
    });
  }

  function submitBooking(host) {
    var prog = host.querySelector("[data-bk-program]");
    var people = host.querySelector("[data-bk-people]").value || "1";
    var name = (host.querySelector("[data-bk-name]").value || "").trim();
    var comment = (host.querySelector("[data-bk-comment]").value || "").trim();

    if (!state.selDate) { alert(t("f_need_date")); return; }
    if (!name) { alert(t("f_need_name")); return; }

    var opt = prog.options[prog.selectedIndex];
    var progName = opt.getAttribute("data-name-" + state.lang) || opt.getAttribute("data-name-ru");

    var lines = [
      t("req_title"),
      t("req_program") + ": " + progName,
      t("req_date") + ": " + fmtDate(state.selDate),
      t("req_people") + ": " + people + " " + t("people_unit"),
      t("req_name") + ": " + name
    ];
    if (comment) lines.push(t("req_comment") + ": " + comment);
    var text = lines.join("\n");

    var sendBox = host.querySelector("[data-bk-send]");
    sendBox.classList.add("on");
    host.querySelector("[data-bk-preview]").textContent = text;

    var enc = encodeURIComponent(text);
    host.querySelector("[data-bk-tg]").href = "https://t.me/" + CONTACTS.telegram.handle;
    host.querySelector("[data-bk-email]").href =
      "mailto:" + CONTACTS.email + "?subject=" + encodeURIComponent(t("req_title")) + "&body=" + enc;

    // stash text so the Telegram tab user can paste; also keep on clipboard-friendly preview
    sendBox.scrollIntoView ? null : null;
  }

  /* --------------------------- CAROUSEL ----------------------------- */
  function initCarousels() {
    document.querySelectorAll("[data-carousel]").forEach(function (car) {
      var track = car.querySelector(".carousel-track");
      if (!track) return;
      var slides = Array.prototype.slice.call(track.children);
      if (slides.length < 2) return;

      var controls = document.createElement("div");
      controls.className = "carousel-controls";
      var dots = document.createElement("div");
      dots.className = "carousel-dots";
      var arrows = document.createElement("div");
      arrows.className = "carousel-arrows";
      var prev = document.createElement("button");
      prev.type = "button"; prev.setAttribute("aria-label", "prev"); prev.innerHTML = "\u2039";
      var next = document.createElement("button");
      next.type = "button"; next.setAttribute("aria-label", "next"); next.innerHTML = "\u203a";
      arrows.appendChild(prev); arrows.appendChild(next);
      slides.forEach(function (s, i) {
        var d = document.createElement("button");
        d.type = "button"; d.setAttribute("aria-label", "slide " + (i + 1));
        d.addEventListener("click", function () { goTo(i); });
        dots.appendChild(d);
      });
      controls.appendChild(dots); controls.appendChild(arrows);
      car.appendChild(controls);

      function current() {
        var c = track.scrollLeft, best = 0, bestD = Infinity;
        slides.forEach(function (s, i) {
          var d = Math.abs(s.offsetLeft - track.offsetLeft - c);
          if (d < bestD) { bestD = d; best = i; }
        });
        return best;
      }
      function goTo(i) {
        i = Math.max(0, Math.min(slides.length - 1, i));
        track.scrollTo({ left: slides[i].offsetLeft - track.offsetLeft, behavior: "smooth" });
      }
      function sync() {
        var i = current();
        Array.prototype.forEach.call(dots.children, function (d, j) {
          d.setAttribute("aria-current", j === i ? "true" : "false");
        });
        prev.disabled = i <= 0;
        next.disabled = i >= slides.length - 1;
      }
      prev.addEventListener("click", function () { goTo(current() - 1); });
      next.addEventListener("click", function () { goTo(current() + 1); });
      var raf;
      track.addEventListener("scroll", function () {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(sync);
      }, { passive: true });
      sync();
    });
  }

  /* --------------------------- REVEAL ------------------------------- */
  function initReveal() {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    document.documentElement.classList.add("js-reveal");
    var sel = ".section-head, .teaser, .note, .epoch, .route > li, .topics > article, " +
      ".manifesto, .audience > div, .tcard, .price-row, .anchor-grid, " +
      ".vignette-grid, .dark-cut-grid, .plaque, .cal, .bk-form, .hero-meta-strip";
    var groups = {};
    var items = [];
    var aboveFold = [];
    var vh = window.innerHeight || document.documentElement.clientHeight;
    function hide(el) { el.style.opacity = "0"; el.style.transform = "translateY(16px)"; }
    function reveal(el) { el.style.opacity = ""; el.style.transform = ""; }
    document.querySelectorAll(sel).forEach(function (el) {
      el.setAttribute("data-reveal", "");
      var p = el.parentNode;
      var key = (p && p.className) ? p.className : "_";
      groups[key] = (groups[key] || 0);
      var idx = groups[key]++;
      if (idx > 0) el.style.setProperty("--rd", Math.min(idx * 70, 280) + "ms");
      hide(el);
      items.push(el);
      if (el.getBoundingClientRect().top <= vh * 0.92) aboveFold.push(el);
    });
    // animate the above-the-fold set in on load
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        aboveFold.forEach(reveal);
        items = items.filter(function (el) { return aboveFold.indexOf(el) === -1; });
      });
    });
    function check() {
      var h = window.innerHeight || document.documentElement.clientHeight;
      items = items.filter(function (el) {
        var r = el.getBoundingClientRect();
        if (r.top < h * 0.92 && r.bottom > -40) { reveal(el); return false; }
        return true;
      });
      if (!items.length) {
        window.removeEventListener("scroll", check);
        window.removeEventListener("resize", check);
      }
    }
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    // safety net: never leave anything hidden
    setTimeout(function () { items.forEach(reveal); aboveFold.forEach(reveal); items = []; }, 1500);
  }

  /* ----------------------------- INIT ------------------------------- */
  function init() {
    ensureLangCss();
    var saved = restore("pa_lang");
    state.lang = (saved && I18N[saved]) ? saved : "ru";

    buildHeader();
    buildFooter();
    buildBooking();

    applyLangVisibility();
    applyI18n();
    renderCalendar();
    initCarousels();
    initReveal();
    loadWeather();
    document.querySelectorAll(".lang-switch button").forEach(function (b) {
      b.setAttribute("aria-pressed", b.dataset.lang === state.lang ? "true" : "false");
    });
    document.documentElement.lang = state.lang;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
