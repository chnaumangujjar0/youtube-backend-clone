import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { 
    createTweet,
    deleteTweet,
    getUserTweets,
    updateTweet

 } from "../controllers/tweet.controller.js";

const router = Router();
router.use(verifyJwt); // Apply verifyJWT middleware to all routes in this file
router.route("/").post(createTweet)
router.route("/:userId").get(getUserTweets)
router.route("/update/:tweetId").patch(updateTweet)
router.route("/delete/:tweetId").delete(deleteTweet)
export default router