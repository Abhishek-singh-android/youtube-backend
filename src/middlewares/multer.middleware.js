import multer from "multer";

// yaha multer ka use hum files ko temporarily save karne ke liye kar rahe hai jo file user input mein bhejega woh multer usse process karega
// aur hamari local directory mein save kar dega baad mein hum usse yaha se remove kar denge aur cloudinary par upload kar denge   

// jaha jaha hume file upload ki capability ki jarurat hogi hum multer middleware ka use kar lenge

// file ko locally save karne ke liye hume destination toh select karna hoga toh aap file ko diskStorage mein save kar sakte ho aur MemoryStorage mein bhi save kar sekte ho
// Ab MemoryStorage mein Buffer mein data store hota hai toh memory mein agar less data tab toh thik hai memorystorage mein store kar lo lekin agar file size bada hai tab toh 
// diskStorage mein hi store karna padega isliye hum diskStorage use kar rahe hai
const storage = multer.diskStorage({
    // ab function mein jo file hai multer ke pass hota hai. req toh hai aapke pass jo user ke pass se aa raha hoga yaha file access aapko mil jata hai
    // jiske ander aapko sari files mil jati hai req ke ander toh body mein jo bhi json data hai woh mil hi jata hai ab agar file bhi aa rahi hai toh isiliye hum 
    // multer ka use kar rahe hai kyunki req ke ander jo bhi aayega body mein json data woh mil hi jata hai agar file bhi aa rahi hai isiliye multer use hota hai
    // kyunki req body ke ander json data yeh sab toh hamne configure kar liye express mein lekin file nahi hoti hai multer ya express ka jo file upload hai use hota hai
    // taki beech mein aapko ek aur option mil jaye aur mein file ka use kar pau. ab cb yaha par kuch nahi callback hai ab cb mein apko dena hota hai
    // destination folder ka path jaha aap apni sari image file aur video rakhoge toh mein public mein temp folder ke ander rakh raha hun   
    destination:function(req,file,cb){
        cb(null,"./public/temp")
    },
    filename:function(req,file,cb){
       // yaha hum apni file ka filename rakhenge filename ko change bhi kar sakte hai 
       // yaha hum file ko uske original name se hi save kar rahe hai jo user ne diya hoga
        cb(null,file.originalname)
    }
})

// toh humne multer ka use karke storage naam ki middleware bana li hai
export const upload = multer({storage:storage})