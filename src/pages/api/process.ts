import type { NextApiRequest, NextApiResponse } from 'next';
import youtubeDl from 'youtube-dl-exec';
import { spawn } from 'child_process';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  const tmpDir = path.join(process.cwd(), 'tmp');
  
  try {
    const audioFile = path.join(tmpDir, 'audio.mp3');
    
    // ダウンロード開始
    await youtubeDl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: audioFile
    });

    // 文字起こし処理
    const pythonProcess = spawn('python', ['whisper_transcribe.py', audioFile]);
    
    let transcriptionError = '';
    
    pythonProcess.stderr.on('data', (data) => {
      transcriptionError += data.toString();
    });

    await new Promise((resolve, reject) => {
      pythonProcess.on('close', (code) => {
        if (code === 0) {
          resolve(null);
        } else {
          reject(new Error(transcriptionError || '文字起こし処理に失敗しました'));
        }
      });
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : '処理に失敗しました'
    });
  }
} 