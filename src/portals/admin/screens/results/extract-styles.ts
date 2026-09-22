/**
 * The official extract's own stylesheet, carried over from
 * `src/templates/grades(4-5-6).html` almost verbatim — every rule is scoped
 * under `.extract` so the printed form keeps its paper look and never picks up
 * the app's theme. This is a government form reproduced to the millimetre, not
 * a design-system screen, which is why it does not use the semantic tokens.
 */
export const EXTRACT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400..700&family=Noto+Kufi+Arabic:wght@400..700&display=swap');

.extract-screen{ background:#e9e9e4; min-height:100vh; }
.extract{
  --ink:#1a1a1a;
  --line:#000;
  --paper:#fdfcf9;
  padding:24px;
  display:flex;
  justify-content:center;
  font-family:'Noto Naskh Arabic', serif;
  color:var(--ink);
}
.extract *{ box-sizing:border-box; }
.extract .page{
  background:var(--paper);
  width:1300px;
  max-width:100%;
  padding:22px 34px 26px;
  border:2.5px solid var(--line);
  position:relative;
}

/* ---------- top row: seal / date / letterhead ---------- */
.extract .top-row{
  display:flex;
  flex-direction:row;
  justify-content:space-between;
  align-items:flex-start;
  direction:ltr;
  margin-bottom:6px;
}
.extract .seal{
  width:70px;height:70px;
  border:2px solid #333;
  border-radius:50%;
  display:flex;align-items:center;justify-content:center;
  font-size:8px;text-align:center;color:#555;
  background:repeating-conic-gradient(from 0deg, #cfcfc9 0deg 8deg, transparent 8deg 16deg);
  flex:0 0 auto;
}
/* The two supplied crests replace the drawn placeholders at the top.
   Their flat JPEG gray is already knocked out, so the paper shows through. */
.extract .crest{
  flex:0 0 auto;
  width:auto;
}
.extract .crest-start{ height:92px; }
.extract .crest-end{ height:76px; padding-top:4px; }
.extract .date-field{
  direction:rtl;
  font-size:15px;
  padding-top:14px;
  white-space:nowrap;
}
.extract .date-field .blank{
  display:inline-block;
  min-width:26px;
  border-bottom:1px dotted #000;
  margin:0 3px;
}
/* Isolates day/month/year (and academic-year pairs) so RTL flex/bidi
   cannot reverse ٢٠٢٥/٢٠٢٦ into ٢٠٢٦/٢٠٢٥. */
.extract .date-run{
  display:inline-block;
  direction:ltr;
  unicode-bidi:isolate;
}
.extract .letterhead{
  direction:rtl;
  text-align:right;
  font-size:11px;
  line-height:1.6;
  color:#333;
  flex:0 0 auto;
}

/* ---------- title box ---------- */
.extract .title-wrap{
  display:flex;
  justify-content:center;
  margin:6px 0 14px;
}
.extract .title-box{
  border:1.5px solid var(--line);
  padding:6px 26px;
  font-weight:700;
  font-size:20px;
  display:flex;
  align-items:baseline;
  gap:8px;
}
.extract .title-box .blank{
  display:inline-block;
  min-width:170px;
  border-bottom:1px dotted #000;
}

/* ---------- info lines ---------- */
.extract .info-lines p{
  margin:5px 0;
  font-size:14.5px;
  text-align:right;
  display:flex;
  flex-wrap:nowrap;
  align-items:baseline;
  white-space:nowrap;
  justify-content:flex-start;
}
.extract .info-lines p .txt{ white-space:nowrap; }
.extract .blank{
  display:inline-block;
  border-bottom:1px dotted #000;
  margin:0 4px;
}
/* A blank the API could fill keeps the dotted rule and sets the value on it. */
.extract .blank.filled{
  padding:0 6px;
  font-weight:600;
  text-align:center;
  white-space:nowrap;
}
.extract .b-xl{ min-width:260px; }
.extract .b-lg{ min-width:140px; }
.extract .b-md{ min-width:80px; }
.extract .b-sm{ min-width:34px; }
/* Under dir=rtl, flex-start packs to the right — where Arabic lines begin. */
.extract .info-lines .row{
  display:flex;justify-content:flex-start;flex-wrap:wrap;
  row-gap:2px;
}

/* ---------- grades table ---------- */
.extract table.grades{
  width:100%;
  border-collapse:collapse;
  margin-top:14px;
  table-layout:fixed;
}
.extract table.grades th, .extract table.grades td{
  border:1px solid var(--line);
  text-align:center;
  vertical-align:middle;
  font-size:11px;
  padding:3px 2px;
  line-height:1.3;
  overflow-wrap:break-word;
  white-space:normal;
}
.extract table.grades th{
  font-weight:700;
  height:56px;
  font-size:10.5px;
}
.extract table.grades td.label-col, .extract table.grades th.label-col{
  font-weight:700;
  width:8%;
}
.extract .summary-row td{
  font-weight:700;
  font-size:12px;
  height:30px;
}
.extract .summary-row td.blank-cell{
  border:none;
  border-top:1px solid var(--line);
}
.extract .vertical-text{
  font-weight:700;
  height:130px;
  position:relative;
  padding:0;
}
.extract .vertical-text span{
  display:inline-block;
  transform:rotate(-90deg);
  white-space:nowrap;
  letter-spacing:1px;
}
.extract .num-row td{ height:26px; }
.extract .fill-row td{ height:34px; }

/* ---------- after-table text ---------- */
.extract .after-table{ margin-top:14px; }
.extract .after-table p{
  margin:6px 0;
  font-size:13.5px;
  text-align:right;
}
.extract .submit-line{ display:flex;align-items:baseline;justify-content:flex-start; }
.extract .submit-line .blank{ flex:1 1 auto;max-width:520px;margin-inline-start:6px; }
.extract .pay-line{ display:flex;justify-content:flex-start;flex-wrap:wrap;gap:4px; }

/* ---------- signatures ---------- */
.extract .signatures{
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  margin-top:56px;
  font-size:14px;
  font-weight:700;
  padding:0 6px;
}
.extract .signatures > div{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
}
/* The post holder's name, printed under the title of the post. */
.extract .signatures .holder-name{ font-weight:400;font-size:13px; }
.extract .office-stamp{
  position:absolute;
  left:34px;
  bottom:64px;
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:4px;
}
.extract .office-stamp .seal{ width:56px;height:56px; }
.extract .office-stamp .date-field{ font-size:11px;padding-top:0; }

@media print{
  body{ background:#fff; }
  /* Keep the crests when the browser's "background graphics" box is off. */
  .extract .crest{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .extract-chrome{ display:none !important; }
  .extract-screen{ background:#fff; }
  .extract{ background:#fff; padding:0; }
  .extract .page{ border-width:2px; box-shadow:none; width:100%; }
  @page{ size:A4 landscape; margin:10mm; }
}
`
