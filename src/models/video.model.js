import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema({
videoFile:{
    type:String, // cloudinary url
    required:true
},
thumbnail:{
    type:String, // cloudinary url
    required:true 
},
title:{
    type:String, 
    required:true
},
description:{
    type:String, 
    required:true
},
duration:{
    type:Number, // duration comes from cloudinary 
    required:true
},
views:{
    type:Number,
    default:0
},
isPublished:{
    type:Boolean,
    default:true
},
// yaha owner mein us user ki details aayegi jisne video upload ki hai toh hume connect karana hoga User schema se
owner:{
    type:Schema.Types.ObjectId,
    ref:"User"
}

},{timestamps:true})


// ab hum mongodb mein aggregation queries bhi likh sakte hai
// toh yeh aggregation pehle mongoose mein nahi tha pehle hum keval simple queries hi likh sakte the yeh aggregation wali functionality baad mein add hui
// isliye hum plugin ka use kar rahe hai toh plugin ka use karke hum khud ke plugin bhi add kar sakte hai 
videoSchema.plugin(mongooseAggregatePaginate)

// yaha humne bola moongoose ek model bana do "Video" naam ka jo videoSchema par based hoga aur isse export bhi kar do
export const Video = mongoose.model("Video",videoSchema)