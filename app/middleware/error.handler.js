exports.errorHandler = async(err,req,res,next) => {
    if(err.message === 'Only video and image files in the following format are allowed: MP4, MOV, AVI, 3GP, MPEG'){
        return res.status(500).json({ success:false, error: true, message: `${err.message}` });
    }
    res.sendStatus(err.status || 500);
};
