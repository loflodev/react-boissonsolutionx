const LoadingSpinner = () => {
  return (
    // Holds the hero's place (same dark ground) instead of blacking out the
    // whole page, so the content arrives where the placeholder was
    <div
      role="status"
      className="min-h-svh bg-ink flex items-center justify-center"
    >
      <div className="flex flex-col items-center">
        <div
          aria-hidden="true"
          className="animate-spin rounded-full size-10 border-2 border-white/15 border-t-brand mb-5"
        ></div>
        <p className="text-muted text-sm tracking-wide">Chargement…</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
