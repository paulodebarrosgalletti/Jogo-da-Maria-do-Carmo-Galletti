// src/components/Matchmaking.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebaseConfig";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

const Matchmaking = () => {
  const [matchId, setMatchId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const joinQueue = async () => {
      console.log("Entrando na fila de matchmaking...");

      // Adiciona o jogador à fila de matchmaking
      const matchRef = await addDoc(collection(db, "matchmaking"), {
        playerId: "player1", // Substitua com o UID real do jogador
        timestamp: new Date(),
      });

      setMatchId(matchRef.id);
      console.log("Adicionado à fila com ID:", matchRef.id);

      // Monitora a fila para verificar se há outro jogador disponível
      const q = query(
        collection(db, "matchmaking"),
        where("playerId", "!=", "player1") // Ajuste para o UID real do jogador
      );

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
          console.log("Nenhum oponente encontrado ainda...");
          return;
        }

        // Encontrar um oponente na fila
        const opponent = snapshot.docs[0];
        console.log("Oponente encontrado com ID:", opponent.id);

        if (matchRef.id !== opponent.id) {
          // Remove os dois jogadores da fila e inicia a partida
          try {
            await deleteDoc(doc(db, "matchmaking", matchRef.id)); // Remove o jogador atual da fila
            await deleteDoc(doc(db, "matchmaking", opponent.id)); // Remove o oponente da fila
            console.log("Jogadores removidos da fila, iniciando a partida...");
            navigate("/game"); // Redireciona para a tela do jogo
          } catch (error) {
            console.error("Erro ao remover jogadores da fila:", error);
          }
        }
      });

      // Limpeza ao desmontar o componente
      return () => {
        console.log("Saindo do matchmaking e cancelando inscrição...");
        unsubscribe();
        if (matchId) {
          deleteDoc(doc(db, "matchmaking", matchId)).catch((error) =>
            console.error("Erro ao sair da fila:", error)
          );
        }
      };
    };

    joinQueue().catch((error) =>
      console.error("Erro ao entrar na fila:", error)
    );
  }, [navigate, matchId]);

  return (
    <div>
      <h2>Procurando Partida...</h2>
      <p>Aguardando oponente...</p>
      <button onClick={() => navigate(-1)}>Voltar</button>{" "}
      {/* Botão para voltar */}
    </div>
  );
};

export default Matchmaking;
