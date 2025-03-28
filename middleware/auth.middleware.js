import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

export const auth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).send({ error: "Please authenticate." });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).send({ error: "Please authenticate." });
    }
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).send({ error: "Please authenticate." });
    }
    req.user = user;
    req.userId = user._id;
    next();
  } catch (error) {
    res.status(401).send({ error: "Please authenticate." });
  }
};
