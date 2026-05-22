import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
    getVideoById,
    publishAVideo,
    updateVideoDetails
} from "../controllers/video.controller.js"

const router = Router();
//  router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/upload-video").post(upload.fields([
    {
        name: "videoFile",
        maxCount: 1
    },
    {
        name: "thumbnail",
        maxCount: 1
    }
]),verifyJwt, publishAVideo)

router.route("/:videoId").get(verifyJwt, getVideoById)
router.route("/:videoId").patch( verifyJwt, upload.single("thumbnail"),updateVideoDetails)

export default router;