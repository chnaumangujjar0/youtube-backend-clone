import { Router } from "express";
import { verifyJwt } from "../middlewares/auth.middleware.js";

const router = Router()

import { 
    addVideoToPlaylist,
    createPlaylist,
    deletePlaylist,
    getPlaylistById, 
    getUserPlaylists, 
    removeVideoFromPlaylist,
    updatePlaylist
} from "../controllers/playlist.controller.js";


router.route("/create").post(verifyJwt, createPlaylist)
router.route("/:userId").get(verifyJwt, getUserPlaylists)
router.route("/c/:playlistId").get(verifyJwt, getPlaylistById)
router.route("/add/:playlistId/:videoId").patch(verifyJwt, addVideoToPlaylist)
router.route("/remove/:playlistId/:videoId").patch(verifyJwt, removeVideoFromPlaylist)
router.route("/:playlistId").delete(verifyJwt, deletePlaylist)
router.route("/:playlistId").patch(verifyJwt, updatePlaylist)

export default router