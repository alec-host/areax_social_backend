const multer = require('multer');
const fs = require('fs');
const path = require('path');

function uploadStorage(opts) {
  const destination = opts.destination;
  return {
    _handleFile(req, file, cb) {
      // Ensure the destination directory exists
      fs.mkdirSync(destination, { recursive: true });

      // Create a custom filename
      const filename = Date.now() + '-' + file.originalname;
      const filePath = path.join(destination, filename);

      const outStream = fs.createWriteStream(filePath);

      file.stream.pipe(outStream);
      outStream.on('error', cb);
      outStream.on('finish', function () {
        cb(null, {
          path: filePath,
          size: outStream.bytesWritten,
          filename: filename,
        });
      });
    },
    _removeFile(req, file, cb) {
      fs.unlink(file.path, cb);
    },
  };
};

module.exports = uploadStorage;
