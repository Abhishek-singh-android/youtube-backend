// yeh apiError class bani hai Error class se 
class ApiError extends Error{
    // isme constructor hota hai lekin hum khud ka constuctor banayenge
    // Ab is constructor mein mein kya lena chah raha hun toh jo bhi is constructor ko use karna chahta hai woh mujhe 
    // dega statusCode,message,error,errorStack
    
    constructor(statusCode,message="Something went wrong",errors=[],stack){
        // ab constructor mein chijo ko overwrite karne ke liye hum super() method ko use karenge jisme hum bhejenge ki message toh overwrite karna hi hai
        super(message)
        this.statusCode = statusCode;
        this.data = null;
        this.message = message;
        this.sucess = false;
        this.errors= errors;

        if(stack){
            this.stack = stack;
        } else {
            Error.captureStackTrace(this,this.constructor)
        }
    }

}

export {ApiError}