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
  font-weight:600;
  color:var(--ink);
}
.statement *{ box-sizing:border-box; }
.statement .sheet{
  background:#fff;
  width:210mm;
  height:297mm;
  min-height:297mm;
  padding:0 16mm;
  display:flex;
  flex-direction:column;
  position:relative;
  z-index:0;
  overflow:hidden;
}
.statement .print-watermark{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  z-index:0;
  pointer-events:none;
  direction:ltr;
  -webkit-print-color-adjust:exact;
  print-color-adjust:exact;
}
.statement .sheet > :not(.print-watermark){ position:relative; z-index:1; }

/* ---------- header: seal / letterhead ---------- */
.statement .head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  direction:ltr;
  margin-inline:-16mm;
}
.statement .crest{ width:auto; flex:0 0 auto; }
.statement .crest-start{ height:124px; }
.statement .crest-end{ height:130px; }

/* ---------- title ---------- */
.statement .title{
  align-self:center;
  margin-top:2px;
  padding:8px 64px;
  border:3px double var(--line);
  border-radius:12px;
  font-size:28px;
  font-weight:700;
  letter-spacing:2px;
}

/* ---------- lines ---------- */
.statement .line{
  display:flex;
  align-items:baseline;
  gap:8px;
  font-size:18px;
  line-height:2.3;
  white-space:nowrap;
}
.statement .subtitle{ margin-top:14px; font-size:17px; }
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
  font-size:18px;
}
.statement .date-pill .fill{ border-bottom-style:none; }

/* ---------- note box ---------- */
.statement .note{
  margin-top:26px;
  border:1.5px solid var(--line);
  border-radius:14px;
  padding:6px 18px 12px;
  font-size:17px;
  line-height:2;
  text-align:center;
}
.statement .note-title{
  display:block;
  text-align:start;
  text-decoration:underline;
  font-size:15.5px;
}

/* ---------- signatures ---------- */
.statement .signatures{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  align-self:stretch;
  width:100%;
  margin-top:auto;
  margin-bottom:24mm;
  padding:0;
  font-size:18px;
}
.statement .approval-officer{
  display:flex;
  flex-direction:column;
  align-items:center;
  gap:6px;
}
.statement .approval-officer .holder-name{ font-weight:700; }

@media print{
  html, body, #root{ height:auto; margin:0; }
  body{ background:#fff; }
  .statement .crest{ -webkit-print-color-adjust:exact; print-color-adjust:exact; }
  .statement-chrome{ display:none !important; }
  .statement-screen{ background:#fff; min-height:0; }
  .statement{ padding:0; }
  .statement .sheet{
    width:100%;
    height:297mm;
    min-height:297mm;
    padding:0 16mm;
    box-shadow:none;
  }
  @page{
    size:A4 portrait;
    margin:0;
    @top-left{ content:none; }
    @top-center{ content:none; }
    @top-right{ content:none; }
    @bottom-left{ content:none; }
    @bottom-center{ content:none; }
    @bottom-right{ content:none; }
  }
}
`
