// routes/notificationRoutes.js
import express from 'express';
import { getMyNotifications, markAllAsRead, markNotificationsAsRead, markOneAsRead } from '../Controllers/notificationCn.js';
import isLogin from '../Middlewares/isLogin.js';


const notifRouter = express.Router();

notifRouter.use(isLogin)

notifRouter.get('/', getMyNotifications);
notifRouter.patch('/mark-as-read/:id', markOneAsRead);
notifRouter.patch('/mark-all-as-read', isLogin, markAllAsRead);
export default notifRouter;