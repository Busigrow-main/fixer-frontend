"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

export interface PartInquiryItem {
  partId: string;
  quantity: number;
}

export interface PartInquiry {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  createdAt: string;
  status: "requested";
  items: PartInquiryItem[];
}

interface CreatePartInquiryInput {
  customerName: string;
  phone: string;
  email: string;
  address: string;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  items: PartInquiryItem[];
}

interface BookingContextType {
  isOpen: boolean;
  selectedService: string; // The ID of the service (e.g., 'refrigerator')
  openBooking: (serviceId?: string) => void;
  closeBooking: () => void;
  partInquiries: PartInquiry[];
  createPartInquiry: (input: CreatePartInquiryInput) => string;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export function BookingProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [partInquiries, setPartInquiries] = useState<PartInquiry[]>([]);

  React.useEffect(() => {
    const raw = window.localStorage.getItem("fixxer_part_inquiries_v1");
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as PartInquiry[];
      if (Array.isArray(parsed)) {
        setPartInquiries(parsed);
      }
    } catch {
      // Ignore malformed local data and continue with an empty state.
    }
  }, []);

  React.useEffect(() => {
    window.localStorage.setItem(
      "fixxer_part_inquiries_v1",
      JSON.stringify(partInquiries),
    );
  }, [partInquiries]);

  const openBooking = (serviceId?: string) => {
    if (serviceId) {
      setSelectedService(serviceId);
    }
    setIsOpen(true);
  };

  const closeBooking = () => {
    setIsOpen(false);
    // Note: We don't necessarily clear selectedService here to allow for smooth
    // closing animations where the content might still be visible.
  };

  const createPartInquiry = (input: CreatePartInquiryInput) => {
    const inquiryId = `PI-${Date.now().toString(36).toUpperCase()}`;
    const inquiry: PartInquiry = {
      id: inquiryId,
      customerName: input.customerName,
      phone: input.phone,
      email: input.email,
      address: input.address,
      preferredDate: input.preferredDate,
      preferredTime: input.preferredTime,
      notes: input.notes,
      createdAt: new Date().toISOString(),
      status: "requested",
      items: input.items,
    };

    setPartInquiries((prev) => [inquiry, ...prev]);
    return inquiryId;
  };

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        selectedService,
        openBooking,
        closeBooking,
        partInquiries,
        createPartInquiry,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
}
