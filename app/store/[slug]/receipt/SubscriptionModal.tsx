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
  title = "Welcome Aboard!",
  message1 = "Thanks for subscribing to our newsletter!",
  message2 = "You'll be the first to know about our latest updates, special offers, and exclusive content.",
  buttonText = "Got it, thanks!",
  onClose,
}) => {
  return (
    <div className="modal-content bg-white p-6 rounded-lg max-w-lg w-full shadow-2xl">
      <div className="flex justify-center items-center relative">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center">
          {error ? title : `🎉 ${title} ✨`}
        </h2>
        <button
          onClick={() => {
            try {
              onClose();
            } catch (error) {
              console.error("Error in onClose handler:", error);
            }
          }}
          className="text-black hover:text-gray-400 absolute right-0 mb-[1.5em]"
        >
          <IconSquareRoundedX size={24} color="magenta" />
        </button>
      </div>
      <p className="text-gray-600">{message1}</p>
      <p className="mt-4 text-gray-600">{message2}</p>
      <button
        onClick={onClose}
        className="mt-6 w-full bg-black text-white py-2 px-4 rounded-lg hover:bg-gray-600"
      >
        {buttonText}
      </button>
    </div>
  );
};

export default SubscriptionModal;
