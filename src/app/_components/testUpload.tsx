// components/UploadView.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function UploadView() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file.");

    setUploading(true);

    const filePath = `uploads/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("thesisvault") // your bucket name
      .upload(filePath, file);
    console.log(data);
    if (error) {
      alert(`Upload failed: ${error.message}`);
    } else {
      const { data } = supabase.storage
        .from("thesisvault")
        .getPublicUrl(filePath);

      setPublicUrl(data.publicUrl);
    }

    setUploading(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />
      <button
        onClick={handleUpload}
        className="rounded bg-green-600 px-4 py-2 text-white"
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload File"}
      </button>

      {publicUrl && (
        <div className="mt-4">
          <p className="text-sm text-gray-700">Uploaded File:</p>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            {publicUrl}
          </a>
        </div>
      )}
    </div>
  );
}
