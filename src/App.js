// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MainMenu from "./components/MainMenu";
import Profile from "./components/Profile";
import Rank from "./components/Rank";
import AvailableGames from "./components/AvailableGames";
import Game from "./components/Game"; // Importar o componente Game corretamente

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<MainMenu />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/available-games" element={<AvailableGames />} />
        <Route path="/game/:gameId" element={<Game />} />{" "}
        {/* Verifique se esta rota está correta */}
      </Routes>
    </Router>
  );
}

export default App;
