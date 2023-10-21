const v = (l, t) => {
  const e = l[t];
  return e ? typeof e == "function" ? e() : Promise.resolve(e) : new Promise((a, s) => {
    (typeof queueMicrotask == "function" ? queueMicrotask : setTimeout)(s.bind(null, new Error("Unknown variable dynamic import: " + t)));
  });
};
class f {
  constructor(t, e, a) {
    this.name = t, this.start = new Date(...e), this.startUtc = this.start.getUTCHours() + ":" + this.start.getMinutes() + " UTC", this.end = new Date(...a), this.endUtc = this.end.getUTCHours() + ":" + this.end.getMinutes() + " UTC", this.location = [], this.year = this.start.getFullYear(), this.month = this.start.getMonth(), this.day = this.start.getDate();
  }
  addPlace(t) {
    return this.location.push(t), this.location.length;
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
  subtractHours(t, e) {
    return t.setHours(t.getHours() + e), t;
  }
  utc(t) {
    let e = new Date(t), a = this.start.getTimezoneOffset() / 60;
    return this.subtractHours(e, a);
  }
}
class D {
  constructor(t, e = null) {
    this.year = t, this.yearly = [{ y: t, events: [] }], e && this.addEvent(e);
  }
  addEvent(t) {
    let e = this.findByYear(t.year);
    e > -1 ? this.yearly[e].events.push(t) : (this.yearly.push({ y: t.year, events: [t] }), this.sortByYear());
  }
  deleteEvent() {
  }
  findByYear(t) {
    return this.yearly.findIndex((a) => a.y === t);
  }
  sortByYear() {
    this.yearly.sort(function(t, e) {
      return t.y - e.y;
    });
  }
  getEventsForYear(t) {
    let e = this.findByYear(t);
    return this.yearly[e];
  }
  //TODO:
  //if Performance Issues sorting all events in a year make events to pointer leave events array seperate with id pointing to yearly.pointer
  //{y:2020,pointer:5},{y:2021,pointer:0},{y:2022,pointer:3},{y:2023,pointer:1},...   {id:0 events:[2021]},{id:1 events:[2023]},{id:3 events:[2022]},...
  sortByMonth() {
    this.yearly.map((t) => {
      t.events.sort(function(e, a) {
        return e.month - a.month;
      });
    });
  }
  getEventsForMonth(t, e) {
    return this.getEventsForYear(e)?.events.filter((s) => s.month === t);
  }
  findByDate() {
  }
  sortByDate() {
  }
  show() {
    console.log("eby->year:" + this.year), console.log("eby->yearly:" + JSON.stringify(this.yearly));
  }
  test() {
    function t(e, a) {
      return Math.floor(Math.random() * (a - e) + e);
    }
    for (let e = 0; e < 500; e++) {
      let a = t(2022, 2025), s = t(1, 30), i = t(0, 12);
      this.addEvent(new f(
        "rand" + e,
        [a, i, s, t(0, 24), 0, 0],
        [a, i, s, t(0, 24), t(0, 270), 0]
      ));
    }
    this.sortByMonth();
  }
  //
}
class m {
  constructor(t, e) {
    const a = /* @__PURE__ */ new Date();
    this.week = a.getDay(), this.today = a.getDate(), typeof e < "u" && a.getFullYear() !== e && (a.setFullYear(e), this.week = null, this.today = null), typeof t < "u" && a.getMonth() !== t && (a.setMonth(t), this.week = null, this.today = null), this.month = a.getMonth(), this.year = a.getFullYear(), this.lastDate = new Date(this.year, this.month + 1, 0), this.dayzero = a.getDate(a.setDate(0)), a.setDate(this.dayzero + 1), this.date = a, this.monthPrev = this.getPrevMonth(a), this.dayList = this.populate();
  }
  getDaylist() {
    return this.dayList;
  }
  //previous month last monday date
  getPrevMonth(t) {
    let e = 0, a = new Date(t);
    return a.setDate(1), e = (a.getDay() + 5) % 7 * -1, a.setDate(e), a;
  }
  populate() {
    const t = [];
    let e = this.monthPrev.getDate(), a = (this.date.getDay() + 6) % 7, s = (7 - this.lastDate.getDay()) % 7, i = this.lastDate.getDate();
    for (let n = 0; n < a + i + s; n++)
      n < a ? t.push(
        {
          id: n,
          d: e + n,
          t: 0
        }
      ) : n < a + i ? t.push({ id: n, d: n - a + 1, t: this.today === n - a + 1 ? "today" : 1 }) : t.push({ id: n, d: n - a - i + 1, t: 0 });
    return t;
  }
  getThisDay() {
    return this.date;
  }
  show() {
    console.log("week: " + this.week), console.log("today: " + this.today), console.log("month: " + this.month), console.log("year: " + this.year), console.log("date: " + this.date.toDateString()), console.log("prevMonthDate: " + this.monthPrev.toDateString());
  }
  test() {
    console.log("date: " + this.date.toDateString()), console.log("prevMonthDate: " + this.monthPrev.toDateString()), console.log(this.dayList);
  }
}
class w {
  constructor(t) {
    if (t?.locale)
      switch (t.locale) {
        case "tr":
          this.weekNames = t.localeWeek.tr;
          break;
        case "en":
          this.weekNames = t.localeWeek.en;
          break;
        default:
          this.weekNames = [
            ["Mon", "Tu", "Wed", "Thu", "Fri", "Sat", "Sun"],
            ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
          ];
          break;
      }
    else
      this.weekNames = [
        ["Mon", "Tu", "Wed", "Thu", "Fri", "Sat", "Sun"],
        ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
      ];
    this.calendar = document.getElementById(t.divId), this._month = 0, this._year = 2023, this._locale = t?.locale, this.width = t?.width, this.height = t?.height, this.font = t?.font, this.fSize = t?.fSize, this.colors = t?.colors, this.multipleSelect = !1, this.display = 0, this.firstday = -1, this.calendar.innerHTML = "", document.getElementById("container"), this.weeks = ["Mon", "Tu", "Wed", "Thu", "Fri", "Sat", "Sun"];
  }
  setDate(t, e) {
    this._month = parseInt(t) + 1, this._year = e;
  }
  header(t = /* @__PURE__ */ new Date()) {
    const e = document.createElement("div");
    e.classList.add("calTop");
    var a = document.createElement("div");
    a.innerHTML = t.toLocaleString(this._locale, { year: "numeric", month: "long" }), a.style = "float: left; width:80%", a.id = "mc-title", a.classList.add("calTitle"), a.setAttribute("mc-utc-date", new Date(this._year, this._month, -1).toISOString()), e.appendChild(this.btnL), e.appendChild(a), e.appendChild(this.btnR), this.calendar.appendChild(e), this.weekdays(), this.body(), this.footer();
  }
  weekdays() {
    this.weeks.map((t, e) => {
      const a = document.createElement("div");
      a.classList.add("calWeek"), a.innerText = new Date(2022, 10, e).toLocaleString(this._locale, { weekday: "short" }), this.calendar.appendChild(a);
    });
  }
  body() {
    const t = document.createElement("div");
    t.classList.add("calBody"), this.calendar.appendChild(t);
  }
  footer() {
    const t = document.createElement("div");
    t.classList.add("calFoot"), this.calendar.appendChild(t);
  }
  days(t) {
    let e = performance.timeOrigin + performance.now();
    if (document.querySelector(".calBody").innerHTML = "", this.daylist = t, this.display !== 0) {
      this.display--, this.changeDisplay();
      return;
    }
    let a = [];
    t.map((i, n) => {
      n < 8 && i.d === 1 && (this.firstday = n), a = [], n >= this.firstday && i.t !== 0 && (a = this.events?.filter((o) => o.day === i.d));
      const r = document.createElement("div");
      r.classList.add("eventDot");
      const d = document.createElement("div");
      d.classList.add("day");
      const y = document.createElement("p");
      y.innerText = i.d, i.t != 0 && d.addEventListener("click", (o) => {
        this.calDayClicked(o, this.multipleSelect);
      }), d.appendChild(y), i.t === "today" ? d.classList.add("_today") : i.t === 1 && d.classList.add("_day"), d.id = "calDay" + n, r.style.visibility = "hidden", a?.length && (r.style.visibility = "visible", a.map((o) => {
        r.style.visibility == "visible" && d.appendChild(r.cloneNode());
        const h = document.createElement("div");
        h.classList.add("event"), h.innerText = o.name.slice(0, 10), d.appendChild(h);
      })), document.querySelector(".calBody").appendChild(d);
    });
    let s = performance.timeOrigin + performance.now() - e;
    console.log("Time for PopulateDays : " + s + " milliseconds");
  }
  daysWeekly() {
    document.querySelector(".calBody").innerHTML = "", console.log(this.display);
    let t = [];
    for (let e = 0; e < 14; e++) {
      let a = this.daylist[e];
      e < 8 && a.d === 1 && (this.firstday = e), t = [], e >= this.firstday && a.today !== void 0 && (t = this.events?.filter((i) => i.day === a.d));
      const s = document.createElement("div");
      s.classList.add("week"), s.innerText = a.d, a.today === 1 ? s.classList.add("_today") : a.today !== void 0 && s.classList.add("_day"), s.id = "calDay" + e, t?.length && t.map((i) => {
        const n = document.createElement("div");
        n.classList.add("event"), n.innerText = i.name.slice(0, 8), s.appendChild(n);
      }), document.querySelector(".calBody").appendChild(s);
    }
  }
  daysDaily() {
    console.log(this.display);
  }
  setEvents(t) {
    this.events = t;
  }
  addButtons() {
    var t = document.createElement("button");
    t.classList.add("btn", "btn-primary"), t.id = "btn-prev", t.type = "button", t.innerHTML = "<";
    var e = document.createElement("button");
    return e.classList.add("btn", "btn-primary"), e.id = "btn-next", e.type = "button", e.innerHTML = ">", this.btnL = t, this.btnR = e, { btnL: t, btnR: e };
  }
  update(t, e) {
    let a = document.querySelector(".calTitle");
    a.innerHTML = t.toLocaleString(e, { year: "numeric", month: "long" }), a.setAttribute("mc-utc-date", new Date(this._year, this._month, -1).toISOString());
  }
  windowEvents(t, e) {
    const a = document.getElementById("container");
    document.getElementById("modularCalendar");
    function s(i) {
      a.offsetWidth <= 600 ? t.map((n, r) => {
        n.innerHTML = new Date(2022, 10, r).toLocaleString(e, { weekday: "short" });
      }) : (console.log(e), t.map((n, r) => {
        n.innerHTML = new Date(2022, 10, r).toLocaleString(e, { weekday: "long" });
      }));
    }
    window.addEventListener("resize", s);
  }
  calDayClicked(t, e) {
    let a = document.querySelectorAll(".cal-selected");
    t.currentTarget.classList.length > 1 && (e !== !0 && a[0]?.classList.remove("cal-selected"), t.currentTarget.classList.add("cal-selected")), sessionStorage.setItem("cal-selected", t.currentTarget.innerText);
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
const T = {
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
var g, c = T;
S(null, null, () => {
});
function S(l = null, t = null, e) {
  let a = "/calendarconf";
  t && l && (a += "/" + l + "/" + t), fetch(a).then(function(s) {
    if (s.ok)
      return g = s.clone(), s.json();
  }).then(function(s) {
    c = s;
  }, function(s) {
    console.log("Error parsing JSON from response:", s, g), g.text();
  }).then(function(s) {
    k(e);
    const i = document.querySelectorAll("div.calWeek");
    u.length = 0, Array.from(i).map((n) => {
      u.push(n);
    });
  }).then(e);
}
function k(l) {
  const t = c.month.tempDesign;
  t && v(/* @__PURE__ */ Object.assign({ "./template1.css": () => import("./template1-a8db76f7.js") }), `./template${t}.css`);
  let e = c.month.startMonth || (/* @__PURE__ */ new Date()).getUTCMonth(), a = c.month.startYear || (/* @__PURE__ */ new Date()).getUTCFullYear(), s = performance.timeOrigin + performance.now();
  var i = new D(a);
  c.events.forEach((o) => {
    i.addEvent(new f(o.name, o.paramStart, o.paramEnd));
  });
  let n = new m(e, a);
  const r = new w(c.month);
  if (r.setDate(e, a), r.calendar) {
    r.setEvents(i.getEventsForMonth(e, a));
    const { btnL: o, btnR: h } = r.addButtons();
    r.header(n.getThisDay()), r.days(n.getDaylist()), r.windowEvents(u, c.month.locale);
    var d = () => {
      e === 0 ? (a--, e = 11) : e--, n = new m(e, a), r.setEvents(i.getEventsForMonth(e, a)), r.setDate(e, a), r.days(n.getDaylist()), r.update(n.getThisDay(), c.month.locale), l();
    }, y = () => {
      e === 11 ? (a++, e = 0) : e++, n = new m(e, a), r.setEvents(i.getEventsForMonth(e, a)), r.setDate(e, a), r.days(n.getDaylist()), r.update(n.getThisDay(), c.month.locale), l();
    };
    o.onclick = d, h.onclick = y;
    let p = performance.timeOrigin + performance.now() - s;
    console.log("Time for Month class : " + p + " milliseconds");
  }
  document.addEventListener("DOMContentLoaded", function() {
    const o = document.querySelectorAll("div.calWeek");
    Array.from(o).map((h) => {
      u.push(h);
    });
  });
}
export {
  k as buildCalendar,
  S as redraw
};
