// yeh cloudinary.js hamari image aur video files files ko cloudinary par upload karne ka kaam karegi ab kyunki yeh upload ki functionality hai
// aur yeh ek common functionality hai ise hum baar baar use karenge isliye ise humne utils folder ke ander rakha hai  

import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

// yeh cloudinary ki configuration hai jo hume cloudinary ke url se milegi
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// yaha hum select karenge apni local file jo hum cloudinary par upload karna chahte hai aur yahi se upload bhi kar denge
const uploadOnCloudinary = async(localFilePath) =>{
 
    try {

        if(!localFilePath) return null;
        // upload the file on cloudinary yaha hume upload() function mein pahle parameter me pass karna hota hai localfilePath ko aur
        // second parameter mein pass karna hota hai upload actions 
        const response = await cloudinary.uploader.upload(localFilePath,{
            // yaha humne select kar liya resource type jo kuch bhi ho sakta hai image video toh yeh automatically select kar lega
            resource_type:"auto"
        })
        // file has been uploaded successfully
        console.log("file uploaded on cloudinary",response.url)
        fs.unlinkSync(localFilePath)
        return response;
    } catch (error) {
        // remove the locally saved temporary file as the upload operation got failed
        // agar file upload mein koi error aati hai toh hum us local file ko hata denge toh unlikeSync yahi kam karta hai remove karne ka
        fs.unlinkSync(localFilePath) 
        return null;
    }

}

export {uploadOnCloudinary}

