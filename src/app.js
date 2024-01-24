import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// jab bhi hume koi configuration karni hoti hai hum app.use() ka use karte hai
// yaha humne ek middleware setup ki hai jo cors ki hai jo keval usi url ko allow karegi jo hamare frontend ka url hoga

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// yaha humne dusri middleware setup ki hai jo frontend se json data le rahi hai kyunki data bhi diffrent types se ra sakta hai
// lekin hum json ko hi allow kar rahe hai isliye express.json() aur frontend se keval utna hi json aaye jitna hum chahte hai
//uske liye limit ka use kar rahe hai aur size bata denge max kitna data le sakte hai frontend se
// kyun ki agar limit nahi denge toh json se kitna bhi data aa sakta hai server par aur server par load badega jisse server crash bhi ho sakta hai.
app.use(express.json({ limit: "16kb" }));

// Ab agar hamare pass url se data aa raha hai toh thoda sa issue hota hai jese url se koi data jata hai toh kuch browser data aur space ke liye % use karte hai
// Aur kuch browser us space ko + kar dete hai toh url ka apne aap ek encoder hai jo chijo ko encode karta hai special character ko specially jese space ka encode hai %
// Toh uske liye bhi configuration karni padegi

app.use(express.urlencoded({ extended: true, limit: "16kb" }));

// Ab ek aur configuration add kar lete hai jo hai static toh kai baar hum kuch file folders store karna chahte hai jaise pdf file,
//images file mein apne hi server mein store karna chahta hun mein nahi chahta meri images aur files aws ya gcp par save rahe mein unhe 
// apne hi server par rakhna chahta hun toh ek folder bana denge public ki yeh public assset hai koi bhi use kar sakta hai
app.use(express.static("public"))

// ab ek aur configuration karni hai cookies ke liye toh cookieparser ka kam itna sa hai ki mein apne server se user ke browser ke ander ki
// cookies ko access kar pau aur use set bhi kar pau kunki kuch tarike hote hai janha se aap secure cookies user ke browser mein rakh sakte ho
// aur un cookies ko server hi read kar sakta hai aur server hi use remove kar sakta hai
app.use(cookieParser())


// routes import 
import userRouter from './routers/user.routes'

// routes declaration 
// toh pehle hamara kaam app.get likh kar ho raha tha kyunki app ke through pehle hum routes aur controller ek hi file mein likh rahe the lekin kyunki ab
// cheeje seprate kar di hai router ke liye alag folder bana diya hai alag file mein routes likh rahe hai toh ab router ko lane ke liye middleware lana padega
// isliye app.get ki jagah hum app.use ka use kar rahe hai toh ab app.use mein pahle parameter mein routes likhenge ki kis route par jana hai aur dusra parameter
// ki konsa router activate hona chahiye jaise yaha hume "/users" route par jana hai aur usme userRouter ko  activate karana hai
// toh ab jaise koi bhi request "/users" par aayegi toh hum control de denge userRouter par aur userRouter jayega userRoter wali file mein 
// ab userRoute mein aane ke baad aap decide karte ho ki kis route par user ko le jana hai matlab userRoute mein toh aa gaye ab uske aage further bhi toh jana hai
// jaise user ke ander registation route bhi hoga,signup route,login route toh yeh saare routes userRouter mein honge 
// ab agar aap api define kar rahe hai toh aapko batana hota hai ki aap api bana rahe hai aur harari api ka version kya hai toh hum "/users" na likh kar
// hum "/api/v1/users" likhenge isse code mein toh jayada kuch fark nahi padega lekin ek achi practice hai ki pehle api fir version fir api ka naam likhe
app.use("/api/v1/users",userRouter)

export { app };
