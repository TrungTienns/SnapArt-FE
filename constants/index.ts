export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export const WORKSHOP_CATEGORIES = [
  { value: "oil-painting", label: "Sơn dầu (Oil Painting)" },
  { value: "watercolor", label: "Màu nước (Watercolor)" },
  { value: "acrylic", label: "Màu Acrylic" },
  { value: "sketching", label: "Ký họa & Chì (Sketching)" },
  { value: "pottery", label: "Làm gốm & Vẽ gốm" },
] as const;

export const WORKSHOP_LEVELS = [
  { value: "all-levels", label: "Mọi trình độ" },
  { value: "beginner", label: "Người mới bắt đầu" },
  { value: "intermediate", label: "Trung cấp" },
  { value: "advanced", label: "Nâng cao" },
] as const;
