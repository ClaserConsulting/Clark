import React, { useEffect, useState } from "react";
import styled from "styled-components";
import { Eye, EyeOff } from "lucide-react";
import { getCurrentUser } from "../../services/authService";

const Container = styled.div`
  max-width: 600px;
  margin: 5vh auto;
  padding: 2rem;
  background-color: ${({ theme }) => theme.card};
  color: ${({ theme }) => theme.text};
  border-radius: 12px;
  box-shadow: 0 4px 16px ${({ theme }) => theme.tileShadow};
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  text-align: center;
`;

const Field = styled.div`
  margin-bottom: 1.2rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid ${({ theme }) => theme.hoverBg};
  border-radius: 6px;
  background-color: ${({ theme }) => theme.background};
  color: ${({ theme }) => theme.text};
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.accent};
  }
`;

const Button = styled.button`
  display: block;
  width: 100%;
  padding: 10px 20px;
  background-color: ${({ theme }) => theme.primary};
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  margin: 1rem 0;

  &:hover {
    background-color: ${({ theme }) => theme.accent};
  }
`;

const PasswordField = styled.div`
  position: relative;
`;

const ToggleIcon = styled.span`
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
`;

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    taxCode: "",
    address: "",
    billingAddress: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showReset, setShowReset] = useState(false);

  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser((prev) => ({ ...prev, ...currentUser }));
    }
  }, []);

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    if (showReset && user.password !== user.confirmPassword) {
      alert("Le password non coincidono.");
      return;
    }
    const updated = { ...getCurrentUser(), ...user };
    delete updated.confirmPassword;
    localStorage.setItem("gs_user", JSON.stringify(updated));
    alert("Profilo aggiornato");
  };

  return (
    <Container>
      <Title>👤 Il mio profilo</Title>

      <Field>
        <Label>Nome visualizzato</Label>
        <Input name="name" value={user.name} onChange={handleChange} />
      </Field>

      <Field>
        <Label>Email (non modificabile)</Label>
        <Input name="email" value={user.email} readOnly />
      </Field>

      <Field>
        <Label>Data di nascita</Label>
        <Input type="date" name="birthDate" value={user.birthDate} onChange={handleChange} />
      </Field>

      <Field>
        <Label>Codice Fiscale</Label>
        <Input name="taxCode" value={user.taxCode} onChange={handleChange} />
      </Field>

      <Field>
        <Label>Indirizzo di residenza</Label>
        <Input name="address" value={user.address} onChange={handleChange} />
      </Field>

      <Field>
        <Label>Indirizzo di fatturazione</Label>
        <Input name="billingAddress" value={user.billingAddress} onChange={handleChange} />
      </Field>

      {showReset ? (
        <>
          <Field>
            <Label>Nuova password</Label>
            <PasswordField>
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={user.password}
                onChange={handleChange}
              />
              <ToggleIcon onClick={() => setShowPassword((p) => !p)}>
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </ToggleIcon>
            </PasswordField>
          </Field>

          <Field>
            <Label>Conferma password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={user.confirmPassword}
              onChange={handleChange}
            />
          </Field>

          <Button type="button" onClick={() => setShowReset(false)}>Annulla reset password</Button>
        </>
      ) : (
        <Button type="button" onClick={() => setShowReset(true)}>Reimposta password</Button>
      )}

      <Button onClick={handleSave}>💾 Salva modifiche</Button>
    </Container>
  );
};

export default Profile;
