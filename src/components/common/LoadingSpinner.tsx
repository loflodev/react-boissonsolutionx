const LoadingSpinner = () => {
  return (
    // Holds the hero's place (same dark ground) instead of blacking out the
    // whole page, so the content arrives where the placeholder was
    <div
      role="status"
      className="min-h-screen bg-gray-900 flex items-center justify-center"
    >
      <div className="flex flex-col items-center">
        <div
          aria-hidden="true"
          className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-red-500 mb-4"
        ></div>
        <p className="text-white text-lg font-medium">Chargement...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
