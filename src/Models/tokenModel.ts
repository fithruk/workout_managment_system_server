import { Schema, model } from "mongoose";

const tokenModel = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
});

export default model("token", tokenModel);
