import mongoose from "mongoose";
import config from "./config.js";

const connectToDB = async () => {
    await mongoose.connect(config.MONGO_URI);
    console.log("database connected successfully");
}

export default connectToDB