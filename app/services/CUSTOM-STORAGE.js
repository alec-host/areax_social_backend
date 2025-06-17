module.exports.uploadImageToCustomStorage = async(filename) => {
    const imageUrl = `https://api.projectw.ai/image-storage/${filename}`;

    return imageUrl;
};
