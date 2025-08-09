import About from "../components/layouts/About";
import Contact from "../components/layouts/Contact";
import ContactForm from "../components/layouts/ContactForm";
import Hero from "../components/layouts/Hero";
import OurProduct from "../components/layouts/OurProduct";
import useHomePageData from "../hooks/useHomePageData";

const Home = () => {
  const { products, heroData } = useHomePageData();

  return (
    <>
      <Hero heroData={heroData} />
      <OurProduct products={products} />
      <About />
      <Contact />
      <ContactForm />
    </>
  );
};

export default Home;
