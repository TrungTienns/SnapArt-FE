export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "instructor" | "admin";
  avatarUrl?: string;
  phoneNumber?: string;
}
