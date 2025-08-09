import { Outlet } from "react-router-dom";
import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import { useEffect, useState } from "react";
import LoadingSpinner from "../components/common/LoadingSpinner";
import useHomePageData from "../hooks/useHomePageData";

const HomeLayout = () => {

  const { status, isLoading } = useHomePageData();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    // Set initial load to false after first render
    setIsInitialLoad(false);
  }, []);

  // Show loading spinner on initial load or while data is being fetched
  if (isLoading || isInitialLoad) {
    return <LoadingSpinner />;
  }

  // Show error state if data fetching fails
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center p-6 max-w-md mx-auto bg-white rounded-xl shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Erreur de chargement
          </h2>
          <p className="text-gray-700 mb-4">
            Désolé, une erreur est survenue lors du chargement des données.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
};

export default HomeLayout;
