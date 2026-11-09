export interface Workshop {
  id: string;
  title: string;
  description: string;
  instructor: {
    id: string;
    name: string;
    avatarUrl?: string;
    bio?: string;
  };
  category: "oil-painting" | "watercolor" | "acrylic" | "sketching" | "pottery";
  level: "beginner" | "intermediate" | "advanced" | "all-levels";
  price: number;
  currency: string;
  durationMinutes: number;
  maxParticipants: number;
  currentParticipants: number;
  coverImage: string;
  galleryImages?: string[];
  scheduleDate: string;
  location: {
    address: string;
    city: string;
    room?: string;
  };
  includedMaterials: string[];
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
}
