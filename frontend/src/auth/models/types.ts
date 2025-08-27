import { IBaseEntity } from "@/common/models/types";
import { ISubscription } from "@/subscription/models/types";

export interface IUser extends IBaseEntity {
  id: string;
  email: string;
  fullName: string;
  isEmailVerified: boolean;
  lastLogin?: Date;
  subscription?: ISubscription;
}

export interface IAuth {
  user: null | IUser;
  isAuthenticated: boolean;
}
