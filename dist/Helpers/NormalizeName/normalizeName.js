"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeName = void 0;
const normalizeName = (name) => name
    .toLowerCase()
    .trim()
    .split(/\s+/) // разбиваем по пробелам (включая лишние)
    .sort()
    .join(" ");
exports.normalizeName = normalizeName;
