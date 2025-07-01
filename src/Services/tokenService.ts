import jwt from "jsonwebtoken";
import tokenModel from "../Models/tokenModel";

class TokenService {
  public GenerateToken = (payload: {
    email: string;
    name: string;
    _id?: string;
  }): string => {
    const token = jwt.sign(
      { email: payload.email, name: payload.name, _id: payload._id },
      process.env.TOKEN_SECRET!,
      { expiresIn: "15d" }
    );

    return token;
  };

  public ValidateToken = (token: string) => {
    try {
      const userData = jwt.verify(token, process.env.TOKEN_SECRET!);
      return userData;
    } catch (e) {
      return null;
    }
  };

  public SaveToken = async (userId: string, token: string) => {
    const currentToken = await tokenModel.findOne({ user: userId });
    if (currentToken) {
      currentToken.token = token;
      return await currentToken.save();
    }

    const newToken = await tokenModel.create({ user: userId, token });
    return newToken;
  };

  public DecodeToken = (token: string) => {
    return jwt.decode(token);
  };

  async RemoveToken(token: string) {
    const tokenData = await tokenModel.deleteOne({ token });
    return tokenData;
  }
}

export default new TokenService();
