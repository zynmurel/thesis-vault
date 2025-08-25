import { supabase } from "@/utils/supabaseClient";

export const handleUploadSupabase = async (file: File) => {
  if (!file) throw new Error("Please select a file.");

  // Keep the extension safe
  const fileExt = file.name.split('.').pop();
  const sanitizedBase = sanitizeFilename(file.name.replace(/\.[^/.]+$/, ""));
  const filePath = `uploads/${Date.now()}-${sanitizedBase}.${fileExt}`;

  const { error } = await supabase.storage
      .from("thesisvault")
    .upload(filePath, file, {
      contentType: file.type, // Ensure Supabase knows it’s an image
    });

  if (error) throw new Error(error.message);

  const { data } = supabase.storage
      .from("thesisvault")
    .getPublicUrl(filePath);
  return data.publicUrl;
};

export function sanitizeFilename(filename: string) {
  return filename
    .replace(/\s+/g, "-") // replace spaces with hyphen
    .replace(/:/g, "") // remove colons
    .replace(/[^a-zA-Z0-9-_.]/g, ""); // remove other invalid characters if needed
}
