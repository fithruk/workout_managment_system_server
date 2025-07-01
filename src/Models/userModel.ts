import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    validate: {
      validator: function (password: string) {
        return password.length > 4;
      },
      message: "Password mast be longer then 4 symbols",
    },
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  chronicDiseases: {
    type: String,
  },
  injuries: {
    type: String,
  },
  workoutExperience: {
    type: String,
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
    required: true,
  },
});

export default model("User", userSchema);
