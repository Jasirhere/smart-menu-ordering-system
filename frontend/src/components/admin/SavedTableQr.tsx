"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Download, LoaderCircle, Printer, QrCode, X } from "lucide-react";
import QRCode from "qrcode";

type SavedTableQrProps = {
  tableNumber: number;
  publicToken: string;
};

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load QR image."));
    image.src = source;
  });
}

export default function SavedTableQr({
  tableNumber,
  publicToken,
}: SavedTableQrProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const customerUrl =
    typeof window === "undefined"
      ? ""
      : `${window.location.origin}/t/${publicToken}`;

  async function openQr() {
    setIsOpen(true);
    setErrorMessage("");

    if (qrDataUrl) {
      return;
    }

    setIsLoading(true);

    try {
      const generatedQr = await QRCode.toDataURL(customerUrl, {
        width: 520,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#1b1c1c",
          light: "#ffffff",
        },
      });

      setQrDataUrl(generatedQr);
    } catch {
      setErrorMessage("Unable to generate QR code.");
    } finally {
      setIsLoading(false);
    }
  }

  async function downloadQrCard() {
    if (!qrDataUrl) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1100;

    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.fillStyle = "#fcf9f8";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#855300";
    context.textAlign = "center";
    context.font = "bold 64px Georgia";
    context.fillText("TableMind", 450, 100);

    context.fillStyle = "#5f5e5a";
    context.font = "28px Arial";
    context.fillText("The Bistro Downtown", 450, 150);

    context.fillStyle = "#ffffff";
    context.fillRect(100, 200, 700, 770);

    context.strokeStyle = "#d8c3ae";
    context.lineWidth = 3;
    context.strokeRect(100, 200, 700, 770);

    const qrImage = await loadImage(qrDataUrl);

    context.drawImage(qrImage, 190, 260, 520, 520);

    context.fillStyle = "#1b1c1c";
    context.font = "bold 72px Georgia";
    context.fillText(`Table ${tableNumber}`, 450, 875);

    context.fillStyle = "#5f5e5a";
    context.font = "28px Arial";
    context.fillText("Scan to view the menu", 450, 930);

    context.fillStyle = "#855300";
    context.font = "bold 20px Arial";
    context.fillText("SCAN • ORDER • ENJOY", 450, 975);

    const downloadLink = document.createElement("a");

    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download = `tablemind-table-${tableNumber}.png`;
    downloadLink.click();
  }

  function printQrCard() {
    if (!qrDataUrl) {
      return;
    }

    const printWindow = window.open("", "_blank", "width=700,height=900");

    if (!printWindow) {
      setErrorMessage("Allow pop-ups to print the QR card.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Table ${tableNumber} QR</title>

          <style>
            @page {
              size: A5 portrait;
              margin: 12mm;
            }

            body {
              margin: 0;
              background: #fcf9f8;
              color: #1b1c1c;
              font-family: Arial, sans-serif;
            }

            .card {
              min-height: 90vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              border: 2px solid #d8c3ae;
              border-radius: 28px;
              background: white;
              padding: 40px;
              text-align: center;
            }

            h1 {
              margin: 0;
              color: #855300;
              font-family: Georgia, serif;
              font-size: 42px;
            }

            .restaurant {
              color: #5f5e5a;
              margin: 8px 0 28px;
            }

            img {
              width: 320px;
              height: 320px;
            }

            h2 {
              margin: 25px 0 8px;
              font-family: Georgia, serif;
              font-size: 48px;
            }

            .instruction {
              color: #5f5e5a;
              font-size: 18px;
            }

            .footer {
              margin-top: 25px;
              color: #855300;
              font-size: 12px;
              font-weight: bold;
              letter-spacing: 3px;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <h1>TableMind</h1>
            <p class="restaurant">The Bistro Downtown</p>

            <img src="${qrDataUrl}" alt="Table ${tableNumber} QR code" />

            <h2>Table ${tableNumber}</h2>
            <p class="instruction">Scan to view the menu</p>
            <p class="footer">SCAN • ORDER • ENJOY</p>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }

  return (
    <>
      <button
        type="button"
        onClick={openQr}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#855300] px-4 py-3 text-sm font-semibold text-white"
      >
        <QrCode size={16} />
        View QR
      </button>

      {isMounted &&
        isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 p-3 backdrop-blur-sm sm:p-6"
            onClick={() => setIsOpen(false)}
          >
            <div
              className="relative my-auto max-h-[calc(100vh-1.5rem)] w-full max-w-[440px] overflow-y-auto rounded-[1.5rem] bg-[#fcf9f8] p-4 shadow-2xl sm:rounded-[2rem] sm:p-6"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 z-10 rounded-full bg-white p-2 text-[#5f5e5a] shadow sm:right-4 sm:top-4"
                aria-label="Close QR preview"
              >
                <X size={19} />
              </button>

              {isLoading ? (
                <div className="flex min-h-[420px] items-center justify-center">
                  <LoaderCircle
                    size={32}
                    className="animate-spin text-[#855300]"
                  />
                </div>
              ) : errorMessage ? (
                <p className="rounded-xl bg-red-50 p-4 text-red-700">
                  {errorMessage}
                </p>
              ) : (
                <>
                  <div className="rounded-[1.5rem] border border-[#d8c3ae] bg-white p-5 text-center sm:rounded-[1.75rem] sm:p-7">
                    <h2 className="font-heading text-3xl font-bold text-[#855300]">
                      TableMind
                    </h2>

                    <p className="mt-1 text-sm text-[#5f5e5a]">
                      The Bistro Downtown
                    </p>

                    <img
                      src={qrDataUrl}
                      alt={`QR code for Table ${tableNumber}`}
                      className="mx-auto mt-5 w-full max-w-[220px] sm:max-w-[260px]"
                    />

                    <p className="font-heading mt-4 text-3xl font-bold sm:text-4xl">
                      Table {tableNumber}
                    </p>

                    <p className="mt-2 text-sm text-[#5f5e5a]">
                      Scan to view the menu
                    </p>

                    <p className="mt-5 text-[10px] font-bold tracking-[0.16em] text-[#855300] sm:text-xs sm:tracking-[0.2em]">
                      SCAN • ORDER • ENJOY
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <button
                      type="button"
                      onClick={downloadQrCard}
                      className="flex items-center justify-center gap-2 rounded-xl bg-[#855300] px-4 py-3 text-sm font-semibold text-white"
                    >
                      <Download size={17} />
                      Download
                    </button>

                    <button
                      type="button"
                      onClick={printQrCard}
                      className="flex items-center justify-center gap-2 rounded-xl border border-[#d8c3ae] bg-white px-4 py-3 text-sm font-semibold text-[#855300]"
                    >
                      <Printer size={17} />
                      Print
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}