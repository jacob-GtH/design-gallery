// components/ErrorMessage.tsx
interface ErrorMessageProps {
  message: string
  onRetry: () => void
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="text-center py-10">
      <p className="text-red-400 mb-4">{message}</p>
      <button 
        onClick={onRetry}
        className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        إعادة المحاولة
      </button>
    </div>
  )
}