/**
 * The بيان قيد form's own stylesheet — a portrait A4 sheet reproduced from the
 * paper form, independent of the result extract's landscape one. Every rule is
 * scoped under `.statement` so the printed form keeps its paper look and never
 * picks up the app's theme, which is why it does not use the semantic tokens.
 */
export const STATEMENT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Naskh+Arabic:wght@400..700&display=swap');

.statement-screen{ background:#e9e9e4; min-height:100vh; }
.statement{
  --ink:#1a1a1a;
  --line:#000;
  padding:24px;
  display:flex;
  justify-content:center;
  font-family:'Noto Naskh Arabic', serif;
  color:var(--ink);
}
.statement *{ box-sizing:border-box; }
.statement .sheet{
  background:#fff;
  width:210mm;
  min-height:297mm;
  padding:12mm 16mm 16mm;
  display:flex;
  flex-direction:column;
  box-shadow:0 1px 4px rgba(0,0,0,.18);
}

/* ---------- header: seal / letterhead ---------- */
.statement .head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  direction:ltr;
}
.statement .crest{ width:auto; flex:0 0 auto; }
.statement .crest-start{ height:64px; }
.statement .crest-end{ height:62px; }

/* ---------- title ---------- */
.statement .title{
  align-self:center;
  margin-top:2px;
  padding:4px 56px;
  border:3px double var(--line);
  border-radius:12px;
  font-size:24px;
  font-weight:700;
  letter-spacing:2px;
}

/* ---------- lines ---------- */
.statement .line{
  display:flex;
  align-items:baseline;
  gap:8px;
  font-size:16px;
  line-height:2.3;
  white-space:nowrap;
}
.statement .subtitle{ margin-top:14px; font-size:15px; }
.statement .body-lines{ margin-top:18px; display:flex; flex-direction:column; }

/* A dotted rule that carries a value when there is one, and stays empty to be
   filled in by hand when there is not. */
.statement .fill{
  display:inline-block;
  flex:1 1 auto;
  min-width:60px;
  min-height:1.6em;
  line-height:1.6;
  border-bottom:1px dotted var(--line);
  padding:0 8px;
  font-weight:700;
  text-align:center;
  white-space:normal;
}
.statement .fill.fixed{ flex:0 0 auto; }
.statement .w-sm{ min-width:48px; }
.statement .w-md{ min-width:110px; }
.statement .w-lg{ min-width:200px; }
.statement .w-xl{ min-width:300px; }
.statement .fill.year-note{
  flex:0 0 auto;
  min-width:360px;
  margin-inline:10px;
}

/* Year / month / day as separate items in one LTR run, so RTL bidi can never
   put the day on the left of the year. */
.statement .run{
  display:inline-flex;
  align-items:baseline;
  direction:ltr;
  unicode-bidi:isolate;
  gap:4px;
}
.statement .run .fill{ flex:0 0 auto; min-width:36px; padding:0 4px; }
.statement .run .fill.year{ min-width:64px; }

/* ---------- date pill ---------- */
.statement .date-pill{
  align-self:center;
  margin-top:10px;
  padding:2px 26px;
  border:1.5px solid var(--line);
  border-radius:999px;
  font-size:16px;
  font-weight:700;
}
.statement .date-pill .fill{ border-bottom-style:none; }

/* ---------- note box ---------- */
.statement .note{
  margin-top:26px;
  border:1.5px solid var(--line);
  border-radius:14px;
  padding:6px 18px 12px;
  font-size:15.5px;
  font-weight:700;
  line-height:2;
  text-align:center;
}
.statement .note-title{
  display:block;
  text-align:start;
  text-decoration:underline;
  font-size:14px;
}

/* ---------- signatures ---------- */
.statement .signatures{
  display:flex;
  justify-content:space-between;
  margin-top:48px;
  padding:0 6px;
  font-size:16px;
  font-weight:700;
}
.statement .approval{
  display:flex;
  align-items:flex-start;
  gap:48px;
  margin-top:auto;
  padding-top:56px;
  padding-inline-start:40px;
  font-size:16px;
  font-weight:700;
}
.statement .approval-officer{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
}
.statement .approval-officer .holder-name{ font-weight:400; }

@media print{
  body{ background:#fff; }
  .statement .crest{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .statement-chrome{ display:none !important; }
  .statement-screen{ background:#fff; }
  .statement{ padding:0; }
  .statement .sheet{ width:100%; min-height:auto; padding:0; box-shadow:none; }
  @page{ size:A4 portrait; margin:12mm 14mm; }
}
`
