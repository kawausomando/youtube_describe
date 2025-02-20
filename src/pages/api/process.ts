import type { NextApiRequest, NextApiResponse } from 'next';
import youtubeDl from 'youtube-dl-exec';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url } = req.body;
  
  try {
    // 一時ディレクトリの作成（存在しなければ）
    const tmpDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }

    const audioFile = path.join(tmpDir, 'audio.mp3');
    // audio.mp3 が既に存在している場合は削除して上書き保存できるようにする
    if (fs.existsSync(audioFile)) {
      fs.unlinkSync(audioFile);
    }
    
    // youtube-dl を使って、指定した URL の動画から音声ファイルをダウンロード
    await youtubeDl(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      output: audioFile
    });

    // Python の文字起こしスクリプト（whisper_transcribe.py）を実行
    const pythonProcess = spawn('python', ['whisper_transcribe.py', audioFile]);
    
    let transcriptionError = '';
    let transcriptionOutput = '';
    
    // stderr の情報をキャプチャ
    pythonProcess.stderr.on('data', (data) => {
      transcriptionError += data.toString();
    });

    // stdout から文字起こし結果を受け取る
    pythonProcess.stdout.on('data', (data) => {
      transcriptionOutput += data.toString();
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

    res.status(200).json({ transcription: transcriptionOutput });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : '処理に失敗しました'
    });
  }
} 