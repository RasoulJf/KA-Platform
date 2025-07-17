// routes/notificationRoutes.js
import express from 'express';
import { getMyNotifications, markNotificationsAsRead } from '../Controllers/notificationCn.js';
import isLogin from '../Middlewares/isLogin.js';


const notifRouter = express.Router();

notifRouter.use(isLogin)

notifRouter.get('/', getMyNotifications);
notifRouter.patch('/mark-as-read', markNotificationsAsRead);

export default notifRouter;