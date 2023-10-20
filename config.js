const ROLES = {
  Admin: "Admin",
  Customer: "Customer",
  User: "User",
  PremiumUser: "PremiumUser",
  Manager: "Manager"
}
var STATUS = {
  "en":[
  "Appointment available",
  "Booked event",
  "Current booking",
  "Current booking (edit)",
  "Cleaning and preparation",
  "maintenance",
  "company holidays",
  "Not available"
],"de":[
  "Termin verfügbar",
  "Gebuchte Veranstaltung",
  "Aktuelle Buchung",
  "Aktuelle Buchung (bearbeiten)",
  "Reinigung und Vorbereitung",
  "Instandhaltung",
  "Betriebsferien",
  "Nicht verfügbar"
]};

var locals = {
  title: 'KORNS Booking',
  description: 'Page Description',
  header: 'Page Header',
  version: '1.4.0'
};

var calendar = {
  month: {
      tempDesign: 0,
      // startMonth: 7,
      // startYear:2023,
      divId:"modularCalendar",
      width:"800px",
      locale:"tr",
      localeWeek : {
        tr:[
            ["Pt","Sa","Ça","Pe","Cu","Ct","Pz"],
            ["Pazartesi","Salı","Çarşamba","Perşembe","Cuma","Cumartesi","Pazar"]
        ],
        en:[
            ["Mon","Tu","Wed","Thu","Fri","Sat","Sun"],
            ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"]
        ]}
      
  },
  events: [
    {
      name:"some Org1.",
      paramStart:[2023, 7, 1, 11, 30, 0],
      paramEnd:[2023, 7, 1, 13, 30, 0]
    },
    {
      name:"some Org2.",
      paramStart:[2023, 7, 10, 11, 30, 0],
      paramEnd:[2023, 7, 10, 13, 30, 0]
    },
    {
      name:"some Org3.",
      paramStart:[2023, 7, 20, 11, 30, 0],
      paramEnd:[2023, 7, 20, 13, 30, 0]
    },
    {
      name:"some Org4.",
      paramStart:[2023, 7, 30, 11, 30, 0],
      paramEnd:[2023, 7, 30, 13, 30, 0]
    }]
 };

module.exports = {ROLES,calendar,...locals};