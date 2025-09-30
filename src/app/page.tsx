// src/app/page.tsx

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col justify-between p-8 font-[family-name:var(--font-geist-sans)] sm:p-20">
      <main className="flex flex-grow flex-col items-center justify-center space-y-6">
        <p className="max-w-prose text-center text-white">
          This is a fork of{" "}
          <a
            href="https://quickpic.t3.gg/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Theo’s QuickPic
          </a>
          . If it looks familiar, that’s because it is! I pulled from the
          original repo (
          <a
            href="https://github.com/t3dotgg/quickpic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            github.com/t3dotgg/quickpic
          </a>
          ) and added one extra feature: you can now fetch SVGs directly by URL
          (no need to download before you upload).
        </p>

        <div className="flex flex-col items-start gap-3 text-lg">
          <Link
            href="/svg-to-png"
            className="text-blue-500 hover:underline"
          >
            • SVG → PNG converter (upload + URL fetch)
          </Link>
          <Link
            href="/square-image"
            className="text-blue-500 hover:underline"
          >
            • Square image generator
          </Link>
          <Link
            href="/rounded-border"
            className="text-blue-500 hover:underline"
          >
            • Corner rounder
          </Link>
        </div>
      </main>

      <footer className="mt-8 text-center text-sm text-gray-500">
        <a
          href="https://github.com/phantom2152/quickpic"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:underline"
        >
          View this fork on GitHub
        </a>
      </footer>
    </div>
  );
}