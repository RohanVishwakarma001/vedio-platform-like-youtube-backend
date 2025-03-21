import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to the database🟢");
  } catch (error) {
    console.log(error.message);
    throw new Error(
      "Something went wrong while connecting to the database",
      error
    );
  }
};
