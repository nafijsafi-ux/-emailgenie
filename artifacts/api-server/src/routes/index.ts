import { Router, type IRouter } from "express";
import healthRouter from "./health";
import emailRouter from "./email";
import shareRouter from "./share";

const router: IRouter = Router();

router.use(healthRouter);
router.use(emailRouter);
router.use(shareRouter);

export default router;
