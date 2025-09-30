import { useCallback } from "react";
import { type ChangeEvent, useState } from "react";
import { useClipboardPaste } from "./use-clipboard-paste";

const parseSvgFile = (content: string, fileName: string) => {
  const parser = new DOMParser();
  const svgDoc = parser.parseFromString(content, "image/svg+xml");
  const svgElement = svgDoc.documentElement;
  const width = parseInt(svgElement.getAttribute("width") ?? "300");
  const height = parseInt(svgElement.getAttribute("height") ?? "150");

  // Convert SVG content to a data URL
  const svgBlob = new Blob([content], { type: "image/svg+xml" });
  const svgUrl = URL.createObjectURL(svgBlob);

  return {
    content: svgUrl,
    metadata: {
      width,
      height,
      name: fileName,
    },
  };
};

const parseImageFile = (
  content: string,
  fileName: string,
): Promise<{
  content: string;
  metadata: { width: number; height: number; name: string };
}> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        content,
        metadata: {
          width: img.width,
          height: img.height,
          name: fileName,
        },
      });
    };
    img.src = content;
  });
};

export type FileUploaderResult = {
  /** The processed image content as a data URL (for regular images) or object URL (for SVGs) */
  imageContent: string;
  /** The raw file content as a string */
  rawContent: string;
  /** Metadata about the uploaded image including dimensions and filename */
  imageMetadata: {
    width: number;
    height: number;
    name: string;
  } | null;
  /** Handler for file input change events */
  handleFileUpload: (file: File) => void;
  handleFileUploadEvent: (event: ChangeEvent<HTMLInputElement>) => void;
  /** Handler for fetching SVG from URL */
  handleUrlFetch: (url: string) => Promise<void>;
  /** Loading state for URL fetching */
  isUrlFetching: boolean;
  /** Error message for URL fetching */
  urlFetchError: string | null;
  /** Resets the upload state */
  cancel: () => void;
};

/**
 * A hook for handling file uploads, particularly images and SVGs
 * @returns {FileUploaderResult} An object containing:
 * - imageContent: Use this as the src for an img tag
 * - rawContent: The raw file content as a string (useful for SVG tags)
 * - imageMetadata: Width, height, and name of the image
 * - handleFileUpload: Function to handle file input change events
 * - handleUrlFetch: Function to fetch SVG from URL
 * - isUrlFetching: Loading state for URL fetching
 * - urlFetchError: Error message if URL fetch fails
 * - cancel: Function to reset the upload state
 */
export const useFileUploader = (): FileUploaderResult => {
  const [imageContent, setImageContent] = useState<string>("");
  const [rawContent, setRawContent] = useState<string>("");
  const [imageMetadata, setImageMetadata] = useState<{
    width: number;
    height: number;
    name: string;
  } | null>(null);

  const [isUrlFetching, setIsUrlFetching] = useState(false);
  const [urlFetchError, setUrlFetchError] = useState<string | null>(null);



  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      setRawContent(content);

      if (file.type === "image/svg+xml") {
        const { content: svgContent, metadata } = parseSvgFile(
          content,
          file.name,
        );
        setImageContent(svgContent);
        setImageMetadata(metadata);
      } else {
        const { content: imgContent, metadata } = await parseImageFile(
          content,
          file.name,
        );
        setImageContent(imgContent);
        setImageMetadata(metadata);
      }
    };

    if (file.type === "image/svg+xml") {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }
  };

  const handleFileUploadEvent = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFilePaste = useCallback((file: File) => {
    processFile(file);
  }, []);

  useClipboardPaste({
    onPaste: handleFilePaste,
    acceptedFileTypes: ["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"],
  });

  const handleUrlFetch = async (url: string) => {
    setIsUrlFetching(true);
    setUrlFetchError(null);

    try {
      const response = await fetch("/api/fetch-svg", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        setUrlFetchError(data.error || "Failed to fetch SVG");
        return;
      }

      const urlObj = new URL(url);
      const pathname = urlObj.pathname;
      const fileName = pathname.split("/").pop() || "fetched-svg.svg";

      setRawContent(data.content);

      const { content: svgContent, metadata } = parseSvgFile(
        data.content,
        fileName,
      );

      setImageContent(svgContent);
      setImageMetadata(metadata);
    } catch (error) {
      console.error("Error fetching SVG:", error);
      setUrlFetchError("An error occurred while fetching the SVG");
    }finally {
      setIsUrlFetching(false);
    }
  }

  const cancel = () => {
    setImageContent("");
    setImageMetadata(null);
    setUrlFetchError(null);
  };

  return {
     imageContent,
    rawContent,
    imageMetadata,
    handleFileUpload: processFile,
    handleFileUploadEvent,
    handleUrlFetch,
    isUrlFetching,
    urlFetchError,
    cancel,
  };
};
