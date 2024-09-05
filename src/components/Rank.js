// src/components/Rank.js
import React, { useState, useEffect } from "react";
import { db } from "../firebaseConfig";
import { collection, getDocs } from "firebase/firestore";

const Rank = () => {
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const playersCollection = collection(db, "players");
      const playersSnapshot = await getDocs(playersCollection);
      const playersList = playersSnapshot.docs.map((doc) => doc.data());
      setPlayers(playersList);
    };

    fetchPlayers();
  }, []);

  return (
    <div>
      <h2>Rank</h2>
      <ul>
        {players.map((player, index) => (
          <li key={index}>
            {player.name}: {player.score} pontos
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Rank;
