"use client";

import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { ImagePlus, LoaderCircle, Trash2, Upload } from "lucide-react";
import { withMutationToast } from "@/lib/mutation-toast";

type ImageUploadInputProps = {
  value: string;
  onChange: (imageUrl: string | null) => void;
  disabled?: boolean;
};

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

function getErrorMessage(value: unknown, fallback: string) {
  if (typeof value !== "object" || value === null) return fallback;

  const result = value as Record<string, unknown>;
  if (typeof result.message === "string") return result.message;
  if (typeof result.errorMessage === "string") return result.errorMessage;
  if (typeof result.error === "object" && result.error !== null) {
    const error = result.error as Record<string, unknown>;
    if (typeof error.message === "string") return error.message;
  }
  return fallback;
}

export default function ImageUploadInput({
  value,
  onChange,
  disabled = false,
}: ImageUploadInputProps) {
  const inputId = useId();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const uploadImage = async (file: File) => {
    setErrorMessage("");

    if (!acceptedTypes.includes(file.type)) {
      setErrorMessage("Choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > maxFileSize) {
      setErrorMessage("Image must be 5 MB or smaller.");
      return;
    }

    setIsUploading(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim();
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim();
      if (!cloudName || !uploadPreset) {
        throw new Error(
          "Configure NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET to upload profile images.",
        );
      }

      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", uploadPreset);

      const imageUrl = await withMutationToast(
        {
          loading: "Uploading image…",
          success: "Image uploaded.",
          error: "Unable to upload the image.",
        },
        async () => {
          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${encodeURIComponent(cloudName)}/image/upload`,
            {
              method: "POST",
              body,
            },
          );
          const responseText = await response.text();
          let result: unknown;
          try {
            result = JSON.parse(responseText);
          } catch {
            result = null;
          }
          if (!response.ok) {
            throw new Error(
              response.headers.get("X-Cld-Error")?.trim() ||
                getErrorMessage(
                  result,
                  `Cloudinary upload failed (${response.status}). Please check the upload preset configuration.`,
                ),
            );
          }
          if (
            typeof result !== "object" ||
            result === null ||
            !("secure_url" in result) ||
            typeof result.secure_url !== "string"
          ) {
            throw new Error("Cloudinary returned an invalid image URL.");
          }
          return result.secure_url;
        },
      );
      onChange(imageUrl);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to upload the image. Please try again.",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.currentTarget.files?.[0];
    if (file) void uploadImage(file);
    event.currentTarget.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file && !disabled && !isUploading) void uploadImage(file);
  };

  return (
    <div>
      <label
        htmlFor={inputId}
        onDragEnter={(event) => {
          event.preventDefault();
          if (!disabled && !isUploading) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 py-6 text-center transition ${
          isDragging
            ? "border-blue-500 bg-blue-50"
            : "border-slate-200 bg-slate-50/70 hover:border-blue-300 hover:bg-blue-50/50"
        } ${disabled || isUploading ? "pointer-events-none opacity-60" : ""}`}
      >
        <input
          id={inputId}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="sr-only"
        />
        <span className="mb-3 flex size-10 items-center justify-center rounded-full bg-white text-blue-700 shadow-sm">
          {isUploading ? (
            <LoaderCircle className="size-5 animate-spin" aria-hidden="true" />
          ) : value ? (
            <ImagePlus className="size-5" aria-hidden="true" />
          ) : (
            <Upload className="size-5" aria-hidden="true" />
          )}
        </span>
        <span className="text-sm font-semibold text-slate-800">
          {isUploading
            ? "Uploading image..."
            : "Drag and drop an image, or browse"}
        </span>
        <span className="mt-1 text-xs text-slate-500">
          JPEG, PNG, or WebP · 5 MB max
        </span>
      </label>

      {value && (
        <div className="mt-3 flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2">
          <p className="truncate text-xs text-slate-500">{value}</p>
          <button
            type="button"
            onClick={() => {
              setErrorMessage("");
              onChange(null);
            }}
            disabled={disabled || isUploading}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Remove
          </button>
        </div>
      )}

      {errorMessage && (
        <p className="mt-2 text-xs leading-5 text-red-600" role="alert">
          {errorMessage}
        </p>
      )}
    </div>
  );
}
