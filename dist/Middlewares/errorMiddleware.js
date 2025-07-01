"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorMiddlaware = void 0;
const apiExeption_1 = __importDefault(require("../Exeptions/apiExeption"));
const errorMiddlaware = (err, req, res, next) => {
    if (err instanceof apiExeption_1.default) {
        console.log(err);
        res.status(err.status).json({ message: err.message, errors: err.errors });
        return;
    }
    console.log(err);
    res.status(500).json({ message: "Unexpected error" });
};
exports.errorMiddlaware = errorMiddlaware;
exports.default = errorMiddlaware;
