import React, { useState } from 'react';

interface Props {
  phone: string;
  onVerify: (otp: string, fullName: string) => void;
}

export default function OtpVerification({ phone, onVerify }: Props) {
  const [otp, setOtp] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleVerify = () => {
    if (!otp || !fullName) {
      setError('Please enter OTP and full name');
      return;
    }
    setError(null);
    onVerify(otp, fullName);
  };

  return (
    <div>
      <p>Enter the OTP sent to {phone}</p>
      <input
        type="text"
        placeholder="OTP"
        value={otp}
        onChange={e => setOtp(e.target.value)}
      />
      <input
        type="text"
        placeholder="Full Name"
        value={fullName}
        onChange={e => setFullName(e.target.value)}
      />
      <button onClick={handleVerify}>Verify & Create Profile</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
