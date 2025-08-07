import React, { useState } from "react";
import { login } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {getCurrentUser} from "../services/authService";
import styled from "styled-components";
import { ReactComponent as OTPIcon } from "../assets/icons/otp.svg";
import { ReactComponent as DocumentIcon } from "../assets/icons/document.svg";
import { ReactComponent as FinanceIcon } from "../assets/icons/finance.svg";
import { ReactComponent as LockIcon } from "../assets/icons/lock.svg";
import { ReactComponent as LineIcon } from "../assets/icons/line.svg";
import { ReactComponent as OctopusIcon } from "../assets/icons/octopus.svg";
import { ReactComponent as UserIcon } from "../assets/icons/user.svg";
import BackgroundSVG from "../assets/icons/test-background.png";

const user = getCurrentUser();
const hasName = Boolean(user?.name);
const name = hasName ? user.name : "Log in to start!";

const Input = styled.input`
  width: 100%;
  background: #ffffffff;
  opacity: 0.5;
  padding: 10px;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 8px;
`;

const ErrorText = styled.p`
  color: red;
  font-size: 0.9rem;
  margin-top: 0.5rem;
`;

const PageWrapper = styled.div`
  height: 100vh;
  width: 100vw;
  background-color: #004b4fff;
  background-image: url(${BackgroundSVG});
  background-size: center;
  background-repeat: repeat;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
`;

const LogoArea = styled.div`
  position: absolute;
  top: 0px;
  left: 40px;
  color: white;
  h1 {
    font-family: 'Playfair Display', serif;
    color: #fdf2d2ff;
    position:absolute;
    margin-top: 2rem;
    font-size: 15rem;
    line-height: 1;
  }
  p {
    font-family: 'Playfair Display', serif;
    font-size: 4.5rem;
    opacity: 0.7;
    margin-top: 14.2rem;
    margin-left: 10.2rem;
  }
  .cursive {
    font-family: 'Great Vibes', cursive;
    color: #fdf2d2ff;
    position:absolute;
    margin-top: -8rem;
    font-size: 7.5rem;
    opacity: 1;
    margin-left: 18.5rem;
  }
`;

const Card = styled.div`
  background: #fdf2d2ff;
  padding: 2rem;
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 340px;
  text-align: center;
  margin-top: 50px;
`;

const Avatar = styled.div`
  background: #004b4fff;
  color: #fffff;
  border-radius: 50%;
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin: 0 auto 1rem;
`;

const Welcome = styled.div`
  font-size: 1rem;
  color: #444;
  span {
    display: block;
    font-weight: bold;
    font-size: 1.2rem;
    color: #004b4f;
  }
`;

const LoginButton = styled.button`
  margin: 1rem 0;
  padding: 0.8rem;
  background: #5fac8cff;
  color: white;
  border: none;
  border-radius: 10px;
  width: 100%;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
`;

const SwitchAccount = styled.div`
  font-size: 0.85rem;
  color: #004b4f;
  text-decoration: underline;
  cursor: pointer;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: 0.2rem;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  text-align: center;
  font-size: 0.9rem;
  color: white;

  svg {
    width: 28px;
    height: 28px;
    margin-top: 2rem;
    stroke: white;
    stroke-width: 1.4;
  }
`;

const OctopusLogo = styled.div`
  position: absolute;
  top: 105px;
  left: 630px;
  display: flex;
`;

const ActionItem = styled.div`
  display: flex;
  color: #fdf2d2ff;
  font-weight: bold;
  flex-direction: column;
  align-items: center;
  max-width: 70px;

  svg {
    stroke: #fdf2d2ff;
    stroke-width: 1.5;
    width: 28px;
    height: 28px;
    margin-bottom: 8px;
    cursor: pointer
  }

  span {
    line-height: 1.2;
  }
`;  

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 10vh;
  gap: 2rem;
`;

//

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = () => {
    const result = login(username, password);
    if (result) {
      navigate("/"); // oppure navigate("/dashboard");
    } else {
      setError("Credenziali non valide");
    }
  };
  
  //

  return (
    <PageWrapper>
      <LogoArea>
        <h1>Clerk</h1>
        <p>your personal</p>
        <div className="cursive">organizer</div>
      </LogoArea>
        
      <OctopusLogo>
        <OctopusIcon />
      </OctopusLogo>

    <ContentWrapper>
      <Card>
        <Avatar>
          {hasName
            ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
            : <UserIcon style={{ width: 24, height: 24 }} />}
        </Avatar>

        <Welcome>
          Hello, <span>{name}</span>
        </Welcome>

        <Input
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <ErrorText>{error}</ErrorText>}

        <LoginButton onClick={handleLogin}>Log in</LoginButton>
        <SwitchAccount>Log in with another account</SwitchAccount>
      </Card>

      <ActionGroup>
        <ActionItem>
          <OTPIcon />
          <span>Your passwords</span>
        </ActionItem>
        <ActionItem>
          <LineIcon />
        </ActionItem>
        <ActionItem>
          <DocumentIcon />
          <span>View documents</span>
        </ActionItem>
        <ActionItem>
          <LineIcon />
        </ActionItem>
        <ActionItem>
          <FinanceIcon />
          <span>Manage finances</span>
        </ActionItem>
        <ActionItem>
          <LineIcon />
        </ActionItem>
        <ActionItem>
          <LockIcon />
          <span>Log in trouble?</span>
        </ActionItem>
      </ActionGroup>
    </ContentWrapper>
    </PageWrapper>
  );
};

export default LoginPage;

