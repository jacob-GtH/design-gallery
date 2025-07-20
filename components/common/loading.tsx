export default function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
    const sizes = {
        sm: 'h-6 w-6',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }
  return (
    <div className="flex items-center justify-center space-x-4">
      <div className={`animate-spin rounded-full ${sizes[size]} border-t-2 border-blue-500`}></div>
      <p className="mt-4 text-gray-700">جاري التحميل...</p>
    </div>
  );
}