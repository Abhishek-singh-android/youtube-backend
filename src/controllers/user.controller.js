import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import jwt  from "jsonwebtoken";

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

const generateAccesssAndRefreshtokens = async(userId)=>
{
    try {
        const user = await User.findById(userId)
      const accessToken = await user.generateAccessToken()
      const refreshToken = user.generateRefreshToken()

      // ab access token toh hum user ko de dete hai lekin refresh token hum apne database mein bhi save karke rakhte hai taki baar baar password na puchna pade user se toh refreshtoken ko database mein dalna hai
      // toh aapke pass jo user hai yeh ek object hi toh hai iske ander aapki sari properties hai toh jab yeh sari property aayi hai yaha par toh refreshToken ki property bhi aayi hogi kyunki bana toh ye userModel se hi hai
      // user ke ander refresh token dalna hai toh user.refreshToken kar ke dal denge   
      user.refreshToken = refreshToken
      // ab dal toh diya toh token ab ise save bhi karana padega database mein toh user.save se database mein save ho jayega ab jab bhi hum database mein kuch insert karayenge toh humne user par validation laga rakha hai ki password toh hona hi chahiye
      // toh yaha toh password hai hi nahi kyunki ek hi field update kar rahe hai toh aisi situation mein hum validateBeforeSave ka use kar rahe hai aur ise false mark kar diya hai
      // matlab validation kuch mat lagao sidha save kar do kyunki mujhe pata hai sirf refreshToken hi save kara raha hun mein
     await user.save({validateBeforeSave:false})

     // ab jab accessToken aur refreshtoken aa gaye hai mere pass toh hum usse return bhi kar dete hai
     return {accessToken,refreshToken}

    } catch (error) {
        throw new ApiError(500,"Something went wrong while generating access or refresh token")
    }
}


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


// ab user model ke ander refresh token bhi hai aur hamne user model ke ander generate refreshToken bhi bana rakha hai aur generateAccessToken bhi bana rakha hai
// ab accesstoken aur refreshToken dono ki jarurat kya hai toh yeh ek modern practice hai ki hum do tokens use kare waise aap ek bhi use kar sakte hai keval accessToken ko use kar sakte ho lekin aaj kal jo modern apps hai jaise gmail,linkedIn etc inmein yeh do tokens ka concept use hota hai
// waise yeh dono tokens accessToken aur refreshToken same hi hote hai aur same hi tarah bante hai bus diffrence yeh hota hai ki konsa token expire kab ho raha hai
// accesstoken aur refreshToken mein difference kya hai toh accessToken generally short lived hote hai aur refreshToken long lived hote hai toh access token ko short duration mein expire kar diya jata hai
// aur refresh token ko thoda long term mein expire kiya jata hai ab concept yeh hai in dono tokens ke beech mein ki jab tak aapke pass accessToken hai tab tak aap koi bhi feature jaha aapke authentication ki requirement hai waha aap use kar sakte ho us resource ko
// jaise har kisi ko file upload toh nahi karne diya ja sakta server par toh agar aap authenticated ho login ho toh aap kar lo lekin agar maan lo aapka login session 15 min ke ander meine expire kar diya
// kuch security reasons ki wajah se toh aapko fir 15 min baad password dalna padega aur login karna padega yahi use hota hai refresh token ab refresh token hum database mein bhi save rakhte hai aur user ko bhi dete hai
// toh user ko validate toh hum access token se hi karte hai lekin hum user ko bolte hai ki baar baar password dalne ki jarurat nahi hai agar aapke pass aapka refresh token hai toh ek endpoint hit kar do waha se agar aapke pass
// jo refresh token hai aur mere pass jo database mein refreshtoken hai yeh dono agar same honge toh server aapko naya access token de dega 

const loginUser = asyncHandler(async(req,res)=>{
    //steps for login
    // req body-> data present
    // username or email is present
    // find the user 
    // password check
    // access and refresh token generate
    // send access token in cookies to the user's browser

    const {email,username,password} = req.body

    // yaha hum check kar rahe hai ki user ne ya toh username diya ho ya toh email diya ho
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }

    // yaha hum check karenge ki jo user ne username ya email diya hai woh hamare database mein present hai ya nahi 
    const user = await User.findOne({
        $or:[{username},{email}]
    })

    // agar user hamare database mein present nahi hai toh hum use error de denge
    if(!user){
        throw new ApiError(404,"User does not exist")
    }

    // yaha hum check karenge ki jo password user ne diya hai aur jo password hamare database mein hai encrypt hone se pehle usse compare karenge agar woh valid hai toh 
    // woh isPasswordValid mein aa jayega
   const isPasswordValid = await user.isPasswordCorrect(password)

   if(!isPasswordValid){
    throw new ApiError(401,"Invalid user credentials")
   }

   // ab yaha tak harama email or username sahi hai aur password bhi sahi hai toh ab hum accessToken aur refreshtoken bhi save kara lete hai
  const{accessToken,refreshToken} = await generateAccesssAndRefreshtokens(user._id)

  // ab hamare user mein token save ho chuka hai toh ab hum user ko find kar lenge logged in user ko aur kyunki yeh response mongodb se aayega toh password aur refreshToken bhi sath mein aayega
  // aur hume woh frontend par nahi bhejna hai isliye usse hum pehle hi nikal lenge isliye .select() method ka use kar rahe hai
  const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

  // yaha hum cookie ko set karne ke liye options bana rahe hai toh byDefault cookies modifiable hoti hai matlab frontEnd se koi bhi unhe modify kar sakta hai lekin 
  // jab httpOnly aur secure true hote hai toh ab yeh only server se hi modify ho sakti hai frontEnd se ise koi modify nahi kar sakta aur yeh khud se hi user ke browser mein set ho jati hai
  const options = {
    httpOnly:true,
    secure:true
  }

  return res.status(200)
  .cookie("accessToken",accessToken,options)
  .cookie("refreshToken",refreshToken,options)
  .json(new ApiResponse(200,{
   // toh yaha hum loggedInUser ka data toh bhej hi rahe hai sath hi hum accessToken aur refreshToken bhi bhej rahe hai json mein ab agar humne ek baar refreshToken aur accessToken ko
   // cookie mein save kar diya toh hum dubara usse json mein kyun send kar rahe hai toh ho sakta hai koi problem ho jaye cookies set na ho paye ya mobile mein bhi use kar rahe hai toh mobile mein toh cookies set hoti nahi isliye alag se bhi json mein pass kar di hai 
    user:loggedInUser,accessToken,refreshToken
  },
  "User logged In Successfully!"
  )) 


})

// toh logout karne ke liye tokens ko reset kar denge toh user khud hi logout ho jayega
const logout = asyncHandler(async(req,res)=>{
    // toh yaha jo verifyJWT se user add kiya tha usne req mein woh hum req mein se nikal lenge req.user karke 
    // toh ab hum user ko find kar lenge aur uska token delete kar denge database mein se toh hum findByIdAndUpdate() method use kar rahe hai ki user ko find karo aur uss par jo operation perform karna hai woh kar do

   await User.findByIdAndUpdate(
        req.user._id,{
            // yaha hume batana padta hai ki hume update karna kya hai toh hum mongodb ka ek operator use kar lenge jo hai set toh set leta hai ek object ki kya kya update karna hai 
            // toh yaha humne refreshToken ko undefined kar diya hai jisse woh token hamare database se delete ho jayega
            $set:{refreshToken:undefined}
        },
        // ab aap yaha par aur fields bhi pass kar sakte ho jaise aap ek new value le sakte ko jise aap true kar sakte ho jisse hoga yeh ki jo return mein aapko response milega usme aapko new updated value milegi agar old value milegi toh refreshToken mil jayega toh isliye new value chahiye
        {new:true}
        )


        const options = {
            httpOnly: true,
            secure: true
        }

     // ab cookies ko clear kar denge
     return res.status(200).clearCookie("accessToken",options)
     .clearCookie("refreshToken",options)
     .json(new ApiResponse(200,{},"User logged out"))   
})

// toh refreshtoken aur accesstoken ka sirf itna itna sa kaam hai ki user ko baar baar email aur password na dena pade login karne ke liye aur jo aapka accesstoken hota woh short lived hota hai jaise ek din ke liye accessToken banaya toh user us ek din tak toh bina email aur password ke login ko jayega agar uske pass woh token hai toh
// lekin jaise hi ek din end hoga token ho jayega expire tab user ko fir se email aur password dalna padega toh fir ek concept aaya ki hum 2 types ke tokens rakh sakte hai accessToken jo hum kahi database mein save nahi rakhenge sirf user ke pass hoga jisse user constantly kaam kar le lekin hum ek aur token rakh lenge jise session storage 
// bhi bolte hai waise yeh refreshToken hi hota hai aur iss refreshToken ko hum database mein bhi rakh lete hai toh agar user ka accesstoken invalidate ho gaya hai time end ho gaya hai toh user ke pass 401 response aayega frontend par ki access expire ho gaya toh jo frontend developer hai woh kya karega ki agar uske pass koi 401 reruest aa jati hai
// expire session wali toh wah user ko yeh bole ki fir se email aur password dalkar login karo iski wajah woh dusra kaam yeh kar le ki code likh de ki agar 401 request aaye toh ek end point hit karo aur waha se apna accessToken refresh kara lo yani ki naya token mil jayega ab naya token kaise milega toh aap us request ke ander apna refreshtoken bhejoge
// sath mein ab refresh token jaise hi milega backend mein toh refreshtoken store hai database mein toh refreshToken ho jayega compare aur agar woh same hai toh fir se session start ho jayega aur naya accesstoken mil jayega cookies mein frontEnd par aur refreshtoken ko bhi fir se set kar denge database mein jo naya accesToken bana hai same wahi ho jayega 
// refreshToken bhi ab yeh naya accesstoken get karne ke liye ek endpoint toh banana padega jaha frontend wala banda us endpoint par request karke token ko get kar lega

// refreshToken ka endpoint ke liye controller
const refreshAccessToken = asyncHandler(async(req,res)=>{
// ab yaha aapko refreshToken toh bhejna hi padega refresh Token ko cookies se access kar sakte hai agar koi bhi uss end point ko hit kar raha hai toh mein cookies se usko access kar lunga aur ho sakta hai ki koi mobile phone use kar raha ho toh wah req ki body mein token bhejega
// ab token ka naam humne incomingRefreshToken rakh liya hai kyunki hamare pass bhi toh ek refreshToken hai database mein 
const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

// ab agar hume user se yeh incomingRefreshToken nahi mila toh hum frontEnd par error throw kar denge

if(!incomingRefreshToken){
    throw new ApiError(401,"unauthorized Request")
}

try {
    // ab jo incomingRefreshToken aa raha hai usko verify bhi karna padega kyunki dono tokens ban ek hi tarike se rahe hai accessToken bhi aur refreshToken bhi toh hum usko verify karwa lete hai  
    // ab verify karwane se aapko decoded information mil jati hai agar hai toh aur nahi bhi hai tab bhi atleast aapko decoded token toh mil hi jata hai warna jo token user ke pass gaya hai woh aur jo database mein aapke save hai alag alag hote hai kyunki user ke pass encrypted pahuchta hai aur hume chahiye raw token jo humne database mein store kara hai 
    // ab verify karane ke liye token aur uska secret bhejna padta hai ab verify hone ke baad aapko decoded token milega
    
    const decodedToken = jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
    
    // ab jab humne refreshToken banaya tha user.models.js file mein toh waha humne token banane ke time par _id bhi pass ki thi toh is _id ka access bhi hoga hamare pass aur yeh _id user ki hai toh hum is _id ke base par database mein request maar sakte hai findById() ki aur waha se hum user ki information le sakte hai
    const user = await User.findById(decodedToken?._id);
    
    // ab agar aisa karne se user nahi aaya tab man lo koi galat token de diya user ne tab hum error show kar denge ki user exist hi nahi karta or invalid refreshtoken
    if (!user) {
        throw new ApiError(401,"Invalid refresh token")
    }
    
    // ab agar yaha tak pahuch gaye toh hamara token valid hi hona chahiye ab hamare pass token 2 tarike se aaya hai pehla incomingRefreshToken jo user ne send kiya hai aur dusra decodedToken jo humne nikala tha user ko verify karne ke liye
    // ab jab humne refreshtoken user.models.js mein banaya tha toh usse humne save bhi kar liya tha User model mein toh compare karna padega ki User model se jo token aa raha hai yani database se aur jo frontEnd se refreshToken aa raha hai woh same hai ki nahi
    if(incomingRefreshToken !== user?.refreshToken){
        throw new ApiError(401,"Refresh token is expired or used")
    }
    
    // ab agar dono tokens match ho jate hai toh hume naye tokens generate karna hai toh tokens generate karne ka method humne user.model.js mein banaya tha aur naye tokens hum cookies mein bhejenge user ko
    // toh options bana lete hai 
    const options = {
        httpOnly:true,
        secure:true
    }
    
     // ab method call kara lenge accessToken aur refreshToken generate karane ke liye 
     const {accessToken,newRefreshToken} = await generateAccesssAndRefreshtokens(user._id)
    
     // ab yeh new generated accesstoken aur refreshtoken ko cookies mein pass karke user ko send kar denge frontEnd par
    
     return res.status(200)
     .cookie("accessToken",accessToken,options)
     .cookie("refreshToken",newRefreshToken,options)
     .json(new ApiResponse(200,{accessToken,refreshToken:newRefreshToken},"Access Token Refreshed Successfully"))
    
    
} catch (error) {
    throw new ApiError(401,error?.message || "Invalid refresh token")
}



})





export {registerUser,loginUser,logout,refreshAccessToken}