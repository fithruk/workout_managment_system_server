import UserDTO from "../DTOs/userDTO";
import ApiError from "../Exeptions/apiExeption";
import userModel from "../Models/userModel";
import { RegistrationDataTypes } from "../Types/types";
import tokenService from "./tokenService";

class UserService {
  public CreateNewUser = async (data: RegistrationDataTypes) => {
    try {
      const { contactInfo, healthData } = data;
      const candidate = await userModel.findOne({ email: contactInfo.email });

      if (candidate) return ApiError.ConflictError();

      const newUser = await userModel.create({ ...contactInfo, ...healthData });

      const userDTo = new UserDTO(newUser.email, newUser.name, newUser.role);
      return { userDTo };
    } catch (error) {
      console.log(error);
      throw error;
    }
  };

  public Login = async (email: string, password: string) => {
    const candidate = await userModel.findOne({ email });

    if (!candidate || candidate.password !== password)
      throw ApiError.BadRequest("User does not exist");
    if (candidate && candidate.password !== password)
      throw ApiError.BadRequest("Password is incorrect");

    const userDTO = new UserDTO(
      candidate.name,
      candidate.email,
      candidate.role,
      candidate._id.toString()
    );
    const newToken = tokenService.GenerateToken({ ...userDTO });
    await tokenService.SaveToken(candidate._id.toString(), newToken);
    return { token: newToken, user: { ...userDTO, token: newToken } };
  };

  public GetAllClients = async () => {
    const clients = await userModel.find();

    return clients.map(
      (client) =>
        new UserDTO(
          client.name,
          client.email,
          client.role,
          client._id.toString()
        )
    );
  };

  public GetClient = async (clientName: string) => {
    const client = await userModel.findOne({ name: clientName });
    return client && client;
  };

  public GetClientById = async (userId: string) => {
    const client = await userModel.findOne({ userId });
    return client && client;
  };
}

export default new UserService();
