import { supabase } from '../supabase';

export async function signInWithPhone(phone: string) {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  if (error) throw error;
  // Supabase will send an OTP to the user's phone now
}

export async function verifyOtpAndInsertUser(otp: string, fullName: string) {
  const { data, error } = await supabase.auth.verifyOtp({
    phone: '', // We'll update this later from the user input
    token: otp,
    type: 'sms',
  });

  if (error) throw error;

  // If verification is successful, data.user is available
  if (data?.user) {
    const { user } = data;
    const { error: insertError } = await supabase.from('users').insert({
      id: user.id,
      phone_number: user.phone,
      full_name: fullName,
      email: user.email,
    });
    if (insertError) throw insertError;
    return user;
  }
  throw new Error('OTP verification failed');
}
