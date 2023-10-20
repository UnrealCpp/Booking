const p = (o, e) => {
  const t = o[e];
  return t ? typeof t == "function" ? t() : Promise.resolve(t) : new Promise((a, i) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(i.bind(null, new Error("Unknown variable dynamic import: " + e)));
  });
};
class g {
  constructor(e, t, a) {
    this.name = e, this.start = new Date(...t), this.startUtc = this.start.getUTCHours() + ":" + this.start.getMinutes() + " UTC", this.end = new Date(...a), this.endUtc = this.end.getUTCHours() + ":" + this.end.getMinutes() + " UTC", this.location = [], this.year = this.start.getFullYear(), this.month = this.start.getMonth(), this.day = this.start.getDate();
  }
  addPlace(e) {
    return this.location.push(e), this.location.length;
  }
  show() {
    console.log(this.name + " " + this.start.toLocaleDateString(
      "tr-TR",
      {
        hour: "numeric",
        minute: "numeric"
      }
    ) + " to " + this.end.toLocaleDateString(
      "tr-TR",
      {
        hour: "numeric",
        minute: "numeric"
      }
    )), console.log(this.startUtc), console.log(this.endUtc);
  }
  subtractHours(e, t) {
    return e.setHours(e.getHours() + t), e;
  }
  utc(e) {
    let t = new Date(e), a = this.start.getTimezoneOffset() / 60;
    return this.subtractHours(t, a);
  }
}
class v {
  constructor(e, t = null) {
    this.year = e, this.yearly = [{ y: e, events: [] }], t && this.addEvent(t);
  }
  addEvent(e) {
    let t = this.findByYear(e.year);
    t > -1 ? this.yearly[t].events.push(e) : (this.yearly.push({ y: e.year, events: [e] }), this.sortByYear());
  }
  deleteEvent() {
  }
  findByYear(e) {
    return this.yearly.findIndex((a) => a.y === e);
  }
  sortByYear() {
    this.yearly.sort(function(e, t) {
      return e.y - t.y;
    });
  }
  getEventsForYear(e) {
    let t = this.findByYear(e);
    return this.yearly[t];
  }
  //TODO:
  //if Performance Issues sorting all events in a year make events to pointer leave events array seperate with id pointing to yearly.pointer
  //{y:2020,pointer:5},{y:2021,pointer:0},{y:2022,pointer:3},{y:2023,pointer:1},...   {id:0 events:[2021]},{id:1 events:[2023]},{id:3 events:[2022]},...
  sortByMonth() {
    this.yearly.map((e) => {
      e.events.sort(function(t, a) {
        return t.month - a.month;
      });
    });
  }
  getEventsForMonth(e, t) {
    return this.getEventsForYear(t)?.events.filter((i) => i.month === e);
  }
  findByDate() {
  }
  sortByDate() {
  }
  show() {
    console.log("eby->year:" + this.year), console.log("eby->yearly:" + JSON.stringify(this.yearly));
  }
  test() {
    function e(t, a) {
      return Math.floor(Math.random() * (a - t) + t);
    }
    for (let t = 0; t < 500; t++) {
      let a = e(2022, 2025), i = e(1, 30), n = e(0, 12);
      this.addEvent(new g(
        "rand" + t,
        [a, n, i, e(0, 24), 0, 0],
        [a, n, i, e(0, 24), e(0, 270), 0]
      ));
    }
    this.sortByMonth();
  }
  //
}
class m {
  constructor(e, t) {
    const a = /* @__PURE__ */ new Date();
    this.week = a.getDay(), this.today = a.getDate(), typeof t < "u" && a.getFullYear() !== t && (a.setFullYear(t), this.week = null, this.today = null), typeof e < "u" && a.getMonth() !== e && (a.setMonth(e), this.week = null, this.today = null), this.month = a.getMonth(), this.year = a.getFullYear(), this.lastDate = new Date(this.year, this.month + 1, 0), this.dayzero = a.getDate(a.setDate(0)), a.setDate(this.dayzero + 1), this.date = a, this.monthPrev = this.getPrevMonth(a), this.dayList = this.populate();
  }
  getDaylist() {
    return this.dayList;
  }
  //previous month last monday date
  getPrevMonth(e) {
    let t = 0, a = new Date(e);
    return a.setDate(1), t = (a.getDay() + 5) % 7 * -1, a.setDate(t), a;
  }
  populate() {
    const e = [];
    let t = this.monthPrev.getDate(), a = (this.date.getDay() + 6) % 7, i = (7 - this.lastDate.getDay()) % 7, n = this.lastDate.getDate();
    for (let s = 0; s < a + n + i; s++)
      s < a ? e.push(
        {
          id: s,
          d: t + s,
          t: 0
        }
      ) : s < a + n ? e.push({ id: s, d: s - a + 1, t: this.today === s - a + 1 ? "today" : 1 }) : e.push({ id: s, d: s - a - n + 1, t: 0 });
    return e;
  }
  getThisDay() {
    return this.date.toLocaleString("tr-TR", { year: "numeric", month: "long" });
  }
  show() {
    console.log("week: " + this.week), console.log("today: " + this.today), console.log("month: " + this.month), console.log("year: " + this.year), console.log("date: " + this.date.toDateString()), console.log("prevMonthDate: " + this.monthPrev.toDateString());
  }
  test() {
    console.log("date: " + this.date.toDateString()), console.log("prevMonthDate: " + this.monthPrev.toDateString()), console.log(this.dayList);
  }
}
class D {
  constructor(e) {
    if (e?.locale)
      switch (e.locale) {
        case "tr":
          this.weekNames = e.localeWeek.tr;
          break;
        case "en":
          this.weekNames = e.localeWeek.en;
          break;
      }
    else
      this.weekNames = [
        ["Mon", "Tu", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      ];
    this.calendar = document.getElementById(e.divId), this.width = e?.width, this.height = e?.height, this.font = e?.font, this.fSize = e?.fSize, this.colors = e?.colors, this.multipleSelect = !1, this.display = 0, this.firstday = -1, this.calendar.innerHTML = "", document.getElementById("container").offsetWidth <= 600 ? this.weeks = this.weekNames[0] : this.weeks = this.weekNames[1];
  }
  header(e = (/* @__PURE__ */ new Date()).toLocaleString("tr-TR", { year: "numeric", month: "long" })) {
    const t = document.createElement("div");
    t.classList.add("calTop");
    var a = document.createElement("div");
    a.innerHTML = e, a.style = "float: left; width:80%", a.id = "mc-title", a.classList.add("calTitle"), a.setAttribute("mc-utc-date", new Date(e).toUTCString()), t.appendChild(this.btnL), t.appendChild(a), t.appendChild(this.btnR), this.calendar.appendChild(t), this.weekdays(), this.body(), this.footer();
  }
  weekdays() {
    this.weeks.map((e, t) => {
      const a = document.createElement("div");
      a.classList.add("calWeek"), a.innerText = e, this.calendar.appendChild(a);
    });
  }
  body() {
    const e = document.createElement("div");
    e.classList.add("calBody"), this.calendar.appendChild(e);
  }
  footer() {
    const e = document.createElement("div");
    e.classList.add("calFoot"), this.calendar.appendChild(e);
  }
  days(e) {
    let t = performance.timeOrigin + performance.now();
    if (document.querySelector(".calBody").innerHTML = "", this.daylist = e, this.display !== 0) {
      this.display--, this.changeDisplay();
      return;
    }
    let a = [];
    e.map((n, s) => {
      s < 8 && n.d === 1 && (this.firstday = s), a = [], s >= this.firstday && n.t !== 0 && (a = this.events?.filter((c) => c.day === n.d));
      const l = document.createElement("div");
      l.classList.add("eventDot");
      const r = document.createElement("div");
      r.classList.add("day");
      const d = document.createElement("p");
      d.innerText = n.d, n.t != 0 && r.addEventListener("click", (c) => {
        this.calDayClicked(c, this.multipleSelect);
      }), r.appendChild(d), n.t === "today" ? r.classList.add("_today") : n.t === 1 && r.classList.add("_day"), r.id = "calDay" + s, l.style.visibility = "hidden", a?.length && (l.style.visibility = "visible", a.map((c) => {
        l.style.visibility == "visible" && r.appendChild(l.cloneNode());
        const y = document.createElement("div");
        y.classList.add("event"), y.innerText = c.name.slice(0, 10), r.appendChild(y);
      })), document.querySelector(".calBody").appendChild(r);
    });
    let i = performance.timeOrigin + performance.now() - t;
    console.log("Time for PopulateDays : " + i + " milliseconds");
  }
  daysWeekly() {
    document.querySelector(".calBody").innerHTML = "", console.log(this.display);
    let e = [];
    for (let t = 0; t < 14; t++) {
      let a = this.daylist[t];
      t < 8 && a.d === 1 && (this.firstday = t), e = [], t >= this.firstday && a.today !== void 0 && (e = this.events?.filter((n) => n.day === a.d));
      const i = document.createElement("div");
      i.classList.add("week"), i.innerText = a.d, a.today === 1 ? i.classList.add("_today") : a.today !== void 0 && i.classList.add("_day"), i.id = "calDay" + t, e?.length && e.map((n) => {
        const s = document.createElement("div");
        s.classList.add("event"), s.innerText = n.name.slice(0, 8), i.appendChild(s);
      }), document.querySelector(".calBody").appendChild(i);
    }
  }
  daysDaily() {
    console.log(this.display);
  }
  setEvents(e) {
    this.events = e;
  }
  addButtons() {
    var e = document.createElement("button");
    e.classList.add("btn", "btn-primary"), e.id = "btn-prev", e.type = "button", e.innerHTML = "<";
    var t = document.createElement("button");
    return t.classList.add("btn", "btn-primary"), t.id = "btn-next", t.type = "button", t.innerHTML = ">", this.btnL = e, this.btnR = t, { btnL: e, btnR: t };
  }
  update(e) {
    let t = document.querySelector(".calTitle");
    t.innerHTML = e;
  }
  windowEvents(e) {
    const t = this.weekNames[0], a = this.weekNames[1], i = document.getElementById("container");
    document.getElementById("modularCalendar");
    function n(s) {
      i.offsetWidth <= 600 ? e.map((l, r) => {
        l.innerHTML = t[r];
      }) : e.map((l, r) => {
        l.innerHTML = a[r];
      });
    }
    window.addEventListener("resize", n);
  }
  calDayClicked(e, t) {
    let a = document.querySelectorAll(".cal-selected");
    e.currentTarget.classList.length > 1 && (t !== !0 && a[0]?.classList.remove("cal-selected"), e.currentTarget.classList.add("cal-selected")), sessionStorage.setItem("cal-selected", e.currentTarget.innerText);
  }
  changeDisplay() {
    switch (this.display = (this.display + 1) % 3, this.display) {
      case 0:
        this.days(this.daylist);
        break;
      case 1:
        this.daysWeekly(this.daylist);
        break;
      case 2:
        this.daysDaily(this.daylist);
        break;
    }
  }
  show() {
  }
}
const w = {
  month: {
    tempDesign: 1,
    // startMonth: 7,
    // startYear:2023,
    divId: "modularCalendar",
    width: "800px",
    locale: "en",
    localeWeek: {
      tr: [
        ["Pt", "Sa", "Ça", "Pe", "Cu", "Ct", "Pz"],
        ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"]
      ],
      en: [
        ["Mon", "Tu", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      ]
    }
  },
  events: [
    {
      name: "some Org1.",
      paramStart: [2023, 7, 1, 11, 30, 0],
      paramEnd: [2023, 7, 1, 13, 30, 0]
    },
    {
      name: "some Org2.",
      paramStart: [2023, 7, 10, 11, 30, 0],
      paramEnd: [2023, 7, 10, 13, 30, 0]
    },
    {
      name: "some Org3.",
      paramStart: [2023, 7, 20, 11, 30, 0],
      paramEnd: [2023, 7, 20, 13, 30, 0]
    },
    {
      name: "some Org4.",
      paramStart: [2023, 7, 30, 11, 30, 0],
      paramEnd: [2023, 7, 30, 13, 30, 0]
    }
  ]
}, u = [];
var f, h = w;
T();
function T(o = null, e = null) {
  let t = "/calendarconf";
  e && o && (t += "/" + o + "/" + e), fetch(t).then(function(a) {
    if (a.ok)
      return f = a.clone(), a.json();
  }).then(function(a) {
    h = a;
  }, function(a) {
    console.log("Error parsing JSON from response:", a, f), f.text();
  }).then(function(a) {
    k();
    const i = document.querySelectorAll("div.calWeek");
    u.length = 0, Array.from(i).map((n) => {
      u.push(n);
    });
  });
}
function k() {
  const o = h.month.tempDesign;
  o && p(/* @__PURE__ */ Object.assign({ "./template1.css": () => import("./template1-a8db76f7.js") }), `./template${o}.css`);
  let e = h.month.startMonth || (/* @__PURE__ */ new Date()).getUTCMonth(), t = h.month.startYear || (/* @__PURE__ */ new Date()).getUTCFullYear(), a = performance.timeOrigin + performance.now();
  var i = new v(t);
  h.events.forEach((d) => {
    i.addEvent(new g(d.name, d.paramStart, d.paramEnd));
  });
  let n = new m(e, t);
  const s = new D(h.month);
  if (s.calendar) {
    s.setEvents(i.getEventsForMonth(e, t));
    const { btnL: d, btnR: c } = s.addButtons();
    s.header(n.getThisDay()), s.days(n.getDaylist()), s.windowEvents(u);
    var l = () => {
      e === 0 ? (t--, e = 11) : e--, n = new m(e, t), s.setEvents(i.getEventsForMonth(e, t)), s.days(n.getDaylist()), s.update(n.getThisDay());
    }, r = () => {
      e === 11 ? (t++, e = 0) : e++, n = new m(e, t), s.setEvents(i.getEventsForMonth(e, t)), s.days(n.getDaylist()), s.update(n.getThisDay());
    };
    d.onclick = l, c.onclick = r;
    let y = performance.timeOrigin + performance.now() - a;
    console.log("Time for Month class : " + y + " milliseconds");
  }
  document.addEventListener("DOMContentLoaded", function() {
    const d = document.querySelectorAll("div.calWeek");
    Array.from(d).map((c) => {
      u.push(c);
    });
  });
}
export {
  k as buildCalendar,
  T as redraw
};
