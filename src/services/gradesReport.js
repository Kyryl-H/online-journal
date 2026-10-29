"use strict";

const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const { Op } = require("sequelize");
const Student = require("../models/student");
const Subject = require("../models/subject");
const Schedule = require("../models/schedule");
const Grades = require("../models/grades");

/* ==========================================================================
   Налаштування
   ========================================================================== */
const FONT_REGULAR = path.join(__dirname, "../fonts/Roboto-Regular.ttf");
const FONT_BOLD = path.join(__dirname, "../fonts/Roboto-Bold.ttf");

// Типи занять (lessonType), на яких виставляють рубіжні та семестрові оцінки
const LESSON_TYPE_MATCHERS = {
  milestone: /test/i,
  semester: /semester/i,
};

// Типи занять, з оцінок яких рахується середнє, якщо окремих підсумкових занять немає
const AVERAGE_LESSON_TYPES = /^para$/i;

// Семестрова відомість: У*18 = середній бал × 18
const UNIT_FACTOR = 18;

// Семестрова відомість: штраф у додатковому балі за один пропуск («н»)
const ABSENCE_PENALTY = 0.2;

// Рубіжна відомість: [місяць, день] останнього дня, що враховується.
// null — береться весь семестр
const MILESTONE_END = { 1: null, 2: null };

// Межі семестрів навчального року, що починається у вересні startYear
const getSemesterRange = (startYear, semester) =>
  semester === 1
    ? {
        from: new Date(startYear, 8, 1), // 1 вересня
        to: new Date(startYear + 1, 0, 31, 23, 59, 59), // 31 січня
      }
    : {
        from: new Date(startYear + 1, 1, 1), // 1 лютого
        to: new Date(startYear + 1, 6, 31, 23, 59, 59), // 31 липня
      };

const getAcademicStartYear = (now = new Date()) =>
  now.getMonth() >= 8 ? now.getFullYear() : now.getFullYear() - 1;

const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

/* ==========================================================================
   Оцінки
   ========================================================================== */
const parseValue = (raw) => {
  const v = String(raw ?? "")
    .trim()
    .toLowerCase()
    .replace(/a/g, "а"); // у базі трапляється «н/a» з латинською «a»

  if (!v) return { type: "empty", label: "" };
  if (v === "зар") return { type: "credit", label: "зар" };
  if (v === "н/а") return { type: "na", label: "н/а" };
  if (v === "н") return { type: "absent", label: "н" };

  const num = Number(v.replace(",", "."));
  if (Number.isFinite(num) && num > 0) {
    return { type: "num", num, label: String(num) };
  }
  return { type: "other", label: v };
};

// Група оцінки: 0 — «2» / 1–3, 1 — «3» / 4–6, 2 — «4» / 7–9, 3 — «5» / 10–12
const bucketOf = (num, system) => {
  if (system === 12) return num >= 10 ? 3 : num >= 7 ? 2 : num >= 4 ? 1 : 0;
  return num >= 5 ? 3 : num >= 4 ? 2 : num >= 3 ? 1 : 0;
};
const to5 = (num) => (num >= 10 ? 5 : num >= 7 ? 4 : num >= 4 ? 3 : 2);

const getScaleLabels = (systems) => {
  if (systems.size === 1 && systems.has(12)) {
    return ['"1","2","3"', '"4","5","6"', '"7","8","9"', '"10","11","12"'];
  }
  if (systems.size === 1) return ['"2"', '"3"', '"4"', '"5"'];
  return ["2 / 1–3", "3 / 4–6", "4 / 7–9", "5 / 10–12"];
};

const mean = (values) =>
  values.length ? values.reduce((s, v) => s + v, 0) / values.length : null;

// «Пашкевич Олена Петрівна»  «Олена ПАШКЕВИЧ»
const toSignature = (fullName = "") => {
  const [last, first] = fullName.trim().split(/\s+/);
  return first ? `${first} ${last.toUpperCase()}` : (last ?? "");
};

/* ==========================================================================
   Дані звіту
   ========================================================================== */
const buildGradesReport = async ({
  group,
  teacher,
  kind,
  semester,
  startYear,
}) => {
  const [subjects, students] = await Promise.all([
    Subject.findAll({
      where: { groupId: group.id },
      attributes: ["id", "name", "gradingSystem"],
      order: [["id", "ASC"]],
    }),
    Student.findAll({
      where: { groupId: group.id },
      attributes: ["id", "fullName"],
      order: [["fullName", "ASC"]],
    }),
  ]);

  if (!subjects.length) throw httpError(404, "У групі немає предметів");
  if (!students.length) throw httpError(404, "У групі немає студентів");

  const range = getSemesterRange(startYear, semester);
  const from = range.from;
  let to = range.to;

  const milestoneEnd = kind === "milestone" ? MILESTONE_END[semester] : null;
  if (milestoneEnd) {
    const [month, day] = milestoneEnd;
    const year = month >= 9 ? startYear : startYear + 1;
    to = new Date(year, month - 1, day, 23, 59, 59);
  }

  const subjectIds = subjects.map((s) => Number(s.id));
  const studentIds = students.map((s) => Number(s.id));

  const lessons = await Schedule.findAll({
    where: {
      subjectId: { [Op.in]: subjectIds },
      date: { [Op.between]: [from, to] },
    },
    attributes: ["id", "date", "lessonType", "subjectId"],
    order: [["date", "DESC"]],
    raw: true,
  });

  // Окремі підсумкові заняття беру, якщо вони є, інакше рахую середнє по звичайних парах
  const matcher = LESSON_TYPE_MATCHERS[kind];
  const typeOf = (l) => String(l.lessonType ?? "").trim();

  const dedicatedLessons = lessons.filter((l) => matcher.test(typeOf(l)));
  const averageLessons = lessons.filter((l) =>
    AVERAGE_LESSON_TYPES.test(typeOf(l)),
  );

  // Предмети з власним підсумковим заняттям беруть оцінку з нього, решта рахується як середнє
  const dedicatedSubjects = new Set(
    dedicatedLessons.map((l) => Number(l.subjectId)),
  );
  const sourceLessons = [
    ...dedicatedLessons,
    ...averageLessons.filter(
      (l) => !dedicatedSubjects.has(Number(l.subjectId)),
    ),
  ];
  const grades = sourceLessons.length
    ? await Grades.findAll({
        where: {
          scheduleId: { [Op.in]: sourceLessons.map((l) => Number(l.id)) },
          studentId: { [Op.in]: studentIds },
        },
        attributes: ["studentId", "scheduleId", "value"],
        raw: true,
      })
    : [];

  // Пропуски за період, потрібні для додаткового балу семестрової відомості
  const absences = new Map();
  if (kind === "semester" && lessons.length) {
    const absenceRows = await Grades.findAll({
      where: {
        scheduleId: { [Op.in]: lessons.map((l) => Number(l.id)) },
        studentId: { [Op.in]: studentIds },
        value: { [Op.in]: ["н", "Н"] },
      },
      attributes: ["studentId"],
      raw: true,
    });
    absenceRows.forEach((r) => {
      const id = Number(r.studentId);
      absences.set(id, (absences.get(id) ?? 0) + 1);
    });
  }

  const subjectByLesson = new Map(
    sourceLessons.map((l) => [Number(l.id), Number(l.subjectId)]),
  );
  // Чим менший номер, тим новіше заняття
  const lessonOrder = new Map(sourceLessons.map((l, i) => [Number(l.id), i]));

  // Оцінки студента з предмета: "studentId:subjectId"  [{ value, order }]
  const valuesByCell = new Map();
  grades.forEach((g) => {
    const subjectId = subjectByLesson.get(Number(g.scheduleId));
    if (subjectId === undefined) return;
    const key = `${Number(g.studentId)}:${subjectId}`;
    if (!valuesByCell.has(key)) valuesByCell.set(key, []);
    valuesByCell
      .get(key)
      .push({ value: g.value, order: lessonOrder.get(Number(g.scheduleId)) });
  });

  const findValue = (studentId, subjectId) => {
    const items =
      valuesByCell.get(`${Number(studentId)}:${Number(subjectId)}`) ?? [];
    if (!items.length) return "";

    // Підсумкова оцінка предмета - остання непорожня
    if (dedicatedSubjects.has(Number(subjectId))) {
      const last = items
        .filter((it) => String(it.value ?? "").trim() !== "")
        .sort((a, b) => a.order - b.order)[0];
      return last ? last.value : "";
    }

    // Середнє числових оцінок, «н», «н/а» і «зар» не враховуються
    const nums = items
      .map((it) => parseValue(it.value))
      .filter((p) => p.type === "num")
      .map((p) => p.num);

    return nums.length ? String(Math.round(mean(nums))) : "";
  };
  const systems = new Set(subjects.map((s) => s.gradingSystem));
  const mixed = systems.size > 1;

  // Рядки студентів із середнім балом
  const rows = students.map((student) => {
    const cells = subjects.map((subject) =>
      parseValue(findValue(student.id, subject.id)),
    );
    const nums = [];
    cells.forEach((cell, i) => {
      if (cell.type !== "num") return;
      const system = subjects[i].gradingSystem;
      nums.push(mixed && system === 12 ? to5(cell.num) : cell.num);
    });
    const average = mean(nums);

    // У*18, додатковий та рейтинговий бал є тільки в семестровій відомості
    let extra = null;
    if (kind === "semester" && average !== null) {
      const scaled = average * UNIT_FACTOR;
      const bonus = -ABSENCE_PENALTY * (absences.get(Number(student.id)) ?? 0);
      extra = { scaled, bonus, rating: scaled + bonus };
    }

    return { fullName: student.fullName, cells, average, extra };
  });

  // Підсумки по предметах, у знаменнику всі студенти групи
  const total = students.length;
  const columns = subjects.map((subject, i) => {
    const counts = [0, 0, 0, 0];
    let credits = 0;
    let graded = 0;

    rows.forEach((row) => {
      const cell = row.cells[i];
      if (cell.type === "num") {
        counts[bucketOf(cell.num, subject.gradingSystem)]++;
        graded++;
      } else if (cell.type === "credit") {
        credits++;
        graded++;
      }
    });

    return {
      counts,
      quality: graded
        ? Math.round(((counts[2] + counts[3]) / total) * 100)
        : null,
      absolute: graded
        ? Math.round(
            ((counts[1] + counts[2] + counts[3] + credits) / total) * 100,
          )
        : null,
    };
  });

  const average = mean(rows.map((r) => r.average).filter((v) => v !== null));
  const quality = mean(columns.map((c) => c.quality).filter((v) => v !== null));
  const absolute = mean(
    columns.map((c) => c.absolute).filter((v) => v !== null),
  );

  const roman = semester === 1 ? "І" : "ІІ";
  const yearLabel = `${String(startYear).slice(2)}/${String(startYear + 1).slice(2)}`;
  const title =
    kind === "milestone"
      ? `Рубіжна відомість групи ${group.name} ${roman} семестр ${yearLabel} н.р.`
      : `Зведена семестрова відомість групи ${group.name} за ${roman} семестр ${yearLabel} н.р.`;

  return {
    title,
    filename:
      `${kind === "milestone" ? "Рубіжна" : "Семестрова"}_${group.name}_${semester}-семестр_${yearLabel.replace("/", "-")}.pdf`.replace(
        /\s+/g,
        "_",
      ),
    withExtras: kind === "semester",
    subjects: subjects.map((s) => ({ name: s.name })),
    rows,
    columns,
    overall: {
      average,
      quality: quality === null ? null : Math.round(quality),
      absolute: absolute === null ? null : Math.round(absolute),
    },
    scaleLabels: getScaleLabels(systems),
    curatorSignature: toSignature(teacher.fullName ?? ""),
  };
};

/* ==========================================================================
   PDF
   ========================================================================== */
const ROW_H = 15;
const HEAD_H = 112;
const INDEX_ROW_H = 14;
const NUM_W = 24;
const AVG_W = 40;
const EXTRA_W = 34;
const EXTRA_HEADERS = ["У*18", "Додатковий бал", "Рейтинговий бал"];

// −1.4, −2, 0 — без зайвих нулів після коми
const formatBonus = (value) => String(Number(value.toFixed(1)));

const renderGradesReportPdf = (doc, report) => {
  const { title, subjects, rows, columns, overall, scaleLabels, withExtras } =
    report;
  const extraCount = withExtras ? EXTRA_HEADERS.length : 0;

  doc.registerFont("Regular", FONT_REGULAR);
  doc.registerFont("Bold", FONT_BOLD);
  doc.lineWidth(0.5).strokeColor("#000");

  const left = doc.page.margins.left;
  const right = doc.page.width - doc.page.margins.right;
  const top = doc.page.margins.top;
  const bottom = () => doc.page.height - doc.page.margins.bottom;
  const availW = right - left;

  const nameW = Math.min(170, Math.max(120, availW * 0.22));
  const subjW = Math.min(
    36,
    (availW - NUM_W - nameW - AVG_W - EXTRA_W * extraCount) /
      Math.max(subjects.length, 1),
  );
  const tableW =
    NUM_W + nameW + subjW * subjects.length + AVG_W + EXTRA_W * extraCount;
  const x0 = left + (availW - tableW) / 2;
  const subjX = (i) => x0 + NUM_W + nameW + subjW * i;
  const avgX = x0 + NUM_W + nameW + subjW * subjects.length;
  const extraX = (i) => avgX + AVG_W + EXTRA_W * i;

  /*  Базові елементи  */
  const cell = (x, y, w, h, text, o = {}) => {
    const { align = "center", bold = false, size = 8, fill = null } = o;
    if (fill) doc.rect(x, y, w, h).fillAndStroke(fill, "#000");
    else doc.rect(x, y, w, h).stroke();

    if (text === "" || text === null || text === undefined) return;
    doc
      .fillColor("#000")
      .font(bold ? "Bold" : "Regular")
      .fontSize(size);
    const lh = doc.currentLineHeight();
    doc.text(String(text), x + 3, y + (h - lh) / 2, {
      width: w - 6,
      height: lh * 1.2,
      align,
      ellipsis: true,
    });
  };

  // Текст під кутом 90°, читається знизу вгору
  const verticalCell = (x, y, w, h, text, bold = false) => {
    doc.rect(x, y, w, h).fillAndStroke("#eef1f1", "#000");
    const maxLen = h - 10;
    let size = 8;
    doc
      .fillColor("#000")
      .font(bold ? "Bold" : "Regular")
      .fontSize(size);
    while (size > 6 && doc.widthOfString(text) > maxLen) {
      size -= 0.5;
      doc.fontSize(size);
    }
    let label = text;
    if (doc.widthOfString(label) > maxLen) {
      while (label.length > 1 && doc.widthOfString(`${label}…`) > maxLen) {
        label = label.slice(0, -1);
      }
      label += "…";
    }
    const px = x + (w - doc.currentLineHeight()) / 2;
    const py = y + h - 5;
    doc.save();
    doc.rotate(-90, { origin: [px, py] });
    doc.text(label, px, py, { lineBreak: false });
    doc.restore();
  };

  // Шапка таблиці: назви колонок і рядок з їх нумерацією
  const drawHeader = (y) => {
    cell(x0, y, NUM_W, HEAD_H, "", { fill: "#eef1f1" });
    cell(x0 + NUM_W, y, nameW, HEAD_H, "Прізвище та ім'я", {
      bold: true,
      size: 9,
      fill: "#eef1f1",
    });
    subjects.forEach((s, i) =>
      verticalCell(subjX(i), y, subjW, HEAD_H, s.name),
    );
    verticalCell(avgX, y, AVG_W, HEAD_H, "Середній бал", true);
    if (withExtras) {
      EXTRA_HEADERS.forEach((label, i) =>
        verticalCell(extraX(i), y, EXTRA_W, HEAD_H, label, true),
      );
    }
    y += HEAD_H;

    const indexStyle = { bold: true, size: 8 };
    cell(x0, y, NUM_W, INDEX_ROW_H, "№", indexStyle);
    cell(x0 + NUM_W, y, nameW, INDEX_ROW_H, "1", indexStyle);
    subjects.forEach((_, i) =>
      cell(subjX(i), y, subjW, INDEX_ROW_H, i + 2, indexStyle),
    );
    cell(avgX, y, AVG_W, INDEX_ROW_H, subjects.length + 2, indexStyle);
    if (withExtras) {
      EXTRA_HEADERS.forEach((_, i) =>
        cell(extraX(i), y, EXTRA_W, INDEX_ROW_H, subjects.length + 3 + i, {
          bold: true,
          size: 6,
        }),
      );
    }
    return y + INDEX_ROW_H;
  };

  /*  Сторінка 1: заголовок і шапка  */
  doc.fillColor("#000").font("Bold").fontSize(13);
  doc.text(title, left, top, { width: availW, align: "center" });
  let y = doc.y + 8;
  y = drawHeader(y);

  const need = (h) => {
    if (y + h <= bottom()) return;
    doc.addPage();
    y = drawHeader(top);
  };

  /*  Студенти  */
  rows.forEach((row, index) => {
    need(ROW_H);
    cell(x0, y, NUM_W, ROW_H, index + 1);
    cell(x0 + NUM_W, y, nameW, ROW_H, row.fullName, { align: "left" });
    row.cells.forEach((c, i) => cell(subjX(i), y, subjW, ROW_H, c.label));
    cell(
      avgX,
      y,
      AVG_W,
      ROW_H,
      row.average === null ? "" : row.average.toFixed(2),
      { bold: true },
    );
    if (withExtras) {
      const e = row.extra;
      [
        e ? e.scaled.toFixed(2) : "",
        e ? formatBonus(e.bonus) : "",
        e ? e.rating.toFixed(2) : "",
      ].forEach((text, i) =>
        cell(extraX(i), y, EXTRA_W, ROW_H, text, { size: 7 }),
      );
    }
    y += ROW_H;
  });

  /*  Підсумки  */
  need(ROW_H * 6);

  const labelW = NUM_W + nameW;
  scaleLabels.forEach((label, bucket) => {
    cell(x0, y, labelW, ROW_H, bucket === 0 ? `Оцінки:   ${label}` : label, {
      align: "right",
    });
    columns.forEach((col, i) =>
      cell(subjX(i), y, subjW, ROW_H, col.counts[bucket]),
    );
    y += ROW_H;
  });
  // Середній бал групи — одна комірка на чотири рядки
  cell(
    avgX,
    y - ROW_H * 4,
    AVG_W,
    ROW_H * 4,
    overall.average === null ? "" : overall.average.toFixed(2),
    { bold: true, size: 10 },
  );

  const percent = (v) => (v === null ? "—" : `${v}%`);
  [
    ["Якісна успішність, %", "quality"],
    ["Абсолютна успішність, %", "absolute"],
  ].forEach(([label, key]) => {
    cell(x0, y, labelW, ROW_H, label, { align: "right" });
    columns.forEach((col, i) =>
      cell(subjX(i), y, subjW, ROW_H, percent(col[key])),
    );
    cell(avgX, y, AVG_W, ROW_H, percent(overall[key]), { bold: true, size: 9 });
    y += ROW_H;
  });

  /*  Підпис куратора  */
  if (y + 44 > bottom()) {
    doc.addPage();
    y = top;
  }
  y += 22;
  doc.fillColor("#000").font("Bold").fontSize(10);
  const signX = x0 + 30;
  doc.text("Класний керівник", signX, y, { lineBreak: false });
  const lineX = signX + doc.widthOfString("Класний керівник") + 20;
  doc
    .moveTo(lineX, y + 11)
    .lineTo(lineX + 110, y + 11)
    .stroke();
  doc.text(report.curatorSignature, lineX + 130, y, { lineBreak: false });
};

const ensureFonts = () => {
  [FONT_REGULAR, FONT_BOLD].forEach((file) => {
    if (!fs.existsSync(file)) throw new Error(`Не знайдено шрифт: ${file}`);
  });
};

// Дані з БД збираються до виклику, тому помилки ще можна віддати як JSON
const streamGradesReportPdf = (res, report) => {
  ensureFonts();

  const doc = new PDFDocument({
    size: "A4",
    margin: 28,
    info: { Title: report.title, Author: "Aleph" },
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="report.pdf"; filename*=UTF-8''${encodeURIComponent(report.filename)}`,
  );

  doc.pipe(res);
  renderGradesReportPdf(doc, report);
  doc.end();
};

module.exports = {
  buildGradesReport,
  streamGradesReportPdf,
  getAcademicStartYear,
};
