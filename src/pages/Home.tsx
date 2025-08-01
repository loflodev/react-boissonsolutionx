import About from "../components/layouts/About";
import Contact from "../components/layouts/Contact";
import ContactForm from "../components/layouts/ContactForm";
import Hero from "../components/layouts/Hero";
import OurProduct from "../components/layouts/OurProduct";
import useHomePageData from "../hooks/useHomePageData";

const Home = () => {
  const { status, products } = useHomePageData();

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Hero />
      <OurProduct products={products} />
      <About />
      <Contact />
      <ContactForm />
    </>
  );
};

export default Home;
