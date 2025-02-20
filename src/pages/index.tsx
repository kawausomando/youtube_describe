import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<'idle' | 'downloading' | 'transcribing' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setStatus('downloading');
    
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '処理に失敗しました');
      }
      
      router.push('/result');
    } catch (error) {
      setError(error instanceof Error ? error.message : '処理に失敗しました');
      setStatus('error');
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">YouTube動画要約アプリ</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="YouTube URLを入力"
          className="w-full p-2 border rounded mb-4"
          disabled={status === 'downloading' || status === 'transcribing'}
        />
        <button
          type="submit"
          disabled={status === 'downloading' || status === 'transcribing'}
          className={`w-full p-2 rounded text-white
            ${status === 'downloading' || status === 'transcribing'
              ? 'bg-gray-400'
              : 'bg-blue-500 hover:bg-blue-600'}`}
        >
          {status === 'idle' && '解析開始'}
          {status === 'downloading' && '動画をダウンロード中...'}
          {status === 'transcribing' && '文字起こし中...'}
          {status === 'error' && '再試行'}
        </button>
      </form>
      
      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {(status === 'downloading' || status === 'transcribing') && (
        <div className="mt-4 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">
            {status === 'downloading' ? '動画をダウンロード中...' : '文字起こしを実行中...'}
          </p>
        </div>
      )}
    </div>
  );
} 