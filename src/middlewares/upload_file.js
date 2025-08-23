const multer = require('multer');

const storage = multer.memoryStorage(); // bisa juga diskStorage kalau mau

const upload = multer({ storage });

module.exports = upload;
