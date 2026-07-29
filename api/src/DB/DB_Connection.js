import mongoose from "mongoose";
import { DB_Name } from "../constants/DB_Name.js";


let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const DB_connection = async () => {
   
    if (cached.conn) {
        console.log("=> Using existing MongoDB connection");
        return cached.conn;
    }


    if (!cached.promise) {
        console.log("=> Creating new MongoDB connection");
        cached.promise = mongoose.connect(`${process.env.DB_URL}/${DB_Name}`, {
            serverSelectionTimeoutMS: 5000, 
        }).then((mongooseInstance) => {
            console.log(`MongoDB Connected Successfully: ${mongooseInstance.connection.host}`);
            return mongooseInstance;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (error) {
        cached.promise = null; 
        console.error("Connection Error: ", error);
     
        throw error; 
    }

    return cached.conn;
};

export default DB_connection;


