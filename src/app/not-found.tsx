import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <h2 className="text-6xl font-bold text-green-600 mb-4">404</h2>
        <h3 className="text-xl font-bold text-white mb-2">Página não encontrada</h3>
        <p className="text-gray-400 mb-6">
          A página que procura não existe ou foi movida.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium inline-block"
        >
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
