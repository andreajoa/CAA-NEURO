import { NextResponse } from "next/server";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getPranchaStripe, isPaidPranchaSession } from "../../../../../lib/pranchaStripe";

export const runtime = "nodejs";

const ZIP_FILENAME = "complete-com-a-silaba-margareth-almeida.zip";

export async function GET(request) {
  const sessionId = new URL(request.url).searchParams.get("session_id") || "";

  if (!sessionId.startsWith("cs_") || sessionId.length > 200) {
    return NextResponse.json({ error: "Compra inválida." }, { status: 400 });
  }

  try {
    const stripe = getPranchaStripe();
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!isPaidPranchaSession(session)) {
      return NextResponse.json({ error: "Pagamento ainda não confirmado." }, { status: 403 });
    }

    // If an external download URL is configured, redirect to it
    const externalUrl = process.env.PRANCHA_DOWNLOAD_URL;
    if (externalUrl && externalUrl.startsWith("https://")) {
      return NextResponse.redirect(externalUrl, {
        status: 303,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
          "Referrer-Policy": "no-referrer",
        },
      });
    }

    // Serve the file directly from the local filesystem
    const filePath = join(process.cwd(), "private", "prancha-material", ZIP_FILENAME);
    const fileBuffer = await readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${ZIP_FILENAME}"`,
        "Content-Length": String(fileBuffer.length),
        "Cache-Control": "private, no-store, max-age=0",
        "Referrer-Policy": "no-referrer",
      },
    });
  } catch (error) {
    console.error("PRANCHA DOWNLOAD ERROR", {
      type: error?.type,
      code: error?.code,
      message: error?.message,
    });
    return NextResponse.json({ error: "Não foi possível validar a compra." }, { status: 500 });
  }
}
