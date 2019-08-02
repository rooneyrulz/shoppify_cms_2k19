import multer from 'multer';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads');
  },

  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

export default multer({
  storage,
  limits: {
    fileSize: 1024 * 1024 * 10,
  },
});
