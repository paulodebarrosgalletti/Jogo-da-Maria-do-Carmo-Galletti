import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import {
  doc,
  updateDoc,
  getDoc,
  onSnapshot,
  arrayRemove,
  increment,
} from "firebase/firestore";
import "./css/Game.css";

// Função para obter o nome do jogador a partir do ID
const getPlayerName = async (playerId) => {
  const userRef = doc(db, "users", playerId);
  const userSnapshot = await getDoc(userRef);
  return userSnapshot.exists()
    ? userSnapshot.data().nickname || "Desconhecido"
    : "Desconhecido";
};

const Game = () => {
  const { gameId } = useParams();
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
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState("");
  const [pointsChange, setPointsChange] = useState(0); // Estado para guardar os pontos ganhos ou perdidos
  const [gameEndedBy, setGameEndedBy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId) return;

    const gameRef = doc(db, "games", gameId);
    const unsubscribe = onSnapshot(gameRef, (doc) => {
      const data = doc.data();
      if (data) {
        setGameData(data);
        setTurn(data.turn || null);

        const playerIndex = data.players.indexOf(auth.currentUser.uid);
        if (playerIndex !== -1) {
          setPlayerPosition(playerIndex);
        }

        if (data.players.includes("AI_PLAYER")) {
          // Lógica para IA fazer jogadas automáticas com atraso
          if (data.turn === "AI_PLAYER" && confirmedPassword) {
            setTimeout(() => handleAIMove(data), 2000); // IA faz o palpite com atraso de 2 segundos
          }
        }

        if (data.passwords && data.passwords[1 - playerPosition]) {
          setOpponentPassword("****");
        }

        if (
          data.players.length < 2 &&
          data.players.includes(auth.currentUser.uid)
        ) {
          setOpponentLeft(true);
        }

        if (data.feedback && data.feedback[1 - playerPosition]) {
          setOpponentFeedback(data.feedback[1 - playerPosition].messages || []);
        }

        if (data.status === "completed" || data.status === "forfeited") {
          setGameOver(true);
          setWinner(data.winner || "");
          setGameEndedBy(data.endedBy || null);
        }
      }
    });

    return () => unsubscribe();
  }, [gameId, playerPosition, confirmedPassword]);

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
        turn: game.players[firstTurn],
        feedback: [{ messages: [] }, { messages: [] }],
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
      [`feedback.${playerPosition}.messages`]: updatedFeedback,
    });

    // Verifica se o jogador acertou a senha
    if (newFeedback.includes("4 números certos no lugar certo")) {
      await handleEndGame(auth.currentUser.uid);
      return;
    }

    // Alterna o turno para o outro jogador (ou IA)
    const nextTurn =
      gameData.players[1 - playerPosition] === "AI_PLAYER"
        ? "AI_PLAYER"
        : gameData.players[1 - playerPosition];
    await updateDoc(gameRef, {
      turn: nextTurn,
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

  const handleAIMove = async (gameData) => {
    if (gameData.turn === "AI_PLAYER") {
      // Simula um palpite da IA
      const aiGuess = generateRandomPassword();
      const feedbackMessage = getFeedback(
        aiGuess,
        gameData.passwords[playerPosition]
      );

      const gameRef = doc(db, "games", gameId);

      // Atualiza os palpites da IA e mantém todos os palpites na lista
      const updatedOpponentFeedback = [
        ...opponentFeedback,
        { guess: aiGuess, message: feedbackMessage },
      ];
      setOpponentFeedback(updatedOpponentFeedback);

      await updateDoc(gameRef, {
        [`feedback.${1 - playerPosition}.messages`]: updatedOpponentFeedback,
        turn: auth.currentUser.uid, // Passa o turno para o jogador
      });

      // Verifica se a IA ganhou
      if (feedbackMessage.includes("4 números certos no lugar certo")) {
        await handleEndGame("AI_PLAYER");
      }
    }
  };

  const generateRandomPassword = () => {
    let digits = [];
    while (digits.length < 4) {
      const randomDigit = Math.floor(Math.random() * 10).toString();
      if (!digits.includes(randomDigit)) {
        digits.push(randomDigit);
      }
    }
    return digits.join("");
  };

  const handleEndGame = async (winnerId) => {
    const winnerName =
      winnerId === "AI_PLAYER" ? "Computador" : await getPlayerName(winnerId);
    const gameRef = doc(db, "games", gameId);

    // Verifica se o jogo é contra a IA ou outro jogador
    const isAI = gameData.players.includes("AI_PLAYER");

    // Define os pontos ganhos ou perdidos com base no tipo de jogo
    let change = 0;
    if (isAI) {
      change = winnerId === "AI_PLAYER" ? -5 : 5; // Contra IA: -5 se perder, +5 se ganhar
    } else {
      // Sistema de apostas: gera um número aleatório entre 8 e 17
      change = Math.floor(Math.random() * (17 - 8 + 1)) + 8; // Pontos de 8 a 17
    }

    console.log(
      `Jogo contra IA: ${isAI}, Vencedor: ${winnerName}, Pontos Alterados: ${change}`
    ); // Log para depuração

    // Define o estado para exibir os pontos ganhos ou perdidos
    setPointsChange(change);

    // Atualiza o status do jogo no Firestore
    await updateDoc(gameRef, {
      status: "completed",
      winner: winnerName, // Define o nome correto do vencedor
    });

    // Ajuste de pontos para o jogador vencedor e perdedor
    const userRef = doc(db, "players", auth.currentUser.uid);
    const userSnapshot = await getDoc(userRef);

    if (userSnapshot.exists()) {
      const currentUserScore = userSnapshot.data().score || 0;

      // Determina os novos scores para o vencedor e o perdedor
      const newScoreWinner =
        winnerId === auth.currentUser.uid
          ? currentUserScore + change
          : currentUserScore;
      const newScoreLoser =
        winnerId !== auth.currentUser.uid
          ? currentUserScore - change
          : currentUserScore;

      // Atualiza os pontos do vencedor
      await updateDoc(userRef, {
        score: newScoreWinner < 0 ? 0 : newScoreWinner, // Garante que o score não fique negativo
      }).catch((error) => {
        console.error(
          "Erro ao atualizar pontos do vencedor no Firestore:",
          error
        );
      });

      // Atualiza os pontos do perdedor
      const opponentId = gameData.players.find((player) => player !== winnerId);
      if (opponentId) {
        const opponentRef = doc(db, "players", opponentId);
        const opponentSnapshot = await getDoc(opponentRef);
        if (opponentSnapshot.exists()) {
          const opponentScore = opponentSnapshot.data().score || 0;
          const updatedOpponentScore =
            opponentScore - change < 0 ? 0 : opponentScore - change;

          await updateDoc(opponentRef, {
            score: updatedOpponentScore, // Atualiza o score do perdedor
          }).catch((error) => {
            console.error(
              "Erro ao atualizar pontos do perdedor no Firestore:",
              error
            );
          });
        }
      }

      // Mensagem clara sobre a mudança de pontos
      if (winnerId === auth.currentUser.uid) {
        alert(`Você ganhou ${change} pontos do oponente!`);
      } else {
        alert(`Você perdeu ${change} pontos para o oponente.`);
      }
    } else {
      console.error("Documento do usuário não encontrado no Firestore");
    }

    setGameOver(true);
    setWinner(winnerName); // Define o vencedor no estado
  };

  const leaveGame = async () => {
    const gameRef = doc(db, "games", gameId);
    await updateDoc(gameRef, {
      players: arrayRemove(auth.currentUser.uid),
      status: "forfeited",
      endedBy: auth.currentUser.displayName,
    });
    setGameOver(true);
    setGameEndedBy(auth.currentUser.displayName);
  };

  if (!gameData) return <p>Carregando dados do jogo...</p>;

  return (
    <div className="game-container">
      {gameOver ? (
        <div className="game-over-message">
          {gameEndedBy ? (
            <>
              <h2>O jogo foi encerrado por desistência de "{gameEndedBy}".</h2>
              <p>Ambos os jogadores devem clicar em "Sair do Jogo".</p>
            </>
          ) : (
            <>
              <h2>O jogador "{winner}" ganhou!</h2>
              <p>O jogo foi encerrado.</p>
              <p>
                {pointsChange > 0
                  ? `Você ganhou ${pointsChange} pontos!`
                  : `Você perdeu ${Math.abs(pointsChange)} pontos!`}
              </p>
            </>
          )}
          <button
            className="game-button"
            onClick={() => navigate("/available-games")}
          >
            Sair do Jogo
          </button>
        </div>
      ) : (
        <>
          <div className="game-area">
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
                  className="game-input"
                  type="password"
                  placeholder="Digite sua senha de 4 dígitos"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  maxLength={4}
                />
                <button className="game-button" onClick={confirmPassword}>
                  Confirmar Senha
                </button>
              </div>
            )}
            {confirmedPassword && turn === auth.currentUser.uid && (
              <div>
                <h3>Seu turno! Tente adivinhar a senha do oponente.</h3>
                <input
                  className="game-input"
                  type="text"
                  placeholder="Palpite de 4 dígitos"
                  value={guess}
                  onChange={(e) => setGuess(e.target.value)}
                  maxLength={4}
                />
                <button className="game-button" onClick={makeGuess}>
                  Fazer Palpite
                </button>
              </div>
            )}
            {confirmedPassword && turn !== auth.currentUser.uid && (
              <p>Aguardando o palpite do oponente...</p>
            )}
            <div>
              <h4>Seus Palpites:</h4>
              <ul className="game-list">
                {feedback.map((fb, index) => (
                  <li key={index} className="game-item">
                    Palpite: {fb.guess} - {fb.message}
                  </li>
                ))}
              </ul>
            </div>
            <button className="game-button" onClick={leaveGame}>
              Sair do Jogo
            </button>
          </div>

          <div className="game-area">
            <h2>Área do Oponente</h2>
            <h4>Palpites do Oponente:</h4>
            <ul className="game-list">
              {opponentFeedback.map((fb, index) => (
                <li key={index} className="game-item">
                  Palpite: {fb.guess} - {fb.message}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Game;
