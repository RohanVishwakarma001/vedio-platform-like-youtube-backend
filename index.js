import express from "express";
import dotenv from "dotenv";
import fileUpload from "express-fileupload";
import cookieParser from "cookie-parser";

import { connectDB } from "./config/db.config.js";
import userRoutes from "./routes/user.routes.js";
import videoRoutes from "./routes/video.routes.js";

dotenv.config();
const app = express();
app.use(cookieParser());
connectDB();

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.use("/api/v1/user", userRoutes);
app.use("/api/v1/video", videoRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
