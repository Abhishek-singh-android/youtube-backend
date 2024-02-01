import { Router } from "express";
import { changeCurrentPassword, getCurrentUser, getUserChannelProfile, getWatchHistory, loginUser, logout, refreshAccessToken, registerUser, updateAccountDetails, updateUserAvatar, updateUserCoverImage } from "../controllers/user.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

// yaha jo bhi userRoute se aa rahe honge unhe hum "/register" route par forward kar denge ab route likhne ke baad hum batate hai ki konsa method hum is route
// par lagana chahte hai jaise humne "/register" route par post method lagaya hai ab hum method ke ander batate hai ki konsa controller call hona chahiye is particular route par
// jaise hum registerUser wala controller user kar rahe hai "/register" route par
// ab hume user ko register karne se pehle image ko cloudinary par upload karna hai toh upload functionality ek middleware hai toh hume is middleware ko 
// register user se pehle call karana hoga
router.route("/register").post(
    // ab yeh upload hume kai sare options deta hai upload karne kai single,array,any etc toh agar hume single file ko upload karna hai toh .single laga dunga
    // lekin hume toh kai saari files upload karni hai toh array bhi nahi laga sakte kyunki array toh ek hi field mein multiple files leta hai toh hum use karenge
    // .fields() toh .fields() accept karta hai array jisme hum bahut sare object le sakte hai toh hamare schema ke hisab se image ki do fields hai coverImage aur avatar
    // toh hum do objects ka use karenge
    upload.fields([
        {
            // toh pehle object kya kya cheej le raha hun toh sabse pehle toh batayenge name ki is file ko kis naam se janenge toh mein januga avatar naam se jab front end ka field banega tab bhi uska naam avatar hi hona chahiye
            // aur dusra maxCount ki kitni files accept karunga mein ek hi file accept karunga isliye 1 kar diya
            name:"avatar",
            maxCount:1
        },
        {
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser)

router.route("/login").post(loginUser)

// ab yaha hum use karenge apna middleware jo humne auth.middleware mein likha tha toh yaha hum logout route par jane se pehle verify karwana chahte hai jwt ko 
// toh hum post() method mein pehle verifyJWT karenge uske baad logoutUser function ko chalayenge isliye hum use karte hai next() function ka req,res ke baad mein jisse woh next argument or function ko execute kare
router.route("/logout").post(verifyJWT,logout)    

// ab yaha hum woh route bana rahe hai jab user ka accessToken expire ho jata hai aur new token user ko dena hota hai
router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)

// ab avatar image ko update karane wale hai toh pehle middleware aayega verifyJWT ka for checking logged in user aur dusra middleware aayega multer ka for uploading files
// aur kyunki hum ek hi file upload kara rahe hai isliye .single() method use kiya hai waise ismein array wagerah aur bhi methods hote hai isliye controller mein files nahi file aa raha hai
router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateUserAvatar)

router.route("/coverImage").patch(verifyJWT,upload.single("avatar"),updateUserCoverImage)

router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)

router.route("/watchHistory").get(verifyJWT,getWatchHistory)






export default router;
