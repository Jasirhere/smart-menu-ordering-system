"use client";

import { FormEvent, useState } from "react";
import {
  CheckCircle2,
  Download,
  LoaderCircle,
  Printer,
  QrCode,
  Table2,
} from "lucide-react";
import QRCode from "qrcode";

import { createClient } from "@/lib/supabase/client";

type CreatedTable = {
  id: string;
  table_number: number;
  public_token: string;
  is_active: boolean;
  created_at: string;
};

type TableQrGeneratorProps = {
  onTableCreated: () => void;
};

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Unable to load QR image."));
    image.src = source;
  });
}

export default function TableQrGenerator({
  onTableCreated,
}: TableQrGeneratorProps) {
  const [tableNumber, setTableNumber] = useState("");
  const [createdTable, setCreatedTable] = useState<CreatedTable | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState("");
  const [customerUrl, setCustomerUrl] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage("");
    setCreatedTable(null);
    setQrDataUrl("");
    setCustomerUrl("");
    setIsLoading(true);

    try {
      const parsedTableNumber = Number(tableNumber);

      if (
        !Number.isInteger(parsedTableNumber) ||
        parsedTableNumber < 1 ||
        parsedTableNumber > 999
      ) {
        throw new Error("Enter a valid table number between 1 and 999.");
      }

      const supabase = createClient();

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        throw new Error("Your login session has expired. Please sign in again.");
      }

      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

      if (!apiBaseUrl) {
        throw new Error("Backend API URL is not configured.");
      }

      const response = await fetch(`${apiBaseUrl}/admin/tables`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          table_number: parsedTableNumber,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.detail ?? "Unable to create table.");
      }

      const table = responseData as CreatedTable;

      const generatedCustomerUrl =
        `${window.location.origin}/t/${table.public_token}`;

      const generatedQrDataUrl = await QRCode.toDataURL(
        generatedCustomerUrl,
        {
          width: 520,
          margin: 2,
          errorCorrectionLevel: "H",
          color: {
            dark: "#1b1c1c",
            light: "#ffffff",
          },
        },
      );

      setCreatedTable(table);
      setCustomerUrl(generatedCustomerUrl);
      setQrDataUrl(generatedQrDataUrl);
      setTableNumber("");
      onTableCreated();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function downloadQrCard() {
    if (!createdTable || !qrDataUrl) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 900;
    canvas.height = 1200;

    const context = canvas.getContext("2d");

    if (!context) {
      setErrorMessage("Unable to create QR image.");
      return;
    }

    context.fillStyle = "#fcf9f8";
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.fillStyle = "#855300";
    context.font = "bold 64px Georgia";
    context.textAlign = "center";
    context.fillText("TableMind", 450, 115);

    context.fillStyle = "#5f5e5a";
    context.font = "28px Arial";
    context.fillText("The Bistro Downtown", 450, 165);

    context.fillStyle = "#ffffff";
    context.strokeStyle = "#d8c3ae";
    context.lineWidth = 3;

    context.beginPath();
    context.roundRect(90, 215, 720, 850, 38);
    context.fill();
    context.stroke();

    const qrImage = await loadImage(qrDataUrl);

    context.drawImage(qrImage, 190, 285, 520, 520);

    context.fillStyle = "#1b1c1c";
    context.font = "bold 76px Georgia";
    context.fillText(
      `Table ${createdTable.table_number}`,
      450,
      915,
    );

    context.fillStyle = "#5f5e5a";
    context.font = "30px Arial";
    context.fillText("Scan to view the menu", 450, 975);

    context.fillStyle = "#855300";
    context.font = "bold 22px Arial";
    context.fillText("SCAN • ORDER • ENJOY", 450, 1025);

    const downloadLink = document.createElement("a");

    downloadLink.href = canvas.toDataURL("image/png");
    downloadLink.download =
      `tablemind-table-${createdTable.table_number}.png`;

    downloadLink.click();
  }

  function printQrCard() {
    if (!createdTable || !qrDataUrl) {
      return;
    }

    const printWindow = window.open(
      "",
      "_blank",
      "width=700,height=900",
    );

    if (!printWindow) {
      setErrorMessage("Allow pop-ups to print the QR code.");
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <title>Table ${createdTable.table_number} QR Code</title>

          <style>
            @page {
              size: A5 portrait;
              margin: 12mm;
            }

            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              background: #fcf9f8;
              font-family: Arial, sans-serif;
              color: #1b1c1c;
            }

            .card {
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              border: 2px solid #d8c3ae;
              border-radius: 28px;
              padding: 40px;
              background: white;
            }

            .brand {
              margin: 0;
              font-family: Georgia, serif;
              font-size: 42px;
              color: #855300;
            }

            .restaurant {
              margin: 8px 0 32px;
              color: #5f5e5a;
            }

            img {
              width: 320px;
              height: 320px;
            }

            .table {
              margin: 28px 0 10px;
              font-family: Georgia, serif;
              font-size: 48px;
            }

            .instruction {
              color: #5f5e5a;
              font-size: 18px;
            }

            .footer {
              margin-top: 28px;
              color: #855300;
              font-weight: bold;
              letter-spacing: 3px;
              font-size: 12px;
            }
          </style>
        </head>

        <body>
          <div class="card">
            <h1 class="brand">TableMind</h1>
            <p class="restaurant">The Bistro Downtown</p>

            <img
              src="${qrDataUrl}"
              alt="QR code for Table ${createdTable.table_number}"
            />

            <h2 class="table">Table ${createdTable.table_number}</h2>
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
      {/* Generator form */}
      <article className="rounded-2xl border border-[#d8c3ae] bg-white p-6 shadow-sm">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#ffddb8] text-[#855300]">
          <QrCode size={23} />
        </div>

        <h2 className="font-heading mt-6 text-2xl font-semibold">
          Generate Table QR
        </h2>

        <p className="mt-2 text-sm leading-6 text-[#5f5e5a]">
          Enter a table number to create its secure, printable QR card.
        </p>

        <form onSubmit={handleSubmit} className="mt-7">
          <label
            htmlFor="tableNumber"
            className="mb-2 block text-sm font-semibold"
          >
            Table number
          </label>

          <div className="flex items-center gap-3 rounded-xl border border-[#d8c3ae] bg-[#fcf9f8] px-4 focus-within:border-[#855300]">
            <Table2 size={18} className="text-[#5f5e5a]" />

            <input
              id="tableNumber"
              type="number"
              min="1"
              max="999"
              required
              value={tableNumber}
              onChange={(event) => setTableNumber(event.target.value)}
              placeholder="For example: 13"
              className="w-full bg-transparent py-3.5 text-sm outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#855300] px-5 py-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <LoaderCircle size={18} className="animate-spin" />
                Creating table...
              </>
            ) : (
              <>
                <QrCode size={18} />
                Generate QR Code
              </>
            )}
          </button>
        </form>

        {errorMessage && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        {createdTable && (
          <div className="mt-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-semibold text-green-800">
            <CheckCircle2 size={18} />
            Table {createdTable.table_number} created successfully
          </div>
        )}
      </article>

      {/* QR preview */}
      <article className="flex min-h-[520px] items-center justify-center rounded-2xl border border-dashed border-[#d8c3ae] bg-white/60 p-8">
        {!createdTable || !qrDataUrl ? (
          <div className="max-w-sm text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f0eded] text-[#855300]">
              <QrCode size={30} />
            </div>

            <h2 className="font-heading mt-6 text-2xl font-semibold">
              Your QR card will appear here
            </h2>

            <p className="mt-3 text-sm leading-6 text-[#5f5e5a]">
              Create a table to preview, download and print its QR code.
            </p>
          </div>
        ) : (
          <div className="w-full max-w-sm">
            <div className="rounded-[2rem] border border-[#d8c3ae] bg-white p-7 text-center shadow-xl">
              <h2 className="font-heading text-3xl font-bold text-[#855300]">
                TableMind
              </h2>

              <p className="mt-1 text-sm text-[#5f5e5a]">
                The Bistro Downtown
              </p>

              <img
                src={qrDataUrl}
                alt={`QR code for Table ${createdTable.table_number}`}
                className="mx-auto mt-6 w-full max-w-[260px]"
              />

              <p className="font-heading mt-5 text-4xl font-bold">
                Table {createdTable.table_number}
              </p>

              <p className="mt-2 text-sm text-[#5f5e5a]">
                Scan to view the menu
              </p>

              <p className="mt-5 text-xs font-bold tracking-[0.2em] text-[#855300]">
                SCAN • ORDER • ENJOY
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={downloadQrCard}
                className="flex items-center justify-center gap-2 rounded-xl bg-[#855300] px-4 py-3 text-sm font-semibold text-white"
              >
                <Download size={17} />
                Download PNG
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

            <p className="mt-4 break-all text-center text-xs text-[#5f5e5a]">
              {customerUrl}
            </p>
          </div>
        )}
      </article>
    </>
  );
}