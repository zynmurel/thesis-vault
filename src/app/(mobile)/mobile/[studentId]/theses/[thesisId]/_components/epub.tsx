"use client";

import { useEffect, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import * as pdfjsLib from "pdfjs-dist";
import type { Theses } from "@prisma/client";
import { format } from "date-fns";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfFlipBookProps {
  pdfUrl: string;
  thesis: Theses;
}

const PdfFlipBook: React.FC<PdfFlipBookProps> = ({ pdfUrl, thesis }) => {
  const [pages, setPages] = useState<string[]>([]);
  const [bookSize, setBookSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateSize = () => {
      const screenWidth = window.innerWidth;
      const width = screenWidth - 10; // full screen width
      const height = width * 1.375; // maintain aspect ratio (same as 400x550 ratio)
      setBookSize({ width, height });
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    const loadPdf = async () => {
      const loadingTask = pdfjsLib.getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const renderedPages: string[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas = document.createElement("canvas");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvas, viewport }).promise;
        renderedPages.push(canvas.toDataURL());
      }

      setPages(["front", ...renderedPages, "back"]);
    };

    loadPdf();
  }, [pdfUrl]);

  if (pages.length === 0)
    return <p className="mt-4 text-center text-gray-500">Loading EPUB...</p>;

  const FlipBook = HTMLFlipBook as any;

  return (
    <div className="flex justify-center border">
      <FlipBook
        width={bookSize.width}
        height={bookSize.height}
        showCover={true}
        className="max-w-full rounded-lg shadow-xl"
      >
        {pages.map((page, index) => {
          const members = JSON.parse(thesis.members) as { name: string }[];
          if (page === "front") {
            return (
              <div
                key={index}
                className={`page page-cover contrast-75 ${thesis.courseCode === "BSIT" ? "bg-primary" : thesis.courseCode === "BSIS" ? "bg-red-600" : "bg-red-800"}`}
                data-density="hard"
              >
                <div className="page-content h-full">
                  <div className="flex h-full w-full flex-col items-center justify-between gap-10 px-5 py-10 text-[11px] text-amber-300">
                    <div className="flex flex-col gap-20">
                      <p className="text-center font-bold">{thesis.title}</p>
                      <div>
                        <p className="text-center font-semibold">
                          NORTHWEST SAMAR STATE UNIVERSITY
                        </p>
                        <p className="text-center">
                          Main Campus, Calbayog City
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-20">
                      <div className="flex flex-col gap-0">
                        <p className="text-center font-medium text-[10px] opacity-80">By</p>
                        {members.map((m, idx) => {
                          return (
                            <p key={idx} className="text-center font-medium text-[10px]">
                              {m.name}
                            </p>
                          );
                        })}
                      </div>
                      <p className="text-center font-bold uppercase text-[10px]">
                        {format(thesis.year, "MMM yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          } else if (page === "back") {
            return (
              <div
                key={index}
                className={`page page-cover ${thesis.courseCode === "BSIT" ? "bg-primary" : thesis.courseCode === "BSIS" ? "bg-red-500" : "bg-red-800"} contrast-75 brightness-80`}
                data-density="hard"
              >
                <div className="page-content flex h-full flex-col items-center justify-center px-5 py-8 text-[11px] text-amber-300">
                  {/* Decorative Border or Logo Section */}
                  <div className="flex flex-col items-center justify-center gap-4">
                    <p className="text-center font-bold tracking-widest">
                      THE END
                    </p>
                    <div className="h-[1px] w-20 bg-amber-300 opacity-70" />
                    <p className="text-center text-[10px] italic opacity-80">
                      © {format(thesis.year, "yyyy")} Northwest Samar State
                      University
                    </p>
                    <p className="text-center text-[10px] opacity-80">
                      All Rights Reserved
                    </p>
                  </div>

                  {/* Optional course identifier at the bottom */}
                  <div className="absolute bottom-4 flex w-full justify-center">
                    <p className="text-[9px] opacity-70">
                      {thesis.courseCode === "BSIT"
                        ? "Bachelor of Science in Information Technology"
                        : thesis.courseCode}
                    </p>
                  </div>
                </div>
              </div>
            );
          }
          return (
            <div
              key={index}
              className="page flex items-center justify-center bg-white"
            >
              <img
                src={page}
                alt={`page-${index + 1}`}
                className="h-full w-full object-contain"
              />
            </div>
          );
        })}
      </FlipBook>
    </div>
  );
};

export default PdfFlipBook;
