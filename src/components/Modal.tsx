"use client";

import React, { useEffect, useRef } from "react";
import "./_modal.scss";
import { IoClose } from "react-icons/io5";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  className?: string;
  notice?: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  content,
  className = "",
  notice,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // Store the currently focused element
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus the modal
      modalRef.current?.focus();
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Restore focus when modal closes
  useEffect(() => {
    if (!isOpen && previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className={`modal__backdrop ${className}`}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className="modal__container"
        tabIndex={-1}
        role="document"
      >
        <div className="modal__header">
          <div className="modal__header-content">
            <h2 id="modal-title" className="modal__title">
              {title}
            </h2>
            {notice && (
              <p className="modal__notice">{notice}</p>
            )}
          </div>
          <button
            className="modal__close-button"
            onClick={onClose}
            aria-label="Close modal"
            type="button"
          >
            <IoClose />
          </button>
        </div>
        <div className="modal__content">{content}</div>
      </div>
    </div>
  );
};

export default Modal;
