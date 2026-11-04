import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppContextProvider } from "./context/AppContext";
import NavBar from "./components/navbar/NavBar";
import Home from "./components/home/Home";
import Shop from "./components/shop/Shop";
import Footer from "./components/footer/Footer";

function App() {
  return (
    <AppContextProvider>
      <Router>
        <div className="min-h-screen bg-brand-black text-zinc-100 flex flex-col selection:bg-brand-burgundy selection:text-white">
          <NavBar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AppContextProvider>
  );
}

export default App;
