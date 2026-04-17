"use client";

import { useEffect, useMemo, useState } from "react";

import { buildPublicApiUrl } from "@/lib/api-base";
import type { PassageImportSummary, VerbalPassageRecord } from "@/lib/verbal-passages";
import { VerbalPassageViewer } from "@/components/verbal-passage-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PassageFormQuestion = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string;
};

type PassageFormState = {
  id?: string;
  slug: string;
  title: string;
  keywords: string;
  passageText: string;
  status: "draft" | "published";
  externalSourceId: string;
  version: string;
  questions: PassageFormQuestion[];
};

const emptyQuestion = (): PassageFormQuestion => ({
  questionText: "",
  optionA: "",
  optionB: "",
  optionC: "",
  optionD: "",
  correctOption: "A",
  explanation: "",
});

const emptyForm = (): PassageFormState => ({
  slug: "",
  title: "",
  keywords: "",
  passageText: "",
  status: "draft",
  externalSourceId: "",
  version: "",
  questions: [emptyQuestion()],
});

function toFormState(passage: VerbalPassageRecord): PassageFormState {
  return {
    id: passage.id,
    slug: passage.slug,
    title: passage.title,
    keywords: passage.keywords.join(", "),
    passageText: passage.passageText,
    status: passage.status,
    externalSourceId: passage.externalSourceId ?? "",
    version: String(passage.version),
    questions: passage.questions.map((question) => ({
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption,
      explanation: question.explanation ?? "",
    })),
  };
}

function toPayload(form: PassageFormState) {
  return {
    slug: form.slug || null,
    title: form.title,
    keywords: form.keywords
      .split(/[,،;\n|]+/g)
      .map((item) => item.trim())
      .filter(Boolean),
    passageText: form.passageText,
    status: form.status,
    externalSourceId: form.externalSourceId || null,
    version: form.version ? Number(form.version) : null,
    questions: form.questions.map((question) => ({
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption,
      explanation: question.explanation || null,
    })),
  };
}

export function AdminVerbalPassagesManager() {
  const [items, setItems] = useState<VerbalPassageRecord[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<PassageFormState>(emptyForm());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [message, setMessage] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importSummary, setImportSummary] = useState<PassageImportSummary | null>(null);

  async function loadItems() {
    const response = await fetch(
      buildPublicApiUrl(
        `/api/verbal-passages?status=${statusFilter}&q=${encodeURIComponent(search)}&limit=100`,
      ),
      { cache: "no-store" },
    );

    const payload = (await response.json()) as { items?: VerbalPassageRecord[]; message?: string };

    if (!response.ok) {
      throw new Error(payload.message ?? "تعذر تحميل بنك القطع اللفظية.");
    }

    setItems(payload.items ?? []);
  }

  useEffect(() => {
    loadItems().catch((error) => setMessage(error instanceof Error ? error.message : "تعذر تحميل القائمة."));
  }, [search, statusFilter]);

  async function loadPassage(id: string) {
    const response = await fetch(buildPublicApiUrl(`/api/verbal-passages/${id}`), { cache: "no-store" });
    const payload = (await response.json()) as { item?: VerbalPassageRecord; message?: string };

    if (!response.ok || !payload.item) {
      throw new Error(payload.message ?? "تعذر تحميل تفاصيل القطعة.");
    }

    setSelectedId(id);
    setForm(toFormState(payload.item));
  }

  const previewPassage = useMemo<VerbalPassageRecord | null>(() => {
    if (!form.title.trim() || !form.passageText.trim()) return null;

    return {
      id: form.id ?? "draft-preview",
      slug: form.slug.trim() || "draft-preview",
      title: form.title,
      keywords: form.keywords
        .split(/[,،;\n|]+/g)
        .map((item) => item.trim())
        .filter(Boolean),
      passageText: form.passageText,
      status: form.status,
      version: Number(form.version) || 1,
      externalSourceId: form.externalSourceId || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      questions: form.questions.map((question, index) => ({
        id: `${form.id ?? "draft"}-${index + 1}`,
        questionOrder: index + 1,
        questionText: question.questionText,
        optionA: question.optionA,
        optionB: question.optionB,
        optionC: question.optionC,
        optionD: question.optionD,
        correctOption: question.correctOption,
        explanation: question.explanation || null,
      })),
    };
  }, [form]);

  async function savePassage() {
    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch(
        buildPublicApiUrl(form.id ? `/api/verbal-passages/${form.id}` : "/api/verbal-passages"),
        {
          method: form.id ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(toPayload(form)),
        },
      );

      const payload = (await response.json()) as { item?: VerbalPassageRecord; message?: string };
      if (!response.ok || !payload.item) {
        throw new Error(payload.message ?? "تعذر حفظ القطعة.");
      }

      setForm(toFormState(payload.item));
      setSelectedId(payload.item.id);
      setMessage("تم حفظ القطعة بنجاح.");
      await loadItems();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حفظ القطعة.");
    } finally {
      setIsBusy(false);
    }
  }

  async function removePassage() {
    if (!form.id) return;
    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch(buildPublicApiUrl(`/api/verbal-passages/${form.id}`), {
        method: "DELETE",
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message ?? "تعذر حذف القطعة.");
      }

      setForm(emptyForm());
      setSelectedId(null);
      setMessage("تم حذف القطعة.");
      await loadItems();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حذف القطعة.");
    } finally {
      setIsBusy(false);
    }
  }

  async function runImport(preview: boolean) {
    if (!importFile) {
      setMessage("اختر ملف CSV أو JSON أولًا.");
      return;
    }

    setIsBusy(true);
    setMessage("");

    try {
      const formData = new FormData();
      formData.set("file", importFile);
      formData.set("preview", preview ? "1" : "0");

      const response = await fetch(buildPublicApiUrl("/api/verbal-passages/import"), {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { summary?: PassageImportSummary; message?: string };

      if (!response.ok || !payload.summary) {
        throw new Error(payload.message ?? "تعذر استيراد الملف.");
      }

      setImportSummary(payload.summary);
      setMessage(preview ? "تم تجهيز معاينة الاستيراد." : "تم تنفيذ الاستيراد بنجاح.");
      if (!preview) {
        await loadItems();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر استيراد الملف.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div className="space-y-8" dir="rtl">
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <aside className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="display-font text-xl font-bold text-slate-950">لوحة القطع اللفظية</div>
          <div className="mt-4 space-y-3">
            <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ابحث في الإدارة" />
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as "all" | "draft" | "published")}
              className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700"
            >
              <option value="all">كل الحالات</option>
              <option value="draft">المسودات</option>
              <option value="published">المنشور</option>
            </select>

            <Button className="w-full" onClick={() => {
              setSelectedId(null);
              setForm(emptyForm());
            }}>
              إضافة قطعة جديدة
            </Button>
          </div>

          <div className="mt-5 space-y-2">
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => loadPassage(item.id).catch((error) => setMessage(error instanceof Error ? error.message : "تعذر تحميل القطعة."))}
                className={`w-full rounded-[1.25rem] border p-4 text-right transition ${
                  selectedId === item.id
                    ? "border-[#123B7A] bg-[#123B7A]/5"
                    : "border-slate-200 bg-slate-50/70 hover:border-[#C99A43]"
                }`}
              >
                <div className="display-font text-base font-bold text-slate-950">{item.title}</div>
                <div className="mt-2 text-xs text-slate-500">{item.questions.length} أسئلة</div>
              </button>
            ))}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="display-font text-2xl font-bold text-slate-950">
              {form.id ? "تعديل القطعة" : "إضافة قطعة جديدة"}
            </div>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Input
                value={form.slug}
                onChange={(event) => setForm((previous) => ({ ...previous, slug: event.target.value }))}
                placeholder="slug المفتاحي للرابط"
              />
              <Input
                value={form.title}
                onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                placeholder="عنوان القطعة"
              />
              <Input
                value={form.keywords}
                onChange={(event) => setForm((previous) => ({ ...previous, keywords: event.target.value }))}
                placeholder="الكلمات المفتاحية، مفصولة بفواصل"
              />
              <Input
                value={form.externalSourceId}
                onChange={(event) => setForm((previous) => ({ ...previous, externalSourceId: event.target.value }))}
                placeholder="external_source_id (اختياري)"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={form.version}
                  onChange={(event) => setForm((previous) => ({ ...previous, version: event.target.value }))}
                  placeholder="النسخة"
                />
                <select
                  value={form.status}
                  onChange={(event) => setForm((previous) => ({ ...previous, status: event.target.value as "draft" | "published" }))}
                  className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700"
                >
                  <option value="draft">draft</option>
                  <option value="published">published</option>
                </select>
              </div>
            </div>

            <textarea
              value={form.passageText}
              onChange={(event) => setForm((previous) => ({ ...previous, passageText: event.target.value }))}
              placeholder="نص القطعة"
              className="mt-4 min-h-[220px] w-full rounded-[1.25rem] border border-slate-200 px-4 py-4 text-sm leading-8 text-slate-800 outline-none focus:border-[#123B7A]"
            />

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="display-font text-xl font-bold text-slate-950">الأسئلة</div>
                <Button
                  type="button"
                  onClick={() =>
                    setForm((previous) => ({
                      ...previous,
                      questions: [...previous.questions, emptyQuestion()],
                    }))
                  }
                >
                  إضافة سؤال
                </Button>
              </div>

              {form.questions.map((question, index) => (
                <div key={`question-${index + 1}`} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <div className="display-font text-lg font-bold text-slate-950">سؤال {index + 1}</div>
                    {form.questions.length > 1 ? (
                      <button
                        type="button"
                        onClick={() =>
                          setForm((previous) => ({
                            ...previous,
                            questions: previous.questions.filter((_, questionIndex) => questionIndex !== index),
                          }))
                        }
                        className="text-sm font-semibold text-rose-700"
                      >
                        حذف السؤال
                      </button>
                    ) : null}
                  </div>

                  <textarea
                    value={question.questionText}
                    onChange={(event) =>
                      setForm((previous) => ({
                        ...previous,
                        questions: previous.questions.map((item, questionIndex) =>
                          questionIndex === index ? { ...item, questionText: event.target.value } : item,
                        ),
                      }))
                    }
                    placeholder="نص السؤال"
                    className="min-h-[120px] w-full rounded-[1.25rem] border border-slate-200 bg-white px-4 py-4 text-sm leading-8 text-slate-800 outline-none focus:border-[#123B7A]"
                  />

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    {(["optionA", "optionB", "optionC", "optionD"] as const).map((fieldKey, optionIndex) => (
                      <Input
                        key={fieldKey}
                        value={question[fieldKey]}
                        onChange={(event) =>
                          setForm((previous) => ({
                            ...previous,
                            questions: previous.questions.map((item, questionIndex) =>
                              questionIndex === index ? { ...item, [fieldKey]: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder={`الخيار ${["A", "B", "C", "D"][optionIndex]}`}
                      />
                    ))}
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr]">
                    <select
                      value={question.correctOption}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          questions: previous.questions.map((item, questionIndex) =>
                            questionIndex === index
                              ? { ...item, correctOption: event.target.value as "A" | "B" | "C" | "D" }
                              : item,
                          ),
                        }))
                      }
                      className="h-12 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-700"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="C">C</option>
                      <option value="D">D</option>
                    </select>
                    <Input
                      value={question.explanation}
                      onChange={(event) =>
                        setForm((previous) => ({
                          ...previous,
                          questions: previous.questions.map((item, questionIndex) =>
                            questionIndex === index ? { ...item, explanation: event.target.value } : item,
                          ),
                        }))
                      }
                      placeholder="شرح السؤال (اختياري)"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button onClick={savePassage} disabled={isBusy}>
                {form.id ? "حفظ التعديلات" : "إنشاء القطعة"}
              </Button>
              {form.id ? (
                <button
                  type="button"
                  onClick={removePassage}
                  disabled={isBusy}
                  className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700 disabled:opacity-50"
                >
                  حذف القطعة
                </button>
              ) : null}
            </div>
          </div>

          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="display-font text-2xl font-bold text-slate-950">استيراد جماعي CSV / JSON</div>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              ارفع ملفًا، ثم اعرض المعاينة قبل النشر. لن يتم كسر البيانات القديمة، وسيتم تجنب التكرار عند تطابق العنوان والنص.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <input
                type="file"
                accept=".json,.csv,application/json,text/csv"
                onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
                className="text-sm"
              />
              <Button type="button" onClick={() => runImport(true)} disabled={!importFile || isBusy}>
                Preview
              </Button>
              <Button type="button" onClick={() => runImport(false)} disabled={!importFile || isBusy}>
                Publish
              </Button>
            </div>

            {importSummary ? (
              <div className="mt-5 space-y-4">
                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    ["imported", importSummary.importedCount],
                    ["updated", importSummary.updatedCount],
                    ["skipped", importSummary.skippedCount],
                    ["failed", importSummary.failedRows.length],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4 text-center">
                      <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</div>
                      <div className="mt-2 display-font text-2xl font-bold text-slate-950">{value}</div>
                    </div>
                  ))}
                </div>

                <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 p-4">
                  <div className="mb-3 text-sm font-semibold text-slate-700">Preview before publish</div>
                  <div className="space-y-2">
                    {importSummary.previewItems.map((item, index) => (
                      <div key={`${item.title}-${index + 1}`} className="rounded-xl bg-white px-4 py-3 text-sm">
                        <span className="font-semibold text-slate-900">{item.title}</span>
                        <span className="mx-2 text-slate-400">•</span>
                        <span className="text-slate-600">
                          {item.action} / {item.questionCount} أسئلة / نسخة {item.version}
                        </span>
                        <div className="mt-1 text-slate-500">{item.reason}</div>
                      </div>
                    ))}
                  </div>

                  {importSummary.failedRows.length ? (
                    <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
                      {importSummary.failedRows.map((row) => (
                        <div key={`${row.row}-${row.reason}`}>[{row.row}] {row.reason}</div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ) : null}
          </div>

          {previewPassage ? <VerbalPassageViewer passage={previewPassage} mode="admin" /> : null}

          {message ? (
            <div className="rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {message}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
