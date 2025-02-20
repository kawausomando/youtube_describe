import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

// OpenAI API の設定（環境変数から API キーを取得）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if(req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  const { transcription } = req.body;
  if (!transcription) {
    return res.status(400).json({ error: 'リクエストボディに transcription を含めてください。' });
  }
  
  try {
    // OpenAI の ChatCompletion API にリクエストして、日本語訳と要約を生成
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '以下の文章をまず日本語に翻訳し、その翻訳結果をもとに簡潔な要約を作成してください。' +
                   '回答では「日本語訳」と「要約」を明確に分けて出力してください。'
        },
        { role: 'user', content: transcription }
      ],
      temperature: 0.7
    });

    const output = response.choices[0].message.content;
    res.status(200).json({ summary: output });
  } catch (error) {
    console.error('Error in summarize API:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'エラーが発生しました' });
  }
} 