import { NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function POST() {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'Missing OPENAI_API_KEY' },
        { status: 500 }
      );
    }
    const client = new OpenAI({ apiKey });
    const session: any = await (client as any).chatkit.sessions.create({});
    if (!session?.client_secret) {
      return NextResponse.json(
        { error: 'No client_secret in response' },
        { status: 500 }
      );
    }
    return NextResponse.json({ client_secret: session.client_secret });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
