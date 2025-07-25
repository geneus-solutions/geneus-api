import mongoose from "mongoose";

// promise based connection

const connectDB = async() => {
    try {
        // Set the strictQuery option explicitly
        mongoose.set('strictQuery', true);
        const conn = await mongoose.connect(process.env.DATABASE);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
}


export default connectDB;