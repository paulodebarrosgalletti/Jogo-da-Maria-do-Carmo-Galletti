import React from "react";
import "./css/Rules.css";

const Rules = () => {
  return (
    <div className="rules-container">
      <h2>Regras do Jogo e Plataforma</h2>
      <section className="rules-section">
        <h3>Objetivo do Jogo</h3>
        <p>
          O objetivo do jogo é adivinhar a senha secreta de 4 dígitos do seu
          oponente antes que ele adivinhe a sua. Cada senha deve ser única, sem
          números repetidos.
        </p>
      </section>

      <section className="rules-section">
        <h3>Como Jogar</h3>
        <ol>
          <li>
            Cada jogador escolhe uma senha de 4 dígitos sem números repetidos.
          </li>
          <li>
            Os jogadores se alternam tentando adivinhar a senha do oponente.
          </li>
          <li>
            A cada palpite, o jogador recebe feedback sobre quantos dígitos
            estão corretos e na posição certa, e quantos estão corretos, mas na
            posição errada.
          </li>
          <li>
            O primeiro jogador a adivinhar corretamente a senha do oponente
            vence o jogo.
          </li>
        </ol>
      </section>

      <section className="rules-section">
        <h3>Pontuação</h3>
        <ul>
          <li>
            Jogos contra outros jogadores: +20 pontos por vitória, -20 pontos
            por derrota.
          </li>
          <li>
            Jogos contra o Computador (IA): +5 pontos por vitória, -5 pontos por
            derrota.
          </li>
          <li>Pontuação mínima é 0, não há pontos negativos.</li>
        </ul>
      </section>

      <section className="rules-section">
        <h3>Regras da Plataforma</h3>
        <p>
          Nossa plataforma permite que você jogue contra amigos ou contra um
          computador (IA). As partidas são organizadas automaticamente, e você
          pode acompanhar seu progresso e ranking no menu de perfil.
        </p>
        <p>
          Lembre-se de jogar com responsabilidade e respeitar os outros
          jogadores. Divirta-se e boa sorte!
        </p>
      </section>

      <button className="rules-button" onClick={() => window.history.back()}>
        Voltar
      </button>
    </div>
  );
};

export default Rules;
