import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Result() {
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch('/api/summarize');
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '要約の取得に失敗しました');
        }
        const data = await response.json();
        setSummary(data.summary);
      } catch (error) {
        setError(error instanceof Error ? error.message : '要約の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSummary();
  }, []);

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl">解析結果</h1>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          戻る
        </button>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">要約を生成中...</p>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg p-6">
          <pre className="whitespace-pre-line font-sans text-gray-800">
            {summary.replaceAll("。", "。\n")}
          </pre>
        </div>
      )}
    </div>
  );
} 