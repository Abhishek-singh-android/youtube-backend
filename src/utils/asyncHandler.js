// yeh asyncHandler() fun ka use isliye kar rahe hai kyunki jo hamara database connection ka function hai woh ek async function hai 
// aur yeh function bahut jagah use hone wala hai jaise user,videos,comments etc inke controller database se connection toh chahiye hi na
// toh kyu na ek utility file bana le jo meri help kar de aur is tarah ke wrapper ka generalize function bana lu aur jab bhi aap ko function 
// is tarah se execute karna ho aap mere method mein function pass kar dena mein execute karke wapas de dunga aapko wrapper laga dunga uske aage.

// yeh ek wrapper function banaya hai jo async task ko handle karega
// Ab yeh async function asyc await se bhi banaya ja sakta hai aur promises se bhi banaya ja sakta hai

// async wrapper function using promises 
const asyncHandler = (requestHandler) =>{
 return (req,res,next)=>{

    Promise.resolve(requestHandler(req,res,next))
    //Ab yeh jo error hai woh kafi baar ap bhejoge aur error ka koi structure nahi hai hamare pass man kara status code bhej diya man kara nahi bheja
    // man kara json response bhej diya man kara nahi bheja toh isko bhi hume ek centralize format mein rakhna padega ki itna chije toh bhejte hi hai har bar
    // ab api ka error bhi standarize karna chahta hun aur api ka response bhi mein standarize karna chahta hun
    // Ab iske liye node js ki Error class ko padna padega 
    .catch((err)=>next(err))

  }
}



// yeh asyncHandler fun ek higher order function hai higher order function woh function hote hai
// jo function ko as a parameter accept kar sakte hai aur function ko return bhi kar sakte hai toh yeh as a variable ki tarah hi treat karte hai function ko

// async wrapper function using async await
// const asyncHandler = (func) =>{
//     // ab jo aapne funct pass karaya usme se hum extract kar lete hai req,res,next hum middleware bhi use karenge isliye next bhi pass karna padega jisse woh aage ki functionality ko proceed is function ke baad wali
//     // ab mein try catch bhi lunga kyunki har ek function jo mein lunga uske aage ek wrapper hi toh laga raha hun mein async aur try catch ka
//     async(req,res,next)=>{
//         try {
//             await func(req,res,next)       
//         } catch (error) {
//             res.status(error.code || 500).json({
//                 success:false,
//                 message:error.message
//             }) 
//         }
//     }
// }

// or 
// const asyncHandler = (func) => async() => {}

export {asyncHandler}