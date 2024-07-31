import multer from 'multer';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/');
  },
  filename: (req, file, cb) => {
    cb(null, "" + Date.now() + "--" + file.originalname);
  },
});

const upload = multer({ storage }).fields([
  { name: 'profile_image'},
  { name: 'image'},
  {name: 'resume_files'},
  {name: "recent_photos"},
  {name: "thumbnail"},
  {name: "postImage"},
  {name: "workplace_photos"}
]);

export const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

