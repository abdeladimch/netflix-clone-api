require("express-async-errors");
require("dotenv").config();

const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const { uploadImage } = require("./controllers/show");
const fileUpload = require("express-fileupload");

const helmet = require("helmet");
const cors = require("cors");
const rateLimiter = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");

const { authUser, authPerms } = require("./middlewares/authMiddleware");
const errorHandler = require("./middlewares/errorHandler");
const notFound = require("./middlewares/notFound");

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const showRouter = require("./routes/show");
const reviewRouter = require("./routes/review");
const watchlistRouter = require("./routes/watchList");

const connectDB = require("./db/connect");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 1000 * 60 * 15,
    max: 50,
  })
);

app.use(cors());
app.use(mongoSanitize());
app.use(helmet());
app.use(xss());

app.use(express.json());
app.use(express.static("public"));
app.use(cookieParser(process.env.JWT_SECRET));
app.use(fileUpload());

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/shows", showRouter);
app.use("/api/reviews", reviewRouter);
app.use("/api/watchlists", watchlistRouter);
app.post("/api/uploadImage", authUser, authPerms("admin"), uploadImage);

app.use(errorHandler);
app.use(notFound);

connectDB(process.env.MONGO_URI);

mongoose.connection.once("open", () => {
  console.log("Connected to DB!");
  app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}...`);
  });
});
