export default function Loading() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
        <h2 className="mt-4 text-xl font-medium text-gray-600">Loading...</h2>
        <p className="mt-2 text-sm text-gray-500">Please wait while we load your content</p>
      </div>
    </div>
  );
}