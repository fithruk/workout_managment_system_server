"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
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
            validator: function (password) {
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
exports.default = (0, mongoose_1.model)("User", userSchema);
