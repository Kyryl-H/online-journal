"use strict";

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");
const Student = require("../models/student");
const Subject = require("../models/subject");
const Schedule = require("../models/schedule");
const Grades = require("../models/grades");

// Налаштування
const FONT_REGULAR = path.join(__dirname, "../fonts/Roboto-Regular.ttf");
const FONT_BOLD = path.join(__dirname, "../fonts/Roboto-Bold.ttf");

// Значення оцінки, що означає пропуск, і скільки годин дає один пропуск
const ABSENCE_VALUES = ["н", "Н"];
const HOURS_PER_ABSENCE = 2;

// Місяці семестрів, як у відомостях пропусків
const SEMESTER_MONTHS = { 1: [9, 10, 11, 12], 2: [1, 2, 3, 4, 5] };

const MONTH_NAMES = [
  "Січень",
  "Лютий",
  "Березень",
  "Квітень",
  "Травень",
  "Червень",
  "Липень",
  "Серпень",
  "Вересень",
  "Жовтень",
  "Листопад",
  "Грудень",
];

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

// Години пропуску з поважної причини. Відмітки поки немає, тому завжди 0
const excusedHoursOf = () => 0;

// «Пашкевич Олена Миколаївна» → «Пашкевич О.М.»
const toInitials = (fullName = "") => {
  const [last, first, middle] = fullName.trim().split(/\s+/);
  if (!last) return "";
  const initials = [first, middle]
    .filter(Boolean)
    .map((name) => `${name[0].toUpperCase()}.`)
    .join("");
  return initials ? `${last} ${initials}` : last;
};

// Дані
const addHours = (map, key, total, excused) => {
  const current = map.get(key) ?? { total: 0, excused: 0 };
  current.total += total;
  current.excused += excused;
  map.set(key, current);
};

const withUnexcused = (hours = { total: 0, excused: 0 }) => ({
  total: hours.total,
  excused: hours.excused,
  unexcused: hours.total - hours.excused,
});

const sumHours = (items) =>
  withUnexcused(
    [...items].reduce(
      (acc, item) => ({
        total: acc.total + item.total,
        excused: acc.excused + item.excused,
      }),
      { total: 0, excused: 0 },
    ),
  );

// Пропуски студентів групи за період: по днях і по місяцях
const collectAbsences = async (group, from, to) => {
  const [subjects, students] = await Promise.all([
    Subject.findAll({
      where: { groupId: group.id },
      attributes: ["id"],
      raw: true,
    }),
    Student.findAll({
      where: { groupId: group.id },
      attributes: ["id", "fullName"],
      order: [["fullName", "ASC"]],
      raw: true,
    }),
  ]);

  if (!students.length) throw httpError(404, "У групі немає студентів");

  const lessons = subjects.length
    ? await Schedule.findAll({
        where: {
          subjectId: { [Op.in]: subjects.map((s) => Number(s.id)) },
          date: { [Op.between]: [from, to] },
        },
        attributes: ["id", "date"],
        raw: true,
      })
    : [];

  const dateByLesson = new Map(
    lessons.map((l) => [Number(l.id), new Date(l.date)]),
  );

  const absences = lessons.length
    ? await Grades.findAll({
        where: {
          scheduleId: { [Op.in]: [...dateByLesson.keys()] },
          studentId: { [Op.in]: students.map((s) => Number(s.id)) },
          value: { [Op.in]: ABSENCE_VALUES },
        },
        attributes: ["studentId", "scheduleId", "value"],
        raw: true,
      })
    : [];

  const stats = new Map(
    students.map((s) => [Number(s.id), { days: new Map(), months: new Map() }]),
  );

  absences.forEach((absence) => {
    const date = dateByLesson.get(Number(absence.scheduleId));
    const entry = stats.get(Number(absence.studentId));
    if (!date || !entry) return;

    const excused = Math.min(excusedHoursOf(absence), HOURS_PER_ABSENCE);
    addHours(entry.days, date.getDate(), HOURS_PER_ABSENCE, excused);
    addHours(entry.months, date.getMonth() + 1, HOURS_PER_ABSENCE, excused);
  });

  return { students, stats };
};

const buildMonthReport = async ({ group, teacher, month, year }) => {
  const from = new Date(year, month - 1, 1);
  const to = new Date(year, month, 0, 23, 59, 59);
  const { students, stats } = await collectAbsences(group, from, to);

  const daysCount = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysCount }, (_, i) => {
    const weekday = new Date(year, month - 1, i + 1).getDay();
    return { day: i + 1, weekend: weekday === 0 || weekday === 6 };
  });

  const rows = students.map((student) => {
    const entry = stats.get(Number(student.id));
    return {
      fullName: student.fullName,
      byDay: entry.days,
      ...sumHours(entry.days.values()),
    };
  });

  const monthName = MONTH_NAMES[month - 1];

  return {
    mode: "month",
    title: "ЗВЕДЕНА ВІДОМІСТЬ ПРОПУСКІВ ЗАНЯТЬ",
    groupName: group.name,
    monthName,
    year,
    days,
    rows,
    totals: sumHours(rows),
    curator: toInitials(teacher.fullName ?? ""),
    filename: `Пропуски_${group.name}_${monthName}_${year}.pdf`.replace(
      /\s+/g,
      "_",
    ),
  };
};

const buildSemesterReport = async ({ group, teacher, semester, startYear }) => {
  const months = SEMESTER_MONTHS[semester];
  const yearOf = (m) => (m >= 9 ? startYear : startYear + 1);
  const first = months[0];
  const last = months[months.length - 1];

  const from = new Date(yearOf(first), first - 1, 1);
  const to = new Date(yearOf(last), last, 0, 23, 59, 59);
  const { students, stats } = await collectAbsences(group, from, to);

  const rows = students.map((student) => {
    const entry = stats.get(Number(student.id));
    return {
      fullName: student.fullName,
      months: months.map((m) => withUnexcused(entry.months.get(m))),
      semester: sumHours(entry.months.values()),
    };
  });

  const roman = semester === 1 ? "І" : "ІІ";
  const yearLabel = `${startYear}/${startYear + 1}`;

  return {
    mode: "semester",
    title: `Зведена відомість по пропускам Група ${group.name} ${roman} семестр ${yearLabel}`,
    monthNames: months.map((m) => MONTH_NAMES[m - 1]),
    rows,
    curator: toInitials(teacher.fullName ?? ""),
    filename:
      `Пропуски_${group.name}_${semester}-семестр_${String(startYear).slice(2)}-${String(startYear + 1).slice(2)}.pdf`.replace(
        /\s+/g,
        "_",
      ),
  };
};

const buildPassesReport = ({
  group,
  teacher,
  period,
  month,
  semester,
  year,
}) =>
  period === "month"
    ? buildMonthReport({ group, teacher, month, year })
    : buildSemesterReport({ group, teacher, semester, startYear: year });

// PDF: спільні елементи
const HEAD_FILL = "#eef1f1";
const WEEKEND_FILL = "#cfe2f3";

const pageBox = (doc) => ({
  left: doc.page.margins.left,
  top: doc.page.margins.top,
  availW: doc.page.width - doc.page.margins.left - doc.page.margins.right,
  bottom: () => doc.page.height - doc.page.margins.bottom,
});

const drawCell = (doc, x, y, w, h, text, o = {}) => {
  const {
    align = "center",
    bold = false,
    size = 8,
    fill = null,
    pad = 3,
    border = true,
  } = o;

  if (fill) doc.rect(x, y, w, h).fillAndStroke(fill, "#000");
  else if (border) doc.rect(x, y, w, h).stroke();

  if (text === "" || text === null || text === undefined) return;

  const value = String(text);
  doc
    .fillColor("#000")
    .font(bold ? "Bold" : "Regular")
    .fontSize(size);
  const textW = Math.max(w - pad * 2, 1);
  const textH = doc.heightOfString(value, { width: textW, align });
  doc.text(value, x + pad, y + Math.max((h - textH) / 2, 0), {
    width: textW,
    height: h,
    align,
    ellipsis: true,
  });
};

// Рядок «групи ____ відділення ____ за місяць ____ ____» зі значеннями над лініями
const drawFields = (doc, fields, y, left, availW) => {
  const gap = 6;
  const between = 18;

  doc.font("Regular").fontSize(10);
  const widths = fields.map(
    (f) => (f.label ? doc.widthOfString(f.label) + gap : 0) + f.lineW,
  );
  const total =
    widths.reduce((sum, w) => sum + w, 0) + between * (fields.length - 1);

  let x = left + (availW - total) / 2;
  fields.forEach((field) => {
    if (field.label) {
      doc
        .fillColor("#000")
        .font("Regular")
        .fontSize(10)
        .text(field.label, x, y, { lineBreak: false });
      x += doc.widthOfString(field.label) + gap;
    }
    doc
      .moveTo(x, y + 12)
      .lineTo(x + field.lineW, y + 12)
      .stroke();
    if (field.value) {
      doc.font("Bold").fontSize(10).text(field.value, x, y, {
        width: field.lineW,
        align: "center",
        lineBreak: false,
      });
    }
    x += field.lineW + between;
  });

  return y + 20;
};

// «Класний керівник ____ / Пашкевич О.М.   Староста ____ / ____»
const drawSignatures = (doc, y, startX, curator) => {
  let x = startX;
  doc.fillColor("#000").font("Regular").fontSize(9);

  const text = (value) => {
    doc.text(value, x, y, { lineBreak: false });
    x += doc.widthOfString(value) + 4;
  };
  const line = (w, value = "") => {
    doc
      .moveTo(x, y + 10)
      .lineTo(x + w, y + 10)
      .stroke();
    if (value)
      doc.text(value, x, y, { width: w, align: "center", lineBreak: false });
    x += w + 4;
  };

  text("Класний керівник");
  line(90);
  text("/");
  line(100, curator);
  x += 24;
  text("Староста");
  line(90);
  text("/");
  line(100);
};

// PDF: місячна відомість
const renderMonthReport = (doc, report) => {
  const { days, rows, totals } = report;
  const { left, top, availW, bottom } = pageBox(doc);

  const NUM_W = 20;
  const NAME_W = 130;
  const TOT_W = 30;
  const HEAD_H = 28;
  const ROW_H = 14;

  const subW = Math.min(
    12,
    (availW - NUM_W - NAME_W - TOT_W * 3) / (days.length * 2),
  );
  const tableW = NUM_W + NAME_W + subW * days.length * 2 + TOT_W * 3;
  const x0 = left + (availW - tableW) / 2;
  const dayX = (i) => x0 + NUM_W + NAME_W + subW * 2 * i;
  const totX = (i) => x0 + NUM_W + NAME_W + subW * 2 * days.length + TOT_W * i;

  doc.fillColor("#000").font("Bold").fontSize(13);
  doc.text(report.title, left, top, { width: availW, align: "center" });

  let y = drawFields(
    doc,
    [
      { label: "групи", value: report.groupName, lineW: 60 },
      { label: "відділення", value: "", lineW: 170 },
      { label: "за місяць", value: report.monthName, lineW: 80 },
      { value: String(report.year), lineW: 40 },
    ],
    doc.y + 6,
    left,
    availW,
  );
  y += 4;

  const drawHeader = (headY) => {
    drawCell(doc, x0, headY, NUM_W, HEAD_H, "№ з/п", {
      bold: true,
      size: 6,
      fill: HEAD_FILL,
      pad: 1,
    });
    drawCell(
      doc,
      x0 + NUM_W,
      headY,
      NAME_W,
      HEAD_H,
      "Прізвище, ініціали студентів",
      {
        bold: true,
        size: 8,
        fill: HEAD_FILL,
      },
    );
    days.forEach((d, i) =>
      drawCell(doc, dayX(i), headY, subW * 2, HEAD_H, d.day, {
        bold: true,
        size: 7,
        pad: 0.5,
        fill: d.weekend ? WEEKEND_FILL : HEAD_FILL,
      }),
    );
    ["Заг. к-ть", "Не оправд.", "Оправд."].forEach((label, i) =>
      drawCell(doc, totX(i), headY, TOT_W, HEAD_H, label, {
        bold: true,
        size: 6,
        fill: HEAD_FILL,
        pad: 1,
      }),
    );
    return headY + HEAD_H;
  };

  y = drawHeader(y);

  const need = (h) => {
    if (y + h <= bottom()) return;
    doc.addPage();
    y = drawHeader(top);
  };

  rows.forEach((row, index) => {
    need(ROW_H);
    drawCell(doc, x0, y, NUM_W, ROW_H, index + 1, { size: 7, pad: 1 });
    drawCell(doc, x0 + NUM_W, y, NAME_W, ROW_H, row.fullName, {
      align: "left",
      size: 8,
    });

    days.forEach((d, i) => {
      const hours = row.byDay.get(d.day);
      const fill = d.weekend ? WEEKEND_FILL : null;
      const style = { size: 6, pad: 0.5, fill };
      drawCell(doc, dayX(i), y, subW, ROW_H, hours?.total || "", style);
      drawCell(
        doc,
        dayX(i) + subW,
        y,
        subW,
        ROW_H,
        hours?.excused || "",
        style,
      );
    });

    [row.total, row.unexcused, row.excused].forEach((value, i) =>
      drawCell(doc, totX(i), y, TOT_W, ROW_H, value, { bold: true, size: 7 }),
    );
    y += ROW_H;
  });

  need(ROW_H);
  drawCell(doc, x0, y, tableW - TOT_W * 3, ROW_H, "ВСЬОГО:", {
    align: "right",
    bold: true,
    size: 8,
    border: false,
  });
  [totals.total, totals.unexcused, totals.excused].forEach((value, i) =>
    drawCell(doc, totX(i), y, TOT_W, ROW_H, value, { bold: true, size: 7 }),
  );
  y += ROW_H;

  if (y + 60 > bottom()) {
    doc.addPage();
    y = top;
  }
  drawSignatures(doc, y + 30, x0 + 30, report.curator);
};

//    PDF: семестрова відомість

const renderSemesterReport = (doc, report) => {
  const { monthNames, rows } = report;
  const { left, top, availW, bottom } = pageBox(doc);

  const NUM_W = 22;
  const NAME_W = 150;
  const HEAD1_H = 16;
  const HEAD2_H = 26;
  const ROW_H = 14;

  const groups = [...monthNames, "Семестр"];
  const colW = Math.min(40, (availW - NUM_W - NAME_W) / (groups.length * 3));
  const tableW = NUM_W + NAME_W + colW * groups.length * 3;
  const x0 = left + (availW - tableW) / 2;
  const colX = (g, i) => x0 + NUM_W + NAME_W + colW * (g * 3 + i);

  doc.fillColor("#000").font("Bold").fontSize(13);
  doc.text(report.title, left, top, { width: availW, align: "center" });
  let y = doc.y + 8;

  const drawHeader = (headY) => {
    drawCell(doc, x0, headY, NUM_W, HEAD1_H + HEAD2_H, "№ з/п", {
      bold: true,
      size: 7,
      fill: HEAD_FILL,
      pad: 1,
    });
    drawCell(
      doc,
      x0 + NUM_W,
      headY,
      NAME_W,
      HEAD1_H + HEAD2_H,
      "Прізвище, ініціали студентів",
      {
        bold: true,
        size: 9,
        fill: HEAD_FILL,
      },
    );
    groups.forEach((name, g) => {
      drawCell(doc, colX(g, 0), headY, colW * 3, HEAD1_H, name, {
        bold: true,
        size: 9,
        fill: HEAD_FILL,
      });
      ["Заг. к-ть", "Не оправд.", "Оправд."].forEach((label, i) =>
        drawCell(doc, colX(g, i), headY + HEAD1_H, colW, HEAD2_H, label, {
          bold: true,
          size: 7,
          fill: HEAD_FILL,
          pad: 1,
        }),
      );
    });
    return headY + HEAD1_H + HEAD2_H;
  };

  y = drawHeader(y);

  const need = (h) => {
    if (y + h <= bottom()) return;
    doc.addPage();
    y = drawHeader(top);
  };

  rows.forEach((row, index) => {
    need(ROW_H);
    drawCell(doc, x0, y, NUM_W, ROW_H, index + 1, { size: 8, pad: 1 });
    drawCell(doc, x0 + NUM_W, y, NAME_W, ROW_H, row.fullName, {
      align: "left",
      size: 8,
    });

    [...row.months, row.semester].forEach((hours, g) => {
      [hours.total, hours.unexcused, hours.excused].forEach((value, i) =>
        drawCell(doc, colX(g, i), y, colW, ROW_H, value, {
          size: 8,
          bold: g === groups.length - 1,
        }),
      );
    });
    y += ROW_H;
  });

  if (y + 50 > bottom()) {
    doc.addPage();
    y = top;
  }
  drawSignatures(doc, y + 24, x0 + 30, report.curator);
};

//    Відповідь
const ensureFonts = () => {
  [FONT_REGULAR, FONT_BOLD].forEach((file) => {
    if (!fs.existsSync(file)) throw new Error(`Не знайдено шрифт: ${file}`);
  });
};

// Дані з БД збираються до виклику, тому помилки ще можна віддати як JSON
const streamPassesReportPdf = (res, report) => {
  ensureFonts();

  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 28,
    info: { Title: report.title, Author: "Aleph" },
  });

  doc.registerFont("Regular", FONT_REGULAR);
  doc.registerFont("Bold", FONT_BOLD);
  doc.lineWidth(0.5).strokeColor("#000");

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report.pdf"; filename*=UTF-8''${encodeURIComponent(report.filename)}`,
  );

  doc.pipe(res);
  if (report.mode === "month") renderMonthReport(doc, report);
  else renderSemesterReport(doc, report);
  doc.end();
};

module.exports = { buildPassesReport, streamPassesReportPdf };
