import React from "react";
import { IconSquareRoundedX } from '@tabler/icons-react';

interface Props {
  error?: boolean;
  title?: string;
  message1?: string;
  message2?: string;
  buttonText?: string;
  onClose: () => void;
}

const SubscriptionModal: React.FC<Props> = ({
  error,
  title = "You are in!",
  message1 = "Thanks for subscribing to our newsletter.",
  message2 = "You will get first access to new releases, upcoming events, and special notes from us.",
  buttonText = "Love it",
  onClose,
}) => {
  return (
    <div className="modal-content bg-white p-7 rounded-2xl max-w-lg w-full shadow-2xl border border-gray-100">
      <div className="flex justify-center items-center relative mb-3">
        <h2 className="text-xl font-semibold text-gray-800 tracking-tight flex items-center">
          {error ? title : `✨ ${title}`}
        </h2>
        <button
          onClick={() => {
            try {
              onClose();
            } catch (error) {
              console.error("Error in onClose handler:", error);
            }
          }}
          className="text-black hover:text-gray-500 absolute right-0"
          aria-label="Close"
        >
          <IconSquareRoundedX size={24} color="magenta" />
        </button>
      </div>
      <p className="text-gray-700 text-sm leading-6">{message1}</p>
      <p className="mt-3 text-gray-600 text-sm leading-6">{message2}</p>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-gradient-to-r from-pink-600 to-pink-500 text-white py-2.5 px-4 rounded-xl hover:opacity-90 transition"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default SubscriptionModal;
