import { NextRequest, NextResponse } from 'next/server';
import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { PayPalAgentToolkit, ALL_TOOLS_ENABLED } from '@paypal/agent-toolkit/ai-sdk';

const paypalToolkit = new PayPalAgentToolkit({
  clientId: process.env.PAYPAL_CLIENT_ID!,
  clientSecret: process.env.PAYPAL_CLIENT_SECRET!,
  configuration: {
    actions: ALL_TOOLS_ENABLED,
    // actions: {
    //   orders: { create: true, get: true },
    //   invoices: { create: true, list: true },
    //   // Extend with other actions as needed
    // },
    context: {sandbox: true},
  },
});

// 
const openai = createOpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.PAYPAL_INTERNAL_OPENAI_BASE_URL,
})

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    // Define System Prompt for controlling behavior
    // const systemPrompt = 'This is a PayPal agent. You are tasked with handling PayPal orders and providing relevant information.';
    // systemPrompt = merchant background and info:
    const systemPrompt = 'I am a plumber running a small business. I charge $120 per hour plus 50% tax. I use standard parts which typically include a new faucet costing between $50-80 and pipes for about $3 per foot. There is 12% tax for parts. My return URL is: http://localhost:3000/thank-you.';

    const { text: response } = await generateText({
      model: openai('gpt-4o'),
      tools: paypalToolkit.getTools(),
      maxSteps: 10,
      prompt: message,
      system: systemPrompt,
    });

    return NextResponse.json({ response });
  } catch (error) {
    const errorMessage = error instanceof Error
        ? error.message
        : 'An unknown error occurred';
    console.log('err', error);
    return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
    );
  }
}