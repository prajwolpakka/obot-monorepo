export interface IMessageResponse {
  message: string;
}

export interface IMessageResponseWithData<T> extends IMessageResponse {
  data: T;
}
