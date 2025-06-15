import { supabase } from "@/utils/supabaseClient";

export const handleUploadSupabase = async (file: File) => {
  if (!file) throw new Error("Please select a file.");

  const filePath = `uploads/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("thesisvault") // your bucket name
    .upload(filePath, file);
  if (error) {
    throw new Error(error.message);
  } else {
    const { data } = supabase.storage
      .from("thesisvault")
      .getPublicUrl(filePath);
    return data.publicUrl;
  }
};
