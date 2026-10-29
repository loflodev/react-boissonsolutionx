import { Outlet } from "react-router-dom";
import Footer from "../components/layouts/Footer";
import Header from "../components/layouts/Header";

const HomeLayout = () => {
  return (
    <>
      <Header />
      <main id="main">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

export default HomeLayout;
