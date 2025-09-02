

import { Route, Routes } from "react-router"
import Navbar from "./components/Navbar"

function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </div>
  )
   
}

export default App