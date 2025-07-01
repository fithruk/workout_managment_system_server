class UserDTO {
  public email: string;
  public name: string;
  role: "admin" | "user";
  public _id?: string;

  constructor(name: string, email: string, role: string, id?: string) {
    this.name = name;
    this.email = email;
    this.role = role as "admin" | "user";
    this._id = id;
  }
}

export default UserDTO;
