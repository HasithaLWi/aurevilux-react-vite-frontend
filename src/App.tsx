import NavBar from "./components/navbar/NavBar";
import Home from "./components/home/Home";
import Footer from "./components/footer/Footer";

function App() {
  return (
    <div className="min-h-screen bg-brand-black text-zinc-100 flex flex-col selection:bg-brand-burgundy selection:text-white">
      <NavBar />
      <main className="flex-1">
        <Home />
      </main>
      <Footer />
    </div>
  );
}

export default App;
