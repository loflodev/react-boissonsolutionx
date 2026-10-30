import About from "../components/layouts/About";
import Contact from "../components/layouts/Contact";
import ContactForm from "../components/layouts/ContactForm";
import Hero from "../components/layouts/Hero";
import OurProduct from "../components/layouts/OurProduct";
import Button from "../components/common/Button";
import LoadingSpinner from "../components/common/LoadingSpinner";
import useHomePageData from "../hooks/useHomePageData";

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

const Home = () => {
  const { products, heroData, isLoading, isError } = useHomePageData();

  // Static sections always render; only the WordPress-driven ones wait on data
  const renderCmsSections = () => {
    if (isLoading) return <LoadingSpinner />;
    if (isError) return <LoadError />;
    return (
      <>
        <Hero heroData={heroData} />
        <OurProduct products={products} />
      </>
    );
  };

  return (
    <>
      {renderCmsSections()}
      <About />
      <Contact />
      <ContactForm />
    </>
  );
};

export default Home;
