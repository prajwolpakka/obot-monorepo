import { IBaseEntity } from "@/common/models/types";

export interface IUser extends IBaseEntity {
  id: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
}

export interface IAuth {
  user: null | IUser;
  isAuthenticated: boolean;
}
