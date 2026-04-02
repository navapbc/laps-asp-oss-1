import Kernel from "@onkernel/sdk";
import { NextResponse } from "next/server";

const kernel = new Kernel({
  apiKey: process.env.KERNEL_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // Create a new browser session (non-headless for live view)
    const browser = await kernel.browsers.create({
      timeout_seconds: 300, // 5 minute timeout
      headless: false, // Required for live view
    });

    // Navigate to the URL using Playwright
    await kernel.browsers.playwright.execute(browser.session_id, {
      code: `await page.goto('${url}', { waitUntil: 'domcontentloaded' });`,
      timeout_sec: 60,
    });

    return NextResponse.json({
      sessionId: browser.session_id,
      liveViewUrl: browser.browser_live_view_url,
      cdpUrl: browser.cdp_ws_url,
    });
  } catch (error: any) {
    console.error("Kernel browser error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create browser session" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID is required" },
        { status: 400 }
      );
    }

    await kernel.browsers.deleteByID(sessionId);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Kernel browser delete error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete browser session" },
      { status: 500 }
    );
  }
}
