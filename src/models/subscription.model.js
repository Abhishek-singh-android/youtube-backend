// ab subscription kya hai aur isse alag se model mein kyu banaya isse toh user model ke sath mein bhi bana sakte the toh hum user model ke ander bhi subscription rakh sakte the 
// lekin hume kya laga ki subscription ko alag se hi rakhna chahiye best practises ko follow karte huye ab iss subscription model ke ander hai kya cheej toh sirf 2 cheej hai jo subcription mein hoti bhi hai ab subscription mein ek channel hota hai aur uske bahut sare subscriber hote hai
// ab channel bhi apne aap mein user hi toh hai kyunki jisne chaanel banaya hoga woh user hi toh hoga aur jo uss channel ko subscribe kar rahe hai woh bhi user hi hai matlab dono user hi hai ab inn users ko bas alag jagah par rakha jata hai taki inki ids se hum inhe match kar le 
// toh ab agar subscription ka model soche toh usme id toh mongoDB automatically generate kar dega aur hume chahiye subscriber aur channel toh channel ki field banegi jo user se related hogi kyunki channel bhi toh user hi hai
// aur dusri field banegi subscriber ki aur yeh bhi related hogi user se kyunki subscriber bhi user hi hai

import mongoose, {Schema} from "mongoose";

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // one who subscribe the channel (user)
        ref: "User",
    },
    channel:{
        type: Schema.Types.ObjectId, // one who create the channel (user)
        ref: "User",
    }
},{timestamps:true})


export const Subscription = mongoose.model("Subscription",subscriptionSchema);