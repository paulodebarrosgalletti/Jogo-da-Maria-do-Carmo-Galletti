// src/App.js
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import MainMenu from "./components/MainMenu";
import Profile from "./components/Profile";
import Rank from "./components/Rank";
import Matchmaking from "./components/Matchmaking"; // Se ainda precisar desta rota
import AvailableGames from "./components/AvailableGames"; // Nova tela de jogos disponíveis
import Game from "./components/Game"; // Tela do jogo

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/main" element={<MainMenu />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rank" element={<Rank />} />
        <Route path="/matchmaking" element={<Matchmaking />} />{" "}
        {/* Se necessário */}
        <Route path="/available-games" element={<AvailableGames />} />{" "}
        {/* Nova rota */}
        <Route path="/game" element={<Game />} />
      </Routes>
    </Router>
  );
}

export default App;
