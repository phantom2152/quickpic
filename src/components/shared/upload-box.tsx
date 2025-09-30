import React, { useState } from "react";

interface UploadBoxProps {
  title: string;
  subtitle?: string;
  description: string;
  accept: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlFetch?: (url: string) => Promise<void>;
  isUrlFetching?: boolean;
  urlFetchError?: string | null;
}

export function UploadBox({
  title,
  subtitle,
  description,
  accept,
  onChange,
  onUrlFetch,
  isUrlFetching = false,
  urlFetchError = null,
}: UploadBoxProps) {
  const [url, setUrl] = useState("");

  const handleFetchClick = async () => {
    if (!url.trim() || !onUrlFetch) return;
    await onUrlFetch(url.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !isUrlFetching) {
      void handleFetchClick();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <div className="flex flex-col items-center gap-2">
        <p className="text-center text-white">{title}</p>
        {subtitle && (
          <p className="inline-block rounded-full border border-white/30 bg-white/5 px-2 py-0.5 text-center text-sm text-white/60">
            {subtitle}
          </p>
        )}
      </div>

      {/* File Upload Box */}
      <div className="flex w-72 flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed border-white/30 bg-white/10 p-6 backdrop-blur-sm">
        <svg
          className="h-8 w-8 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <p className="text-sm text-gray-400">Drag and Drop</p>
        <p className="text-sm text-gray-500">or</p>
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white shadow-md transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75">
          <span>{description}</span>
          <input
            type="file"
            onChange={onChange}
            accept={accept}
            className="hidden"
          />
        </label>
      </div>

      {/* URL Fetch Section */}
      {onUrlFetch && (
        <div className="flex w-72 flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-white/20" />
            <span className="text-xs text-white/40">OR</span>
            <div className="h-px flex-1 bg-white/20" />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste SVG URL here..."
                disabled={isUrlFetching}
                className="flex-1 rounded-lg border border-white/20 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 transition-colors focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <button
                onClick={handleFetchClick}
                disabled={!url.trim() || isUrlFetching}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-md transition-colors duration-200 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-75 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isUrlFetching ? (
                  <svg
                    className="h-5 w-5 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                ) : (
                  "Fetch"
                )}
              </button>
            </div>

            {/* Error Message */}
            {urlFetchError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {urlFetchError}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}