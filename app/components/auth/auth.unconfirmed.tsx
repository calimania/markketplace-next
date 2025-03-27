import { markketConfig } from "@/markket/config";
import { useAuth } from "@/app/providers/auth.provider";
import {useState } from "react";


const AuthUnconfirmed = () => {
  const { user } = useAuth();
  const [sentEmail, setSentEmail] = useState(null as null | boolean);

  const requestNewConfirmation =async () => {
    const request =await  fetch(new URL(`/api/auth/send-email-confirmation`, markketConfig.api), {
      body: JSON.stringify({
        email: user?.email,
      }),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    setSentEmail(!!request.ok);
  };

  return (
    <div>
      <h1>Unconfirmed</h1>
      <p>Please confirm your email address.</p>
      <p>
        If you have not received the confirmation email, please check your spam folder or request a new confirmation email.
      </p>
      <button onClick={requestNewConfirmation}>
        {sentEmail ? `Confirmation email sent to ${user?.email}` : 'Resend confirmation email'}
      </button>
    </div>
  );
}

export default AuthUnconfirmed;

