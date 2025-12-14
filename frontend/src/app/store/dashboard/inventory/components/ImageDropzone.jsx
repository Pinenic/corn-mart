"use client";
import { useState, useRef } from "react";

export default function ImageDropzone({ value, onChange, className = "" }) {
  const [preview, setPreview] = useState(value ? URL.createObjectURL(value) : null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef();

  const handleFiles = (fileList) => {
    const file = fileList?.[0];
    if (file) {
      setPreview(URL.createObjectURL(file));
      onChange?.(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === "dragover") setDragActive(true);
    if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`
        rounded-xl border-2 border-dashed p-4 cursor-pointer
        flex flex-col items-center justify-center text-center transition
        ${dragActive ? "border-blue-500 bg-blue-50" : "border-zinc-300 dark:border-zinc-700"}
        ${className}
      `}
    >
      {preview ? (
        <img
          src={preview}
          alt="preview"
          className="w-full h-40 object-contain rounded-lg"
        />
      ) : (
        <div className="text-zinc-500 dark:text-zinc-400 text-sm">
          <strong>Click to upload</strong> or drag & drop  
          <br />
          <span className="text-xs">JPG, PNG, WEBP</span>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
