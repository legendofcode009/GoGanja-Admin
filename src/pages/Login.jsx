import React, { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Box, Button, TextField, Typography, Alert, Grid } from "@mui/material";
import { auth } from "../firebase-config";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";
import logo from "../assets/Logo.png";
import { colors } from "../utilities/colors";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [alertText, setAlertText] = useState("");
  const [alertSeverity, setAlertSeverity] = useState("");
  const [showAlert, setShowAlert] = useState(null);

  function navigateToRegistration() {
    navigate("/registration");
  }

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
      localStorage.setItem("uid", userCredential?.user?.uid);
      localStorage.setItem("token", authToken);
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      setAlertText(t("fillDetails") + " " + error.message);
      setAlertSeverity("error");
      setShowAlert(true);
    }
  };

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
          alignItems: "center",
          alignContent: "center",
          alignSelf: "center",
          justifyContent: "center",
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
          style={{ textAlign: "center", paddingTop: 16 }}
        >
          {t("clinicsAdminPortal")}
        </Typography>

        <Grid
          container
          sx={{
            flexDirection: "column",
            alignItems: "center",
            marginTop: "32px",
            marginBottom: "24px",
            width: "100%",
            alignSelf: "center",
          }}
        >
          <Grid item width={"60%"}>
            <TextField
              color="secondary"
              label={t("email")}
              type="email"
              variant="outlined"
              margin="normal"
              value={email}
              fullWidth
              onChange={(e) => setEmail(e.target.value)}
              InputProps={{
                style: {
                  borderRadius: "16px",
                },
              }}
            />
          </Grid>

          <Grid item width={"60%"}>
            <TextField
              color="secondary"
              label={t("password")}
              variant="outlined"
              type="password"
              margin="normal"
              value={password}
              fullWidth
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                style: {
                  borderRadius: "16px",
                },
              }}
            />
          </Grid>
        </Grid>

        <Box
          sx={{
            flexDirection: "row",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Button
            variant="contained"
            sx={{ width: "60%", borderRadius: "16px", height: "48px" }}
            onClick={handleLogin}
          >
            <Typography sx={{ textTransform: "none" }}>
              {loading ? t("loading") : t("login")}
            </Typography>
          </Button>
        </Box>

        <Box
          sx={{
            flexDirection: "column",
            display: "flex",
            justifyContent: "space-evenly",
            alignItems: "center",
            width: "100%",
            marginTop: "32px",
            paddingBottom: "40px",
          }}
        >
          <Typography sx={{ textTransform: "none", marginBottom: "8px" }}>
            {t("dontHaveAccount")}
          </Typography>
          <Button
            sx={{
              textTransform: "none",
              textDecoration: "underline",
              color: colors?.golden,
            }}
            onClick={navigateToRegistration}
          >
            {t("register")}
          </Button>
        </Box>

        {showAlert ? (
          <Alert
            variant="filled"
            severity={alertSeverity}
            onClose={() => setShowAlert(null)}
          >
            {alertText}
          </Alert>
        ) : null}
      </Box>
    </Box>
  );
};

export default Login;
