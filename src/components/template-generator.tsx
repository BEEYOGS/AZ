"use client";

import { AlertCircle, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";

const scriptSources = [
  "/vendor/xlsx.full.min.js",
  "/vendor/jszip.min.js",
  "/vendor/jsbarcode.min.js",
  "/js/template-generator.js",
];

const scriptLoads = new Map<string, Promise<void>>();

function loadScript(source: string) {
  const existingLoad = scriptLoads.get(source);
  if (existingLoad) return existingLoad;

  const load = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = source;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => {
      script.remove();
      reject(new Error(`Gagal memuat ${source}.`));
    };
    document.head.append(script);
  });

  scriptLoads.set(source, load);
  load.catch(() => scriptLoads.delete(source));
  return load;
}

export function TemplateGenerator({ markup }: { markup: string }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function initialize() {
      try {
        for (const source of scriptSources) {
          await loadScript(source);
        }
        if (active) {
          setLoading(false);
          setError("");
        }
      } catch (loadError) {
        if (active) {
          setLoading(false);
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Aplikasi gagal dimuat. Muat ulang halaman untuk mencoba lagi.",
          );
        }
      }
    }

    void initialize();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      {(loading || error) && (
        <div
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-stone-700 bg-stone-900 px-4 py-3 text-sm text-stone-100 shadow-2xl"
          role={error ? "alert" : "status"}
        >
          {error ? (
            <AlertCircle aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-rose-300" />
          ) : (
            <LoaderCircle
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 animate-spin text-amber-300"
            />
          )}
          <span>
            {error || "Menyiapkan fitur Excel, barcode, dan ekspor ZIP…"}
            {error && (
              <>
                {" "}
                <button
                  className="font-semibold text-amber-300 underline underline-offset-2"
                  onClick={() => window.location.reload()}
                  type="button"
                >
                  Muat ulang
                </button>
              </>
            )}
          </span>
        </div>
      )}
    </div>
  );
}
