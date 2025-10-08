const axios = require('axios');
const path = require('path');
const mime = require('mime-types');

async function getImageMetadata(imageUrl) {
  try {
    const res = await axios.head(imageUrl);

    const contentLength = res.headers['content-length'];
    const contentType = res.headers['content-type'];

    const mime_type = contentType || mime.lookup(imageUrl);
    const file_size = contentLength ? parseInt(contentLength, 10) : null;
    const file_type = mime_type ? mime_type.split('/')[0] : null;

    // Guess filename from URL (best-effort)
    const urlPath = new URL(imageUrl).pathname;
    const file_name = path.basename(urlPath);
    const originalname = file_name;

    return {
      originalname,
      file_name,
      file_url: imageUrl,
      file_size,
      mime_type,
      file_type
    };
  } catch (err) {
    console.error('Failed to fetch image metadata:', err.message);
    return null;
  }
}

module.exports = { getImageMetadata };
