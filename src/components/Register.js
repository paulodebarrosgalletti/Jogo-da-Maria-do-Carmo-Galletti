// src/components/Register.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { doc, setDoc } from "firebase/firestore";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      // Criação do usuário com Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Salvando informações adicionais no Firestore
      await setDoc(doc(db, "users", user.uid), {
        firstName: firstName,
        lastName: lastName,
        nickname: nickname,
        email: email,
        createdAt: new Date(),
      });

      navigate("/main"); // Redireciona para o menu principal após o registro bem-sucedido
    } catch (err) {
      console.error("Erro ao registrar:", err.message);
      setError(`Erro: ${err.message}`);
    }
  };

  return (
    <div>
      <h2>Registrar</h2>
      <form onSubmit={handleRegister}>
        <input
          type="text"
          placeholder="Nome"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Sobrenome"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Apelido"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Registrar</button>
        {error && <p>{error}</p>}
      </form>
      <button onClick={() => navigate("/")}>Voltar para Login</button>
    </div>
  );
};

export default Register;
