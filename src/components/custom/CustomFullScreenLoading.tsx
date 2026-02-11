
export const CustomFullScreenLoading = () => {
  return (
    <div className="flex items-center justify-center h-screen">
        <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <p className="text-lg font-medium">Espere un momento...</p>
        </div>
    </div>
  )
};
