import About from "../components/layouts/About";
import Contact from "../components/layouts/Contact";
import ContactForm from "../components/layouts/ContactForm";
import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";
import Hero from "../components/layouts/Hero";
import OurProduct from "../components/layouts/OurProduct";

const Home = () => {
  return (
    <>
      <Header />
      <Hero />
      <OurProduct />
      <About />
      <Contact />
      <ContactForm />
      <Footer />
    </>
  );
};

export default Home;
