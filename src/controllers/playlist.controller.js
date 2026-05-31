import mongoose,{isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body

    if(!(name || description)){
        throw new ApiError(400,"title and description is required")
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id
    })
    
    if(!playlist){
        throw new ApiError(401,"playlist creation")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "playlist created successfully!"
        )
    )
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "invalid user id")
    }
    const playlists = await Playlist.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $project: {
                _id: 1,
                name: 1,
                description: 1,
                videos: 1,
                createdAt: 1
            }
        }
    ])
    
    if(!playlists){
        throw new ApiError(400, "error in fetching playlist")
    }
    
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            playlists,
            "Playlists fetched successfully!"
        )
    )
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "invalid object id ")
    }

    const playlist = await Playlist.findById(playlistId)
    console.log(playlist)

    if(!playlist){
        throw new ApiError(400, "this playlist does not exist")
    }

    return res
    .status(200)
    .json(
       new ApiResponse(
        200,
        playlist,
        "playlist fetched successfully!"
       )
    )
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(playlistId || videoId)){
        throw new ApiError(400, "playlist id and videoid is required")
    }

    const video = await Playlist.findByIdAndUpdate(
        playlistId, 
        {
            $addToSet: {
                videos: videoId
            }
        },
        { returnDocument : "after" }
    )

    if(!video){
        throw new ApiError(400,"video is not added to playlist")
    }
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            video,
            "video added successfully!"
        )
    )

})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params

    if(!(playlistId || videoId)){
        throw new ApiError(400, "playlist id and videoid is required")
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull: {
                videos: videoId
            }
        },
        {
            new: true
        }
    );

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            playlist,
            "video deleted fron playlist successfully!"
        )
    )
})

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    await Playlist.deleteOne({
        _id: new mongoose.Types.ObjectId(playlistId)
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "Playlist deleted successfully"
        )
    );
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
   
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist id");
    }

    if(!(name && description)){
        throw new ApiError(400,)
    }
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }

    if (playlist.owner.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "Unauthorized");
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $set: {
                name,
                description 
            }
        },
        {
            returnDocument: "after"
        }
    )

    return res
    .status(200)
    .json(
       new ApiResponse(
        200,
        updatedPlaylist,
        "playlist updated successfully!"
    )
    )
})

export {
    createPlaylist, 
    getUserPlaylists, 
    getPlaylistById, 
    addVideoToPlaylist, 
    removeVideoFromPlaylist, 
    deletePlaylist,
    updatePlaylist
}