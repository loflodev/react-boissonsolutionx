import About from "../components/layouts/About";
import Contact from "../components/layouts/Contact";
import ContactForm from "../components/layouts/ContactForm";
import Hero from "../components/layouts/Hero";
import OurProduct from "../components/layouts/OurProduct";
import LoadingSpinner from "../components/common/LoadingSpinner";
import useHomePageData from "../hooks/useHomePageData";

const LoadError = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div
      role="alert"
      className="text-center p-6 max-w-md mx-auto bg-white rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-bold text-red-700 mb-4">
        Erreur de chargement
      </h2>
      <p className="text-gray-700 mb-4">
        Désolé, une erreur est survenue lors du chargement des données.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors"
      >
        Réessayer
      </button>
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
