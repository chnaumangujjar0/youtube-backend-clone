import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

import { 
    addVideoToPlaylist,
    createPlaylist,
    getPlaylistById, 
    getUserPlaylists 
} from "../controllers/playlist.controller.js";


router.route("/create").post(verifyJwt, createPlaylist)
router.route("/:userId").get(verifyJwt, getUserPlaylists)
router.route("/c/:playlistId").get(verifyJwt, getPlaylistById)
router.route("/c/:playlistId/:videoId").patch(verifyJwt, addVideoToPlaylist)

export default router