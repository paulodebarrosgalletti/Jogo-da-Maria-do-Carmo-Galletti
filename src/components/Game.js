// src/components/Game.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  arrayRemove,
} from "firebase/firestore";

const Game = () => {
  const { gameId } = useParams(); // Obtém o gameId da URL
  const [password, setPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState(false);
  const [opponentPassword, setOpponentPassword] = useState("");
  const [turn, setTurn] = useState(null);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState([]);
  const [opponentFeedback, setOpponentFeedback] = useState([]);
  const [gameData, setGameData] = useState(null);
  const [playerPosition, setPlayerPosition] = useState(null);
  const [opponentLeft, setOpponentLeft] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId) return;

    const gameRef = doc(db, "games", gameId);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      const data = doc.data();
      if (data) {
        setGameData(data);
        setTurn(data.turn || null);

        // Define a posição do jogador (0 ou 1)
        const playerIndex = data.players.indexOf(auth.currentUser.uid);
        if (playerIndex !== -1) {
          setPlayerPosition(playerIndex);
        }

        // Define a senha do oponente, se confirmada
        if (data.passwords && data.passwords[1 - playerPosition]) {
          setOpponentPassword("****"); // Esconde a senha do oponente
        }

        // Checa se o oponente deixou o jogo
        if (
          data.players.length < 2 &&
          data.players.includes(auth.currentUser.uid)
        ) {
          setOpponentLeft(true);
        }

        // Carrega o feedback do oponente
        if (data.feedback && data.feedback[1 - playerPosition]) {
          setOpponentFeedback(data.feedback[1 - playerPosition].messages || []);
        }
      }
    });

    return () => unsubscribe();
  }, [gameId, playerPosition]);

  const validateUniqueDigits = (input) => {
    const digits = input.split("");
    const uniqueDigits = new Set(digits);
    return uniqueDigits.size === digits.length;
  };

  const confirmPassword = async () => {
    if (password.length !== 4) {
      alert("A senha deve ter 4 dígitos.");
      return;
    }

    if (!validateUniqueDigits(password)) {
      alert("A senha não pode conter números repetidos.");
      return;
    }

    const gameRef = doc(db, "games", gameId);
    const gameSnapshot = await getDoc(gameRef);
    const game = gameSnapshot.data();
    const updatedPasswords = game.passwords || [];
    updatedPasswords[playerPosition] = password;

    await updateDoc(gameRef, {
      passwords: updatedPasswords,
    });

    setConfirmedPassword(true);

    if (updatedPasswords[0] && updatedPasswords[1]) {
      const firstTurn = Math.floor(Math.random() * 2);
      await updateDoc(gameRef, {
        turn: game.players[firstTurn], // Define quem começa
        feedback: [{ messages: [] }, { messages: [] }], // Inicializa o feedback como objetos com arrays
      });
    }
  };

  const makeGuess = async () => {
    if (guess.length !== 4) {
      alert("O palpite deve ter 4 dígitos.");
      return;
    }

    if (!validateUniqueDigits(guess)) {
      alert("O palpite não pode conter números repetidos.");
      return;
    }

    const opponentPassword = gameData.passwords[1 - playerPosition];
    const newFeedback = getFeedback(guess, opponentPassword);
    const updatedFeedback = [...feedback, { guess, message: newFeedback }];
    setFeedback(updatedFeedback);

    const gameRef = doc(db, "games", gameId);

    await updateDoc(gameRef, {
      [`feedback.${playerPosition}.messages`]: updatedFeedback, // Atualiza o feedback do jogador atual usando objetos
    });

    // Verifica se o jogador acertou a senha
    if (newFeedback.includes("4 números certos no lugar certo")) {
      alert("Parabéns! Você acertou a senha e venceu o jogo!");
      navigate("/main"); // Redireciona para o menu principal
      return;
    }

    // Alterna o turno para o outro jogador
    await updateDoc(gameRef, {
      turn: gameData.players[1 - playerPosition],
    });
  };

  const getFeedback = (guess, opponentPassword) => {
    let correctPosition = 0;
    let correctNumber = 0;
    const guessArray = guess.split("");
    const opponentArray = opponentPassword.split("");

    guessArray.forEach((num, index) => {
      if (num === opponentArray[index]) {
        correctPosition++;
      } else if (opponentArray.includes(num)) {
        correctNumber++;
      }
    });

    return `${correctPosition} números certos no lugar certo, ${correctNumber} números certos no lugar errado.`;
  };

  const leaveGame = async () => {
    // Remove o jogador atual da lista de jogadores e atualiza o jogo
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
      players: arrayRemove(auth.currentUser.uid),
    });
    navigate("/available-games"); // Redireciona para a lista de jogos disponíveis
  };

  if (!gameData) return <p>Carregando dados do jogo...</p>;

  return (
    <div style={{ display: "flex", justifyContent: "space-between" }}>
      <div style={{ width: "45%" }}>
        <h2>Sua Área</h2>
        {opponentLeft && <p>O oponente abandonou a partida.</p>}
        <p>Jogador: {auth.currentUser.displayName}</p>
        {confirmedPassword ? (
          <div>
            <h3>Sua senha: {password}</h3>
            <h3>Senha do oponente: {opponentPassword}</h3>
          </div>
        ) : (
          <div>
            <input
              type="password"
              placeholder="Digite sua senha de 4 dígitos"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              maxLength={4}
            />
            <button onClick={confirmPassword}>Confirmar Senha</button>
          </div>
        )}
        {turn === auth.currentUser.uid && (
          <div>
            <h3>Seu turno! Tente adivinhar a senha do oponente.</h3>
            <input
              type="text"
              placeholder="Palpite de 4 dígitos"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              maxLength={4}
            />
            <button onClick={makeGuess}>Fazer Palpite</button>
          </div>
        )}
        {turn !== auth.currentUser.uid && (
          <p>Aguardando o palpite do oponente...</p>
        )}
        <div>
          <h4>Seus Palpites:</h4>
          <ul>
            {feedback.map((fb, index) => (
              <li key={index}>
                Palpite: {fb.guess} - {fb.message}
              </li>
            ))}
          </ul>
        </div>
        <button onClick={leaveGame}>Sair do Jogo</button>{" "}
        {/* Botão para sair do jogo */}
      </div>

      <div style={{ width: "45%" }}>
        <h2>Área do Oponente</h2>
        <h4>Palpites do Oponente:</h4>
        <ul>
          {opponentFeedback.map((fb, index) => (
            <li key={index}>
              Palpite: {fb.guess} - {fb.message}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Game;
