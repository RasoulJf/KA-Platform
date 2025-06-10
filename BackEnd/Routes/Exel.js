import express from 'express';
import multer from 'multer';
import { createActivitiesFromExcel,createRewardsFromExcel, registerFromExcel } from '../Controllers/ExelCn.js';

const exelRouter = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

exelRouter.post('/register', upload.single('excelFile'), registerFromExcel);

exelRouter.post('/activity', upload.single('excelFile'),  createActivitiesFromExcel);

exelRouter.post('/reward', upload.single('excelFile'),  createRewardsFromExcel);



export default exelRouter;