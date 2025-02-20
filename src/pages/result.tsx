import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

export default function Result() {
  const [summary, setSummary] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        // ローカルストレージからtranscriptionを取得
        const transcription = localStorage.getItem('transcription');
        
        if (!transcription) {
          throw new Error('文字起こしデータが見つかりません');
        }

        const response = await fetch('/api/summarize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ transcription })
        });

        if (!response.ok) {
          throw new Error('要約の生成に失敗しました');
        }

        const data = await response.json();
        setSummary(data.summary);
      } catch (error) {
        setError(error instanceof Error ? error.message : '要約の生成に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSummary();
  }, []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">要約を生成中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
        <button
          onClick={() => router.push('/')}
          className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          トップに戻る
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl mb-4">要約結果</h1>
      <div className="bg-gray-100 p-4 rounded">
        <pre className="whitespace-pre-line font-sans text-gray-800">{summary.replaceAll("。", "。\n")}</pre>
      </div>
      <button
        onClick={() => router.push('/')}
        className="mt-4 p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        トップに戻る
      </button>
    </div>
  );
} 