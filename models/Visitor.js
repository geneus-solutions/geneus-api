// Define a schema for visitor data
import mongoose from "mongoose";

const visitorSchema = new mongoose.Schema({
    ip: String,
    city: String,
    timestamp: { type: Date, default: Date.now },
});

// Create a model
export default mongoose.model('Visitor', visitorSchema);