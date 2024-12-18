import React, { useState, useEffect } from "react";

import { signInWithEmailAndPassword } from "firebase/auth";
import { Box, Button, TextField, Typography, Alert } from "@mui/material";
import { auth } from "../firebase-config";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import logo from "../assets/Logo.png";
import { colors } from "../utilities/colors";

const Landing = () => {
  const [t] = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("");
  const [showAlert, setShowAlert] = useState(null);

  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      setLoading(true);

      if (!email || !password) {
        setAlertText(t("emailPassword"));
        setAlertSeverity("error");
        setShowAlert(true);
        setLoading(false);
        return;
      }
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const authToken = await userCredential.user.getIdToken();
      localStorage.setItem("token", authToken);
      localStorage.setItem("uid", userCredential?.user?.uid);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setAlertText(t("fillDetails") + " " + error.message);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

  function handleInteraction(route) {
    if (route === "hotel") {
      window.location.href = "https://hotel-goganja.web.applogin";
    } else {
      navigate("/login");
    }
  }

  useEffect(() => {
    const timeId = setTimeout(() => {
      setShowAlert(false);
    }, 5000);

    return () => {
      clearTimeout(timeId);
    };
  }, [showAlert]);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: colors?.backgroundWhite,
      }}
    >
      <Box
        sx={{
          width: "40%",
          borderRadius: 5,
          backgroundColor: colors?.lightWhite,
          boxShadow: "0px 3px 10px 0px #9999991A",
        }}
      >
        <div
          style={{
            width: "100%",
            justifyContent: "center",
            display: "flex",
            marginTop: 43,
          }}
        >
          <img
            src={logo}
            style={{
              width: 141,
              height: 108,
              bottom: 20,
            }}
            alt={"GoGanja Logo"}
            loading="eager"
          />
        </div>

        <Typography
          level="h1"
          fontSize="32px"
          fontWeight="600"
          style={{ textAlign: "center", paddingTop: 16, paddingBottom: 8 }}
        >
          {t("whatsYourBusiness")}
        </Typography>

        <Typography
          level="h2"
          fontSize="16px"
          fontWeight="400"
          style={{ textAlign: "center" }}
        >
          {t("chooseTheNecessaryFields")}
        </Typography>

        <Box
          sx={{
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            marginTop: "40px",
            marginBottom: "60px",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            onClick={() => handleInteraction("hotel")}
          >
            <Typography sx={{ textTransform: "none" }}>
              {t("continueWithHotelAdmin")}
            </Typography>
          </Button>
          <div>{t("or")}</div>
          <Button
            variant="contained"
            onClick={() => handleInteraction("clinic")}
          >
            <Typography sx={{ textTransform: "none" }}>
              {t("continueWithClinicAdmin")}
            </Typography>
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default Landing;
