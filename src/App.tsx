import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import HomeLayout from "./layout/HomeLayout";

// The router itself is provided by the entry point:
// BrowserRouter in the browser, StaticRouter during the build-time prerender
function App() {
  return (
    <Routes>
      <Route element={<HomeLayout />}>
        <Route path="/" element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
