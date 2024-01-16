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



export { app };
