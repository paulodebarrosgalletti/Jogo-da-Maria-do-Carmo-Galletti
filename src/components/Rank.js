import React, { useState, useEffect } from "react";
import { db, auth } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "./css/Rank.css";

const Rank = () => {
  const [players, setPlayers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        // Consultar jogadores ordenados pela pontuação
        const playersCollection = collection(db, "players");
        const playersQuery = query(playersCollection, orderBy("score", "desc"));
        const playersSnapshot = await getDocs(playersQuery);

        // Mapeia para buscar os nomes dos jogadores usando o ID
        const playersList = await Promise.all(
          playersSnapshot.docs.map(async (playerDoc) => {
            const playerData = playerDoc.data();
            const userRef = doc(db, "users", playerDoc.id);
            const userSnapshot = await getDoc(userRef);
            const userName = userSnapshot.exists()
              ? userSnapshot.data().nickname || "Desconhecido"
              : "Desconhecido";

            // Ajusta pontuação para nunca ser negativa
            const adjustedScore = Math.max(playerData.score || 0, 0);

            return {
              id: playerDoc.id,
              name: userName,
              score: adjustedScore,
              rankCategory: getRankCategory(adjustedScore),
            };
          })
        );

        // Ordenar lista por pontuação e limitar aos 10 primeiros para exibição
        const topPlayers = playersList.slice(0, 10);

        // Encontrar o jogador atual
        const currentUserId = auth.currentUser.uid;
        const currentUser = playersList.find(
          (player) => player.id === currentUserId
        );

        setPlayers(topPlayers);
        setCurrentUser(currentUser);
      } catch (error) {
        console.error("Erro ao buscar jogadores:", error);
      }
    };

    fetchPlayers();
  }, []);

  // Função para determinar a categoria de rank com base na pontuação
  const getRankCategory = (score) => {
    if (score >= 400) return "Ouro";
    if (score >= 200) return "Prata";
    return "Bronze";
  };

  return (
    <div className="rank-container">
      <h2 className="rank-title">Rank</h2>

      {currentUser && (
        <div className="current-user-rank">
          <h3>Seu Ranking</h3>
          <p>
            {currentUser.name}: {currentUser.score} pontos -{" "}
            {currentUser.rankCategory}
          </p>
          <p>
            Sua posição:{" "}
            {players.findIndex((player) => player.id === currentUser.id) + 1}
          </p>
        </div>
      )}

      <h3>Top 10 Jogadores</h3>
      <ul className="rank-list">
        {players.map((player, index) => (
          <li key={player.id} className="rank-item">
            <span className="rank-position">{index + 1}.</span>
            <span className="rank-name">{player.name}</span>
            <span className="rank-score">
              {player.score} pontos - {player.rankCategory}
            </span>
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
