import { IMessageResponse } from "../../common/interfaces/common.interface";
import { User } from "../../users/entities/user.entity";

export interface ILoginResponse extends IMessageResponse {
  user: Partial<User>;
}

export interface ISignupResponse extends IMessageResponse {
  email: string;
}
