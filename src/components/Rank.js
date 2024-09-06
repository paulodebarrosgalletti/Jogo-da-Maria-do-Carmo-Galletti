import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs, query, orderBy } from "firebase/firestore"; // Importar 'query' e 'orderBy'
import { useNavigate } from "react-router-dom";

const Rank = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      // Consultar jogadores ordenados pela pontuação
      const playersCollection = collection(db, "players");
      const playersQuery = query(playersCollection, orderBy("score", "desc")); // Ordena pela pontuação em ordem decrescente
      const playersSnapshot = await getDocs(playersQuery);
      const playersList = playersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPlayers(playersList);
    };

    fetchPlayers();
  }, []);

  return (
    <div>
      <h2>Rank</h2>
      <ul>
        {players.map((player, index) => (
          <li key={player.id}>
            {index + 1}. {player.name}: {player.score} pontos
          </li>
        ))}
      </ul>
      <button className="profile-button" onClick={() => navigate("/main")}>
        Voltar
      </button>
    </div>
  );
};

export default Rank;
