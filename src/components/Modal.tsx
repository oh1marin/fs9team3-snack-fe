"use client";

import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  onClose?: () => void;
}

export default function Modal({ children, onClose }: ModalProps) {
  return (
    <div
      className="border p-4 sm:p-6 md:p-10"
      style={{
        borderRadius: "24px",
        backgroundColor: "#FBF8F4",
        boxShadow: "4px 4px 10px 0 rgba(169, 169, 169, 0.20)",
      }}
    >
      {children}
    </div>
  );
}
