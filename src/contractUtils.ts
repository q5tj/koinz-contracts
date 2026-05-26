import JSZip from "jszip";
import mammoth from "mammoth";
import { DOCX_B64, LOGO_B64, SPECS, ARABIC_DAYS } from "./contractData";

export interface ContractValues {
  entityType: string;
  entityName: string;
  abbreviation: string;
  crNumber: string;
  location: string;
  repName: string;
  repTitle: string;
  contractDate: string;
  commissionPct: string;
  monthlyFee: string;
}

function esc(s: string): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function b64ToUint8(b64: string): Uint8Array {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

export function buildTemplateValues(v: ContractValues) {
  const [yyyy, mm, dd] = v.contractDate.split("-");
  const day = ARABIC_DAYS[new Date(+yyyy, +mm - 1, +dd).getDay()];
  return {
    day: esc(day),
    date: esc(`${dd}/${mm}/${yyyy}`),
    entity_full: esc(`${v.entityType} ${v.entityName}`),
    abbr: esc(v.abbreviation),
    entity_type2: esc(v.entityType),
    location: esc(v.location),
    cr: esc(v.crNumber),
    rep_name: esc(v.repName),
    rep_title: esc(v.repTitle),
    pct: esc(v.commissionPct),
    fee: esc(v.monthlyFee),
  };
}

export async function buildDocxBlob(
  values: ReturnType<typeof buildTemplateValues>
): Promise<{ blob: Blob; zip: JSZip }> {
  const bytes = b64ToUint8(DOCX_B64);
  const zip = await JSZip.loadAsync(bytes);
  let xml = await zip.file("word/document.xml")!.async("string");

  const missing: string[] = [];
  for (const s of SPECS) {
    const v = (values as Record<string, string>)[s.name];
    if (v === undefined) continue;
    if (xml.indexOf(s.from) === -1) { missing.push(s.name); continue; }
    xml = xml.replace(s.from, s.tpl.replace("{V}", v));
  }

  if (missing.length) throw new Error("خطأ في القالب: " + missing.join("، "));

  zip.file("word/document.xml", xml);
  const blob = await zip.generateAsync({
    type: "blob",
    mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  });
  return { blob, zip };
}

export async function docxToHtml(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer });
  const logoTag = `<img class="koinz-logo" src="data:image/png;base64,${LOGO_B64}" alt="Koinz" style="height:50px;width:auto;display:block;margin-bottom:24px;" />`;
  return logoTag + result.value;
}
