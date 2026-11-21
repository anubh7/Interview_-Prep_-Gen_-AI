const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(), // Store files in memory
    limits: {
        fileSize: 3 * 1024 * 1024 // Limit file size to 3MB
    }
});

module.exports = upload;