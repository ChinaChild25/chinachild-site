"use client";

import { useEffect, useMemo, useState } from "react";

type SlotFile = {
  name: string;
  type: string;
  url: string;
};

type DocumentUploadSlotsProps = {
  slots: number;
  ownerName: string;
};

function PdfPreview({ fileName }: { fileName: string }) {
  return (
    <div className="grid aspect-[4/5] place-items-center rounded-[12px] bg-[var(--background-2)] p-4 text-center">
      <div>
        <svg
          aria-hidden
          className="mx-auto h-12 w-12 text-[#262626]"
          viewBox="0 0 48 48"
          fill="none"
        >
          <path
            d="M14 5h14l8 8v30H14V5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M28 5v9h8" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          <path
            d="M17 31h14M17 36h10M17 24h14"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <div className="mt-3 text-sm font-semibold text-[#262626]">PDF</div>
        <div className="mt-1 line-clamp-2 text-xs leading-[1.35] text-[#6b6b6b]">{fileName}</div>
      </div>
    </div>
  );
}

export default function DocumentUploadSlots({
  slots,
  ownerName,
}: DocumentUploadSlotsProps) {
  const initialFiles = useMemo<Array<SlotFile | null>>(
    () => Array.from({ length: slots }, () => null),
    [slots],
  );
  const [files, setFiles] = useState<Array<SlotFile | null>>(initialFiles);

  useEffect(() => {
    setFiles(initialFiles);
  }, [initialFiles]);

  useEffect(() => {
    return () => {
      files.forEach((file) => {
        if (file) URL.revokeObjectURL(file.url);
      });
    };
  }, [files]);

  const updateFile = (index: number, file: File | undefined) => {
    if (!file) return;

    const nextFile: SlotFile = {
      name: file.name,
      type: file.type,
      url: URL.createObjectURL(file),
    };

    setFiles((current) => {
      const next = [...current];
      const previous = next[index];
      if (previous) URL.revokeObjectURL(previous.url);
      next[index] = nextFile;
      return next;
    });
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {files.map((file, index) => {
        const inputId = `teacher-document-${index}`;
        const isImage = file?.type.startsWith("image/");

        return (
          <label
            key={inputId}
            htmlFor={inputId}
            aria-label={`Загрузить документ ${index + 1} для ${ownerName}`}
            className="card-block block cursor-pointer bg-white p-3 transition hover:-translate-y-1 sm:p-4"
          >
            <input
              id={inputId}
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(event) => updateFile(index, event.currentTarget.files?.[0])}
            />

            {file ? (
              <>
                {isImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={file.url}
                    alt={`Документ ${index + 1}: ${file.name}`}
                    className="aspect-[4/5] w-full rounded-[12px] object-cover"
                  />
                ) : (
                  <PdfPreview fileName={file.name} />
                )}
                <div className="mt-3 text-xs leading-[1.5] text-[#6b6b6b]">
                  Нажмите, чтобы заменить документ
                </div>
              </>
            ) : (
              <div className="grid aspect-[4/5] place-items-center rounded-[12px] border border-dashed border-[rgba(0,0,0,0.14)] bg-[var(--background-2)] p-5 text-center">
                <div>
                  <svg
                    aria-hidden
                    className="mx-auto h-10 w-10 text-[#262626]"
                    viewBox="0 0 48 48"
                    fill="none"
                  >
                    <path
                      d="M24 33V13M24 13l-7 7M24 13l7 7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 34v4a4 4 0 0 0 4 4h16a4 4 0 0 0 4-4v-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="mt-4 text-sm font-semibold text-[#262626]">
                    Загрузить документ
                  </div>
                  <div className="mt-2 text-xs leading-[1.45] text-[#6b6b6b]">
                    Диплом, сертификат или PDF-файл
                  </div>
                </div>
              </div>
            )}
          </label>
        );
      })}
    </div>
  );
}
