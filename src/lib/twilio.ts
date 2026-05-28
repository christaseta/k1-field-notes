import twilio, { type Twilio } from "twilio";

let cached: Twilio | null = null;

export function twilioClient(): Twilio {
  if (cached) return cached;
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !token) {
    throw new Error(
      "Missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN. Required for SMS.",
    );
  }
  cached = twilio(sid, token);
  return cached;
}

export function twilioFromNumber(): string {
  const from = process.env.TWILIO_FROM_NUMBER;
  if (!from) {
    throw new Error(
      "Missing TWILIO_FROM_NUMBER (the Twilio number messages send from).",
    );
  }
  return from;
}

export async function sendSms(to: string, body: string): Promise<void> {
  const client = twilioClient();
  await client.messages.create({
    to,
    from: twilioFromNumber(),
    body,
  });
}
