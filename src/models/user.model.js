import mongoose, {Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,
        // ab database mein kisi bhi field ko searchable banane hai woh bhi optimize tarike se toh uska index true kar do taki yeh database ki searching mein aane lag jaye 
        // waise toh bina index true kare bhi ho jata hai lekin yeh usko optimize kar deta hai ab indexing bhi soch samajh kar lagana hota hai yeh nahi ki sari fields par index true kar diya
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true,
        trim:true,   
    },
    fullname:{
        type:String,
        required:true,
        trim:true,
        index:true     
    },
    avatar:{
        type:String, //cloudinary url that is used for fetching images,videos that we upload on cloudinary
        required:true,
    },
    coverImage:{
        type:String, //cloudinary url
    },
    // ab watch history aayegi mere video model toh hum ise connect kar denge video model se aur woh hum karte hai refrence type se
    // user jo bhi videos dekhega woh is watch history mein push hoti jayegi
    watchHistory:[
        {
            // ab hum bolenge mongoose se ki mujhe ek Schema do objectId type ka aur kyunki hum video model ko connect kar rahe hai toh ref mein Video de denge
            type:Schema.types.ObjectId ,
            ref:"Video" 
        },
    ],

    password:{
        type:String,
        required:[true,'Password is required'] // ab humne custom message bhi dal diya hai agar user password nahi dalega toh client ke browser par message show hoga Password is required
    },
    refreshToken:{
        type:String
    },

},{timestamps:true})

// ab pre hook se hum data save hone se pehle jo bhi kaam karana hai woh hum pre hook se kara sakte hai 
// toh hume password ko encrypt karne ka kaam karana hai kyunki hum nahi chahte ki password ek plain text mein save ho database mein
// ab pre hook mein pahle parameter mein aapko batana hota hai ki kis event se pehle aapki functionality execute ho jo aap pre hook mein likhenge 
// ab event jaise validate,save,remove,updateOne etc toh hume save hone se pehle karana hai toh save likh denge 
// ab pre hook ke dusre paramater mein ek callback aata hai toh ek baat note karle ki callback yaha aap arraow function se mat bana dena
// kyunki arrow function ke pass this ka refrence nahi hota context nahi pata hota usse yaha context pata hona bahut jaruri hai
// kyunki save event chal raha hai UserSchema pe aur hume UserSchema mein password field ko hi toh access karna hai usse manipulate karna hai 
// toh current object ki field ko access karne ke liye this toh use karna padega isliye normal function ka use lenge ab yeh encryption toda 
// time taking task hota hai isliye hum function ko async banayenge aur kyunki yeh ab ek middleware ki tarah kaam karega toh next ka access toh
// hona hi chahiye jisse yeh aage proceed kare aur jab aapka kaam ho jaye toh is next ko call karna padta hai ki yeh flag aage pass kar do 
userSchema.pre("save", async function(next){

    // ek problem hai ki mere UserSchema ki kisi bhi field mein agar koi change hota jaise jaise user ne apna name ya email hi change kar diya
    // toh agar koi bhi change hota hai toh yeh fir se call ho jayega aur yeh password ko bar bar hash karta jayega jaise hi user schema mein koi change hoga
    // lekin hume toh aisa nahi chahiye hume toh password encrypt tabhi karna hai jab user pahli baar save ho ya password field mein kuch update ho
    // toh hum check kar lenge agar password field mein kuch update nahi karna hai toh toh hum simple return kar jayenge aur next() call kar denge 
    // toh yeh aage hash karega hi nahi
    if(!this.isModified("password")) return next();


    // ab mein password field ko lunga aur jab bhi password save ho raha ho use encrypt kar do toh password mein le lunga this.password se
    // ab bcrypt ki help se yeh encrypt kar dega toh yeh hash ka use kar raha hai ab hash karne ke liye isse chahiye hota hai ki kise hash karna hai
    // bata do toh hume password ko hash karna hai toh this.password ab dusre parameter main hume batana hota hai ki kitne rounds lagau 
    this.password = await bcrypt.hash(this.password,10) 
    next()
}) 

// ab aapne database mein jo user ka password save karaya woh hai encrypted aur user bhejega simple plain text format mein password 
// toh hume check karna padega ki user ne jo password bheja hai woh usi user ka hai ya nahi toh hum method banayenge yeh check karne ke liye
// toh jaise hum middlewares bana sakte hai mongoose hume option deta hai ki hum kuch method bhi inject kar sakte hai
// ab hume method banana hai userSchema ke upar toh use le lenge aur us par method laga denge isPasswordCorrect

userSchema.methods.isPasswordCorrect = async function(password){
    // ab kyunki yeh password check karega isliye humne password ko pass kiya hai
    // ab password check karne ke liye hum bcrypt ka use karenge kyunki yeh encrypt aur decrypt bhi kar sakti hai toh bcrypt mein ek method hai
    // compare jo true ya false return karta hai compare method do chije mangta hai pahla simple password de do jo user pass kar raha hai aur dusra
    // encrypted password jo database mein pada hai toh encrypted password hum utha lenge this.password se aur kyunki yaha decryption ho raha hai 
    // aur usme time lagta hai toh hume karna hoga wait aur isliye hamara function async type ka bana
   return await bcrypt.compare(password,this.password)
   // toh true ya false value isPasswordCorrect mein aa jayegi 
}

// ab hume jwt token ko use karna hai toh isme do tokens use hote hai access token aur refresh token
// ab hum kafi safe authentication karna chahte hai isliye hum session aur cookies dono ka use karenge aur isliye hum accessToken aur refreshToken
// ka use kar rahe hai kyunki database mein toh hum sirf refresh token hi save kara rahe hai aur access token hum database mein save nahi kara rahe hai yeh aise hi work karta hai 
// ab jwt token create karne ke liye hum sign() method ka use karte hai toh sign method mein hume secret pass karna hota hai aur token ki expiry
// pass karni hoti hai ki kab token expire hona chahiye ab hum access token ka use kar rahe hai toh hume uska access token ka secret bhi dena hota hai
// ab jo aapka main token hai accessToken uska expiry kam rakhna hota hai aur refresh token ka expiry jyada rakhna hota hai

// ab jwt token mein sabse pehle aapko pass karna hota hai ki kon kon sa data jwt apne pass rakhe mein isko payload mein de deta hun
// _id jo user ki id hai aur email,username,fullName ab yeh sab toh aa jayega payload mein ab payload pass karne ke baad dusra hum pass karenge
// access Token secret aur yeh secret hi main hota hai isliye isse kafi strong banaye aur ek parameter aur jo hai expiry token ki   
userSchema.methods.generateAccessToken = function(){
     return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
    )
    // ab jab token ban jayega woh return ho jayega generateAccessToken ke andar
}

userSchema.methods.generateRefreshToken = function(){
    // refresh token same hi hoga access token ke jaisa lekin iske payload mein information thoda kam hogi
    return jwt.sign({
       _id:this._id,
   },
   process.env.REFRESH_TOKEN_SECRET,
   {
       expiresIn:process.env.REFRESH_TOKEN_EXPIRY
   }
   )
   // ab jab token ban jayega woh return ho jayega generateAccessToken ke andar
}


export const User = mongoose.model("Users",userSchema);