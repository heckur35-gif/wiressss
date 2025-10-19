import React, { useState } from 'react';
import PhoneNumberInput from '../components/auth/PhoneNumberInput';
import OtpVerification from '../components/auth/OtpVerification';
import { signInWithPhone, verifyOtpAndInsertUser } from '@/hooks/useAuth';

export default function PhoneLoginPage() {
  const [phone, setPhone] = useState<string | null>(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOtpRequest = async (phoneNumber: string) => {
    try {
      await signInWithPhone(phoneNumber);
      setPhone(phoneNumber);
      setOtpRequested(true);
      setMessage('OTP sent! Please check your phone.');
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleVerify = async (otp: string, fullName: string) => {
  if (!phone) return;
  try {
    await verifyOtpAndInsertUser(phone, otp);
    // handle success (reset states, show message, etc.)
  } catch (error: any) {
    // handle error
  }
};


  return (
    <div style={{ padding: '2rem' }}>
      <h1>Login with Phone</h1>
      {!otpRequested ? (
        <PhoneNumberInput onOtpRequest={handleOtpRequest} />
      ) : (
        <OtpVerification phone={phone!} onVerify={handleVerify} />
      )}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
