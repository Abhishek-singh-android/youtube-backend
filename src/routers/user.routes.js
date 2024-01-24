import { Router } from "express";
import { registerUser } from "../controllers/user.controller";
import {upload} from "../middlewares/multer.middleware"
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

export default router;
