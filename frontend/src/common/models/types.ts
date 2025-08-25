export interface IMessageResponse {
  message: string;
}

export interface IMessageWithData<T> extends IMessageResponse {
  data: T;
}

export interface IBaseEntity {
  createdAt: string;
  updatedAt: string;
  createdById?: string;
  updatedById?: string;
}

export interface IPaginatedData<T> {
  data: T[];
  pagination: {
    currentPage: number;
    itemCount: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

export interface IApiError {
  statusCode: number;
  message: string | string[];
  error?: string;
}
