import { Routes, Route } from "react-router-dom"
import Navigation from "./components/Navigation"
import Home from "./pages/Home"
import SongDetail from "./pages/SongDetail"
import SearchResults from "./pages/SearchResults"
import "./App.css"
import Test from "./pages/Test"

function App() {
  return (
    <div className="App">
      <Navigation />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/song/:id" element={<SongDetail />} />
        <Route path="/search" element={<SearchResults />} />
      </Routes>
      {/* <Test/> */}
    </div>
  )
}

export default App
