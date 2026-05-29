import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js";


const router = Router()

router.route("/c/:channelId").post(verifyJwt, toggleSubscription)
router.route("/c/:channelId").get(verifyJwt, getUserChannelSubscribers)
router.route("/c/:channelId").get(verifyJwt, getUserChannelSubscribers)

export default router;