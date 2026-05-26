import { useState, useRef } from "react";
import ContractForm from "./components/ContractForm";
import { buildTemplateValues, buildDocxBlob, docxToHtml, ContractValues } from "./contractUtils";

const defaultValues: ContractValues = {
  entityType: "مؤسسة",
  entityName: "",
  abbreviation: "",
  crNumber: "",
  location: "",
  repName: "",
  repTitle: "المدير العام أو الوكيل المفوض",
  contractDate: (() => {
    const d = new Date();
    const z = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
  })(),
  commissionPct: "8",
  monthlyFee: "160",
};

type Status = { msg: string; kind: "" | "ok" | "err" };

export default function App() {
  const [values, setValues] = useState<ContractValues>(defaultValues);
  const [status, setStatus] = useState<Status>({ msg: "جاهز", kind: "" });
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<"word" | "print" | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const isReady = Object.entries(values).every(([, v]) => String(v).trim() !== "");

  function resetForm() {
    setValues({
      ...defaultValues,
      contractDate: (() => {
        const d = new Date();
        const z = (n: number) => String(n).padStart(2, "0");
        return `${d.getFullYear()}-${z(d.getMonth() + 1)}-${z(d.getDate())}`;
      })(),
    });
    setStatus({ msg: "تم التفريغ", kind: "" });
  }

  async function handleDownloadWord() {
    setLoadingAction("word");
    setStatus({ msg: "جاري التوليد...", kind: "" });
    try {
      const tpl = buildTemplateValues(values);
      const { blob } = await buildDocxBlob(tpl);
      const name = (values.entityName || "العميل").replace(/[/\\:*?"<>|]/g, "");
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `عقد كوينز - ${name}.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      setStatus({ msg: "✓ تم التحميل", kind: "ok" });
    } catch (e: unknown) {
      setStatus({ msg: "خطأ: " + (e instanceof Error ? e.message : String(e)), kind: "err" });
    } finally {
      setLoadingAction(null);
    }
  }

  async function handlePreviewPrint() {
    setLoadingAction("print");
    setStatus({ msg: "جاري التحضير...", kind: "" });
    try {
      const tpl = buildTemplateValues(values);
      const { blob } = await buildDocxBlob(tpl);
      const html = await docxToHtml(blob);
      setPreviewHtml(html);
      setStatus({ msg: "جاهز", kind: "" });
    } catch (e: unknown) {
      setStatus({ msg: "خطأ: " + (e instanceof Error ? e.message : String(e)), kind: "err" });
    } finally {
      setLoadingAction(null);
    }
  }

  function closePreview() {
    setPreviewHtml(null);
  }

  function doPrint() {
    window.print();
  }

  const statusColor =
    status.kind === "ok"
      ? "text-green-700"
      : status.kind === "err"
      ? "text-red-600"
      : "text-gray-500";

  return (
    <div dir="rtl" className="min-h-screen" style={{ background: "radial-gradient(900px 500px at 90% -10%,rgba(255,120,73,.08),transparent 60%),radial-gradient(700px 400px at -10% 20%,rgba(255,120,73,.05),transparent 60%),#f7f4ee", fontFamily: "'Tajawal', 'Noto Sans Arabic', sans-serif" }}>

      {/* Print overlay — only visible when printing */}
      {previewHtml && (
        <div
          ref={overlayRef}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,.6)" }}
          onClick={(e) => { if (e.target === overlayRef.current) closePreview(); }}
        >
          <div className="bg-white rounded-xl flex flex-col overflow-hidden shadow-2xl" style={{ width: "min(860px, 96vw)", height: "90vh" }}>
            {/* Overlay header */}
            <div className="no-print flex items-center justify-between px-5 py-3.5 border-b border-gray-200 flex-shrink-0">
              <span className="font-bold text-sm text-gray-800">معاينة العقد</span>
              <div className="flex gap-2">
                <button
                  onClick={doPrint}
                  className="text-sm font-bold px-4 py-2 rounded-lg text-white"
                  style={{ background: "#ff7849" }}
                >
                  🖨 طباعة / حفظ PDF
                </button>
                <button
                  onClick={closePreview}
                  className="text-sm font-bold px-4 py-2 rounded-lg bg-gray-100 text-gray-800 hover:bg-gray-200"
                >
                  ✕ إغلاق
                </button>
              </div>
            </div>
            {/* Contract content */}
            <div
              id="printContent"
              className="flex-1 overflow-y-auto"
              style={{ padding: "24px 32px", direction: "rtl", fontFamily: "'Times New Roman', serif", fontSize: "11pt", lineHeight: "1.6", color: "#000" }}
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
          </div>
        </div>
      )}

      {/* Main UI */}
      <div className="max-w-3xl mx-auto px-4 py-8 no-print">
        {/* Header */}
        <header className="flex items-center gap-4 mb-7 pb-5 border-b border-stone-200">
          <img src="/koinz-logo.png" alt="Koinz" className="h-10 object-contain" />
          <div>
            <h1 className="m-0 text-2xl font-bold text-gray-900">مولّد عقود الاشتراك</h1>
            <p className="mt-0.5 text-sm text-gray-400">عبّي البيانات وحمّل العقد — مطابق 100% للأصل</p>
          </div>
        </header>

        {/* Card */}
        <div className="bg-white border border-stone-200 rounded-2xl p-7 shadow-sm">
          <ContractForm values={values} onChange={setValues} />

          {/* Actions */}
          <div className="mt-7 pt-5 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3">
            <span className={`text-sm ${statusColor}`}>{status.msg}</span>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={resetForm}
                className="text-sm font-bold px-4 py-2.5 rounded-xl border border-stone-200 text-gray-600 bg-transparent hover:bg-stone-50 transition-colors"
              >
                تفريغ
              </button>
              <button
                onClick={handlePreviewPrint}
                disabled={!isReady || loadingAction !== null}
                className="text-sm font-bold px-4 py-2.5 rounded-xl text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#1a1a1a" }}
              >
                {loadingAction === "print" ? "جاري التحضير..." : "🖨 معاينة وطباعة"}
              </button>
              <button
                onClick={handleDownloadWord}
                disabled={!isReady || loadingAction !== null}
                className="text-sm font-bold px-5 py-2.5 rounded-xl text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "#ff7849" }}
              >
                {loadingAction === "word" ? "جاري التحميل..." : "⬇ تحميل Word"}
              </button>
            </div>
          </div>
        </div>

        {/* Note */}
        <div className="mt-4 px-4 py-3 rounded-lg text-sm text-gray-600 leading-relaxed" style={{ background: "#fff1ea", borderRight: "3px solid #ff7849" }}>
          <strong className="text-orange-600">ملاحظة:</strong> الملف الأصلي يُستخدم كما هو — لا يتغير النص أو التنسيق أو الشعار. تتغيّر فقط الحقول المدخلة.
        </div>
      </div>

      {/* Print-only styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body > div > div.no-print { display: none !important; }
          #printContent { padding: 0 !important; overflow: visible !important; height: auto !important; }
          .fixed { position: static !important; background: transparent !important; width: 100% !important; height: auto !important; box-shadow: none !important; border: none !important; border-radius: 0 !important; }
          .flex-col { height: auto !important; }
          .overflow-y-auto { overflow: visible !important; }
        }
        #printContent img.koinz-logo { height: 50px; width: auto; display: block; margin-bottom: 24px; }
        #printContent p { margin: 0 0 10px; text-align: justify; }
      `}</style>
    </div>
  );
}
