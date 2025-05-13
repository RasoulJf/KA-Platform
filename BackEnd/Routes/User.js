import express from 'express';
import { uploadUsers } from '../Controllers/UserCn.js';
import upload from '../Utils/uploadFile.js';

const userRouter = express.Router();

// In your route handler
userRouter.route("").post((req, res) => {
    upload.single('file')(req, res, function(err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res.status(400).json({ error: err.message });
      } else if (err) {
        // An unknown error occurred
        return res.status(500).json({ error: err.message });
      }
      // Everything went fine
      next();
    });
  }, uploadUsers);

export default userRouter;