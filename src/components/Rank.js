import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
} from "firebase/firestore"; // Importar 'doc' corretamente
import { useNavigate } from "react-router-dom";

import "./css/Rank.css";

const Rank = () => {
  const [players, setPlayers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const playersCollection = collection(db, "players");
        const playersQuery = query(playersCollection, orderBy("score", "desc"));
        const playersSnapshot = await getDocs(playersQuery);

        const playersList = await Promise.all(
          playersSnapshot.docs.map(async (playerDoc) => {
            const playerData = playerDoc.data();
            const userRef = doc(db, "users", playerDoc.id);
            const userSnapshot = await getDoc(userRef);
            const userName = userSnapshot.exists()
              ? userSnapshot.data().nickname || "Desconhecido"
              : "Desconhecido";

            return {
              id: playerDoc.id,
              name: userName,
              score: playerData.score || 0,
            };
          })
        );

        setPlayers(playersList);
      } catch (error) {
        console.error("Erro ao buscar jogadores:", error);
      }
    };

    fetchPlayers();
  }, []);

  return (
    <div className="rank-container">
      <h2 className="rank-title">Rank</h2>
      <ul className="rank-list">
        {players.map((player, index) => (
          <li key={player.id} className="rank-item">
            <span className="rank-position">{index + 1}.</span>
            <span className="rank-name">{player.name}</span>
            <span className="rank-score">{player.score} pontos</span>
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
