// src/app/api/fetch-svg/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body as { url?: string };

    // Validate URL is provided
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "URL is required" },
        { status: 400 }
      );
    }

    // Validate URL format
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
    } catch {
      return NextResponse.json(
        { error: "Invalid URL format" },
        { status: 400 }
      );
    }

    // Only allow http and https protocols
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      return NextResponse.json(
        { error: "Only HTTP and HTTPS URLs are allowed" },
        { status: 400 }
      );
    }

    // Fetch the SVG from the URL
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "User-Agent": "QuickPic-SVG-Fetcher/1.0",
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch: ${response.status} ${response.statusText}` },
        { status: 502 }
      );
    }

    let fileName = parsedUrl.pathname.split("/").pop() || "fetched-svg.svg";
    const cd = response.headers.get("content-disposition") || "";
    // match filename*=UTF-8''... or filename="..."
    const fnStarMatch = cd.match(/filename\*\s*=\s*UTF-8''([^;]+)/i);
    const fnMatch = cd.match(/filename\s*=\s*"([^"]+)"/i);
    if (fnStarMatch && fnStarMatch?.length >=2 && typeof(fnStarMatch[1]) === "string") {
      try {
        fileName = decodeURIComponent(fnStarMatch[1]);
      } catch {}
    } else if (fnMatch && fnMatch?.length >=2 && typeof(fnMatch[1]) === "string") {
      fileName = fnMatch[1];
    }

    // Check content type
    const contentType = response.headers.get("content-type") || "";
    const isSvg =
      contentType.includes("image/svg+xml") ||
      contentType.includes("text/xml") ||
      contentType.includes("application/xml") ||
      contentType.includes("text/plain"); // Some servers serve SVGs as plain text

    if (!isSvg) {
      // Still try to validate by content if content-type is not helpful
      const text = await response.text();
      if (!text.trim().startsWith("<svg") && !text.includes("<svg")) {
        return NextResponse.json(
          { error: "URL does not point to a valid SVG file" },
          { status: 400 }
        );
      }
      // If content looks like SVG, proceed
      return NextResponse.json({
        content: text,
        contentType: "image/svg+xml",
      });
    }

    // Get the SVG content
    const svgContent = await response.text();

    // Basic validation that it's actually SVG content
    if (!svgContent.trim().startsWith("<svg") && !svgContent.includes("<svg")) {
      return NextResponse.json(
        { error: "Content is not a valid SVG" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      content: svgContent,
      contentType: contentType,
      fileName
    });
  } catch (error) {
    console.error("Error fetching SVG:", error);
    return NextResponse.json(
      { error: "An error occurred while fetching the SVG" },
      { status: 500 }
    );
  }
}