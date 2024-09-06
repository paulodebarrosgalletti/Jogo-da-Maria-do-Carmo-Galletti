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
  setDoc,
} from "firebase/firestore";
import "./css/Game.css";

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

    if (newFeedback.includes("4 números certos no lugar certo")) {
      setGameOver(true);
      setWinner(auth.currentUser.displayName);

      const winnerRef = doc(db, "players", auth.currentUser.uid);
      const loserId = gameData.players[1 - playerPosition];
      const loserRef = doc(db, "players", loserId);

      // Verifica se o documento do vencedor existe; se não, cria um novo
      const winnerSnapshot = await getDoc(winnerRef);
      if (!winnerSnapshot.exists()) {
        await setDoc(winnerRef, {
          name: auth.currentUser.displayName,
          score: 20,
        });
      } else {
        await updateDoc(winnerRef, {
          score: increment(20),
        });
      }

      // Verifica se o documento do perdedor existe; se não, cria um novo
      const loserSnapshot = await getDoc(loserRef);
      if (!loserSnapshot.exists()) {
        await setDoc(loserRef, { name: loserId, score: -20 });
      } else {
        await updateDoc(loserRef, {
          score: increment(-20),
        });
      }

      await updateDoc(gameRef, {
        status: "completed",
        winner: auth.currentUser.displayName,
      });

      return;
    }

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
      <div className="game-section">
        {gameOver ? (
          <div className="game-over-message">
            {gameEndedBy ? (
              <>
                <h2>
                  O jogo foi encerrado por desistência de "{gameEndedBy}".
                </h2>
                <p>Ambos os jogadores devem clicar em "Sair do Jogo".</p>
              </>
            ) : (
              <>
                <h2>O jogador "{winner}" ganhou!</h2>
                <p>O jogo foi encerrado.</p>
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
              {turn === auth.currentUser.uid && (
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
              {turn !== auth.currentUser.uid && (
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
    </div>
  );
};

export default Game;
