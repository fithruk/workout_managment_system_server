import { Schema, model } from "mongoose";

const abonementShema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  abonementDuration: {
    type: Number,
    required: true,
  },
  dateOfCreation: {
    type: Date,
    required: true,
  },
});

export default model("Abomement", abonementShema);
