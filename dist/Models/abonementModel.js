"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const abonementShema = new mongoose_1.Schema({
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
exports.default = (0, mongoose_1.model)("Abomement", abonementShema);
