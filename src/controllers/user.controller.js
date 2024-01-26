import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

// steps to register a user ( or algorithm to register user )

// step1: get user details from frontend
// step2: validation - not empty
// step3: check if user already exist: username,email
// step4: check for images, check for avatar
// step5: upload them on cloudinary, avatar
// step6: create user object- create entry on db
// step7: remove password and refreshToken fields response
// step8: check for user creation
// step9: return res


const registerUser = asyncHandler(async(req,res)=>{
    // get user details from frontend
    // sari user details aapko req.body ke ander milti hai ab jo data req.body se aa raha hai usse hum extract kar sakte hai yani destructure kar lete hai
    const {fullName,email,username,password} = req.body;
    // ab user ki details aa gayi hai toh second step hum validate karenge user ko
    // hum yaha user ki har ek field ko check kar rahe hai ki koi field empty toh nahi hai agar field hai toh hum use trim kar denge aur agar trim 
    // karne ke baad bhi woh empty hai toh automatically true return ho jayega toh yeh sabhi field par chalega aur agar ek bhi field ne true return kara matlab woh field khali tha 
    if([fullName,email,username,password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"All fields are required")
    }

    // ab hum check karenge ki user pehle se toh exist nahi karta hai toh user pehle se exist karta hai ya nahi yeh check karne ke liye hume database
    // mein check karna padega ki yeh user pehle se exist toh nahi hai database mein toh hum User model ka use kar lenge kyunki user model directly contact 
    // kar raha hai mongodb database se aur kyunki User model directly mongoose ke through bana hai
   const existedUser = await User.findOne({
        // ab hume check karna hai ya toh username mil jaye ya toh email mil jaye ho sakta hai email alag ho lekin username same ho toh username same nahi hona chahiye toh mein error dunga ki
        // username already exist toh hum yaha use lene wale hai operator ka toh yaha hamari condition ke hisab se hum "or" operator use kar lenge
        $or:[{username},{email}]
        // ab yeh return karega jo bhi isko first document mila hai jo match karta hai is username or is email se woh humko mil jayega iske response ko hum ek variable mein
        // store kar lenge existedUser naam ke variable mein 
    })

    // ab isse fayda yeh hua ki agar existed user hai toh hume aage proceed hi nahi karna hai mujhe user ko wahi ke wahi error throw karna hai 
    if(existedUser){
        throw new ApiError(409,"User with email or username already exist!");
    }

    // ab hume user ke avatar aur cover picture ko check karna hai jisme se avatar photo required hai user ko create karne ke liye
    // abhi tak humne dekha ki req.body ke ander sara data aata hai lekin kyunki humne routes ke ander ja kar middleware add kar diya hai toh yeh middleware
    // bhi kuch access deta hai jo humne image files ko handle karne ke liye middleware banaya tha toh yeh middleware req ke ander kuch aur fields add kar dega
    // toh jaise req.body ka access express ne de diya hai waise hi multer ne req.files ka access de diya hai
    const avatarLocalPath = req.files?.avatar[0]?.path;

    // ab coverImage ka bhi local path le lete hai
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    let coverImageLocalPath;

    // yaha hum check kar rahe hai ki user ne coverImage select ki ya nahi upload karne ke liye toh hum check kar rahe hai 
    // agar req.files true hai matlab files mein kuch toh aaya hai fir coverImage check kar rahe hai ki kya woh array ke format mein hai aur last mein agar woh array format mein hai 
    // toh uski length chack kar rahe hai agar length greater hai 0 se matlab array mein kuch toh aaya hai tabhi length increment hui
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path;
    }

    // ab hume images ko upload karna hai cloudinary par

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    // ab hum check kar lenge ki image cloudinary par upload hui hai ya nahi agar hui hogi toh uska response avatar variable mein aa jayega
    if(!avatar){
        throw new ApiError(400,"Avatar file is required")
    }

    // ab agar yeh saare steps ho gaye hai toh ab database mein hum user ko create kar denge aur create method object leta hai
    const user = await User.create({
        fullName,
        avatar:avatar.url,
        // ab humne avatar image par toh check laga diya hai ki woh toh honi hi chahiye lekin coverImage hume nahi pata ki user ne upload ki hai ya nahi
        // toh agar user ne coverImage select ki hai toh usse hum database mein save kara lenge lekin agar select nahi ki hai toh us case mein empty string jayegi
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })

    // ab hume check karna hai ki jo user hamne create kiya woh database mein save hua bhi ya nahi toh uske liye humne findById() method call kiya hai jisme humne current user ki id pass ki hai
    // aur kyunki hume frontend mein response mein password aur refreshToken nahi send karna hai isliye select() method ka use karke humne bata diya hai -password -refreshToken toh select() method
    // mein woh fields pass karte hai jo hume frontEnd par nahi bhejni hai
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"something went wrong while registering the user")
    }

    // ab jab user create ho gaya successfully toh hum frontEnd par yeh response send kar rahe hai
    return res.status(201).json(
        new ApiResponse(200,createdUser,"User Registerred Successfully!")
    )
   
})




export {registerUser}