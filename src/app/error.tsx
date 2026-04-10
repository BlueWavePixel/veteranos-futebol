"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("App error:", error.message);
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-white mb-4">Algo correu mal</h2>
        <p className="text-gray-400 mb-6">
          Ocorreu um erro inesperado. Por favor tente novamente.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
