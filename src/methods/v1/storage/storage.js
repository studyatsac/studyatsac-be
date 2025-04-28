const supabase = require("../../../configs/supabase");

const uploadFile = async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const fileName = `${file.originalname}`;

  const { data, error } = await supabase.storage
    .from("my-uploads")
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: true,
    });

  if (error) {
    console.error("Upload error:", error);
    return res.status(500).json({ message: "Upload to storage failed" });
  }

  return res.json({ message: "File uploaded successfully", path: data.path });
};

module.exports = { uploadFile };
