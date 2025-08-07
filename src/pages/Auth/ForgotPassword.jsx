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

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <Container>
      <Title>🔐 Recupera password</Title>
      {submitted ? (
        <p>Se l'email è registrata, riceverai un link per reimpostare la password.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <label>Inserisci la tua email</label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="esempio@email.com"
          />
          <Button type="submit">Invia link</Button>
        </form>
      )}
    </Container>
  );
};

export default ForgotPassword;
