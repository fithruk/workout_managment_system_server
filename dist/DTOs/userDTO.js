"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class UserDTO {
    constructor(name, email, role, id) {
        this.name = name;
        this.email = email;
        this.role = role;
        this._id = id;
    }
}
exports.default = UserDTO;
