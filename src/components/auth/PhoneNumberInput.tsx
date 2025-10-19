import React, { useState } from 'react';

interface Props {
  onOtpRequest: (phone: string) => void;
}

export default function PhoneNumberInput({ onOtpRequest }: Props) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSendOtp = () => {
    if (!phone) {
      setError('Please enter a phone number');
      return;
    }
    setError(null);
    onOtpRequest(phone);
  };

  return (
    <div>
      <input
        type="tel"
        placeholder="+1234567890"
        value={phone}
        onChange={e => setPhone(e.target.value)}
      />
      <button onClick={handleSendOtp}>Send OTP</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
