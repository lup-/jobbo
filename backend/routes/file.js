module.exports = {
    async resume(ctx, next) {
        let uploadedFile = ctx.req.file;
        let file = {
            id: uploadedFile.filename,
            name: uploadedFile.originalname,
            type: uploadedFile.mimetype,
            size: uploadedFile.size,
            link: uploadedFile.path,
        }
        ctx.body = {file};
        return next();
    }
}