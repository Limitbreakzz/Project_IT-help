export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any;
}

export const createApiResponse = <T>(data: T, message = "Success"): ApiResponse<T> => ({
  success: true,
  data,
  message,
});

export const createApiErrorResponse = (message = "An error occurred", errors?: any): ApiResponse => ({
  success: false,
  message,
  errors,
});
