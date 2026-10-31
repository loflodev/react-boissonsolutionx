import Button from "./Button";

// Shown in place of WordPress-driven content that could not be loaded
const LoadError = () => (
  <div className="min-h-svh flex items-center justify-center bg-ink px-6">
    <div
      role="alert"
      className="text-center p-10 max-w-md mx-auto rounded-3xl border border-line bg-white/[0.03]"
    >
      <h2 className="display text-cream text-3xl mb-4">Erreur de chargement</h2>
      <p className="text-muted mb-8">
        Désolé, une erreur est survenue lors du chargement des données.
      </p>
      <Button
        label="Réessayer"
        variant="primary"
        onClick={() => window.location.reload()}
      />
    </div>
  </div>
);

export default LoadError;
