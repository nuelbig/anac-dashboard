import api from "./api";
import { Department } from "../types/department";
import { ApiResponse } from "../types";

export const createDepartment = async (departmentData: Department): Promise<Department> => {
  const response = await api.post<Department>("/api/v1/departments", departmentData);
  return response.data;
};

export const getDepartments = async (): Promise<Department[]> => {
  const response = await api.get<Department[]>("/api/v1/departments");
  return response.data;
};

export const getDepartmentById = async (id: number): Promise<Department> => {
  const response = await api.get<ApiResponse<Department>>(`/api/v1/departments/${id}`);
  return response.data.body;
};

export const updateDepartment = async (departmentData: Department): Promise<Department> => {
  const response = await api.put<Department>(`/api/v1/departments`, departmentData);
  return response.data;
};

export const deleteDepartment = async (id: number): Promise<void> => {
  await api.delete(`/api/v1/departments/${id}`);
};             