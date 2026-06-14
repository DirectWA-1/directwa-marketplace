import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, category, condition, location } = await request.json();

    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const prompt = `You are an expert copywriter for a South African marketplace called DirectWA.
Write a compelling, natural, and trustworthy product description for the following item.

Title: ${title}
Category: ${category}
Condition: ${condition}
Location: ${location || 'South Africa'}

Guidelines:
- Write in a friendly but professional tone.
- Highlight key benefits and features.
- Keep it between 80–150 words.
- Make it suitable for WhatsApp buyers in South Africa.
- Do not use overly salesy language.

Only return the description text. Do not include any extra commentary.`;

    // Using Groq (fast & free tier)
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast and good quality
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes marketplace descriptions.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate description');
    }

    const description = data.choices[0]?.message?.content?.trim();

    return NextResponse.json({ description });
  } catch (error: any) {
    console.error('AI Description Error:', error);
    return NextResponse.json({ error: error.message || 'Something went wrong' }, { status: 500 });
  }
}