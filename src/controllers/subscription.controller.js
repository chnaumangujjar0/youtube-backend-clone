import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const toggleSubscription = asyncHandler(async (req, res) =>{
    const {channelId} = req.params
    const existingSubscription = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    })

    if(existingSubscription){
        await Subscription.deleteOne(
            {
            _id: existingSubscription._id
            }
        )

        return res.status(200).json(
        new ApiResponse(
            200,
            {},
            "unsubscribed successfully"
        )
    )
    }
    
    const subcribe = await Subscription.create(
        {
            subscriber:  req.user._id ,
            channel: channelId
        }
    )
    if(!subcribe){
        throw new ApiError(401, " channel is not subscribed")
    }
    
    return res.status(200).json(
        new ApiResponse(
            200,
            {
                subcribe
            },
            "subscribed successfully"
        )
    )
})

export {toggleSubscription}