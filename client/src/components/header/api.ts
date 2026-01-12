import axios from "axios";

export const API_BASE = ((import.meta as any).env?.VITE_API_URL as string | undefined) ?? "http://localhost:4013/api/v1";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});
