import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const transcriptionPath = path.join(process.cwd(), 'tmp', 'transcription.txt');
    
    if (!fs.existsSync(transcriptionPath)) {
      return res.status(404).json({ error: '文字起こしファイルが見つかりません' });
    }

    const transcription = fs.readFileSync(transcriptionPath, 'utf8');
    
    const response = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: '以下の文章をまず全文日本語に翻訳し全文出力してください、その翻訳文を元に簡潔な要約も作成してください。回答では、「日本語訳」と「要約」を明確に分けて出力してください。「要約」は箇条書きしてください'
        },
        { role: 'user', content: transcription }
      ],
      temperature: 0.7
    });

    res.status(200).json({ summary: response.choices[0].message.content });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: '要約の生成に失敗しました' });
  }
} 