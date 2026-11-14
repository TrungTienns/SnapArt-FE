export interface Booking {
  id: string;
  workshopId: string;
  userId: string;
  seatCount: number;
  totalPrice: number;
  currency: string;
  status: "pending" | "confirmed" | "cancelled" | "refunded";
  paymentStatus: "unpaid" | "paid" | "failed";
  paymentMethod?: "momo" | "vnpay" | "stripe" | "bank_transfer";
  createdAt: string;
  notes?: string;
}

export interface BookingRequestInput {
  workshopId: string;
  preferredDate: string;
  seatCount: number;
  contactName: string;
  contactPhone: string;
  notes?: string;
}
