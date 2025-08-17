import mongoose from "mongoose";

export const connectDB = async () =>{
    await mongoose.connect('mongodb+srv://siddalingapms100:Siddupm1999@cluster0.7wwfcx4.mongodb.net/TaskFlow').
    then(() =>console.log('DB CONNECTED'))
}


