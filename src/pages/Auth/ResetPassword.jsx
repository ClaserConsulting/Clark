import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 400px;
  margin: 10vh auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.card};
  border-radius: 12px;
  box-shadow: 0 4px 16px ${({ theme }) => theme.tileShadow};
`;

const Title = styled.h2`
  margin-bottom: 1rem;
  text-align: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.hoverBg};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  margin-bottom: 1rem;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: ${({ theme }) => theme.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.accent};
  }
`;

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Le password non coincidono.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <Container>
      <Title>🔁 Reimposta password</Title>
      {submitted ? (
        <p>Password aggiornata con successo!</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Nuova password</label>
          <Input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <label>Conferma password</label>
          <Input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <Button type="submit">Conferma</Button>
        </form>
      )}
    </Container>
  );
};

export default ResetPassword;
