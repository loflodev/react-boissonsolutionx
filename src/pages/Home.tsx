import { useState } from "react";
import About from "../components/layouts/About";
import Contact from "../components/layouts/Contact";
import ContactForm, { type Inquiry } from "../components/layouts/ContactForm";
import Hero from "../components/layouts/Hero";
import OurProduct from "../components/layouts/OurProduct";
import LoadError from "../components/common/LoadError";
import LoadingSpinner from "../components/common/LoadingSpinner";
import useHomePageData from "../hooks/useHomePageData";

const Home = () => {
  const { products, heroData, isLoading, isError } = useHomePageData();
  // A product card clicked on its way to the contact form
  const [inquiry, setInquiry] = useState<Inquiry | null>(null);

  // Static sections always render; only the WordPress-driven ones wait on data
  const renderCmsSections = () => {
    if (isLoading) return <LoadingSpinner />;
    if (isError) return <LoadError />;
    return (
      <>
        <Hero heroData={heroData} />
        <OurProduct
          products={products}
          onInquire={(product) => setInquiry({ product, at: Date.now() })}
        />
      </>
    );
  };

  return (
    <>
      {renderCmsSections()}
      <About />
      <Contact />
      <ContactForm inquiry={inquiry} />
    </>
  );
};

export default Home;
