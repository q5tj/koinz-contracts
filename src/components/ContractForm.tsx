import { ContractValues } from "../contractUtils";

interface Props {
  values: ContractValues;
  onChange: (v: ContractValues) => void;
}

function Label({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <label className="flex flex-col gap-0.5">
      <span className="text-xs font-bold text-gray-600">{children}</span>
      {hint && <span className="text-xs text-gray-400 font-normal">{hint}</span>}
    </label>
  );
}

function Input({
  id,
  value,
  onChange,
  placeholder,
  type = "text",
  suffix,
}: {
  id: keyof ContractValues;
  value: string;
  onChange: (id: keyof ContractValues, v: string) => void;
  placeholder?: string;
  type?: string;
  suffix?: string;
}) {
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        placeholder={placeholder}
        dir={type === "date" || type === "number" ? "ltr" : "rtl"}
        className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 bg-[#fbf9f4] text-gray-900 placeholder:text-gray-300 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
        style={suffix ? { paddingLeft: "2.2rem" } : undefined}
      />
      {suffix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">
          {suffix}
        </span>
      )}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-bold tracking-wider mb-3.5 pb-2 border-b border-dashed border-stone-200" style={{ color: "#ff7849" }}>
      {children}
    </p>
  );
}

export default function ContractForm({ values, onChange }: Props) {
  const set = (id: keyof ContractValues, v: string) => onChange({ ...values, [id]: v });

  return (
    <div className="flex flex-col gap-6">
      {/* Party 2 info */}
      <div>
        <SectionTitle>بيانات الطرف الثاني (المشترك)</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>نوع الكيان</Label>
            <select
              value={values.entityType}
              onChange={(e) => set("entityType", e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm rounded-lg border border-stone-200 bg-[#fbf9f4] text-gray-900 focus:outline-none focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 transition-all"
              dir="rtl"
            >
              <option value="مؤسسة">مؤسسة</option>
              <option value="شركة">شركة</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label hint="بدون مؤسسة/شركة">اسم الكيان</Label>
            <Input id="entityName" value={values.entityName} onChange={set} placeholder="أوتي دي" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>الاختصار / الاسم الإنجليزي</Label>
            <Input id="abbreviation" value={values.abbreviation} onChange={set} placeholder="OTD" />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>رقم السجل التجاري</Label>
            <Input id="crNumber" value={values.crNumber} onChange={set} placeholder="7050726228" />
          </div>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label>المقر الرئيسي / العنوان</Label>
            <Input id="location" value={values.location} onChange={set} placeholder="الهفوف حي العزيزية الثاني عين ام سيف" />
          </div>
        </div>
      </div>

      {/* Signatory */}
      <div>
        <SectionTitle>الموقّع على العقد</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>اسم الموقّع</Label>
            <Input id="repName" value={values.repName} onChange={set} placeholder="محمد الأحمد" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>الصفة</Label>
            <Input id="repTitle" value={values.repTitle} onChange={set} placeholder="المدير العام أو الوكيل المفوض" />
          </div>
        </div>
      </div>

      {/* Date & financials */}
      <div>
        <SectionTitle>التاريخ والقيم المالية</SectionTitle>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label>تاريخ العقد</Label>
            <Input id="contractDate" value={values.contractDate} onChange={set} type="date" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>نسبة العمولة</Label>
            <Input id="commissionPct" value={values.commissionPct} onChange={set} type="number" placeholder="8" suffix="%" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label hint="لكل فرع">الاشتراك الشهري</Label>
            <Input id="monthlyFee" value={values.monthlyFee} onChange={set} type="number" placeholder="160" suffix="ر.س" />
          </div>
        </div>
      </div>
    </div>
  );
}
