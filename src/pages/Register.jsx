import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore/lite";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Box, Button, TextField, Typography, Alert, Grid } from "@mui/material";

import { auth, db } from "../firebase-config";
import logo from "../assets/Logo.png";
import { colors } from "../utilities/colors";

const Registration = () => {
  const navigate = useNavigate();
  const [t] = useTranslation();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
  });
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, text: "", severity: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegistration = async () => {
    setLoading(true);
    try {
      if (Object.values(formData).some((field) => field === "")) {
        throw new Error("fillDetails");
      }

      const { email, password, displayName } = formData;
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await Promise.all([
        updateProfile(userCredential.user, { displayName }),
        setDoc(doc(db, "users", userCredential.user.uid), {
          name: displayName,
          email,
          uid: userCredential.user.uid,
          phoneNumber: userCredential.user.phoneNumber,
          userType: "Admin",
        }),
      ]);

      setAlert({
        show: true,
        text: t("registrationSuccessful"),
        severity: "success",
      });
      setFormData({ email: "", password: "", displayName: "" });
    } catch (error) {
      setAlert({
        show: true,
        text: `${t("registrationUnSuccessful")}: ${error.message}`,
        severity: "error",
      });
    }
    setLoading(false);
  };

  useEffect(() => {
    if (alert.show) {
      const timer = setTimeout(
        () => setAlert((prev) => ({ ...prev, show: false })),
        5000
      );
      return () => clearTimeout(timer);
    }
  }, [alert.show]);

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
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "center",
            mt: 5,
          }}
        >
          <img
            src={logo}
            style={{ width: 141, height: 108 }}
            alt="GoGanja Logo"
            loading="eager"
          />
        </Box>

        <Typography
          variant="h4"
          fontWeight="600"
          textAlign="center"
          sx={{ mt: 2 }}
        >
          {t("clinicsAdminPortal")}
        </Typography>

        <Grid
          container
          direction="column"
          alignItems="center"
          sx={{ mt: 4, mb: 3 }}
        >
          {["email", "password", "displayName"].map((field) => (
            <Grid item key={field} sx={{ width: "60%", mb: 2 }}>
              <TextField
                color="secondary"
                label={t(field === "displayName" ? "name" : field)}
                type={field === "password" ? "password" : "text"}
                name={field}
                value={formData[field]}
                onChange={handleChange}
                fullWidth
                InputProps={{ style: { borderRadius: "16px" } }}
              />
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            width: "100%",
            mb: 4,
          }}
        >
          <Button
            variant="contained"
            sx={{ width: "60%", borderRadius: "16px", height: "48px" }}
            onClick={handleRegistration}
          >
            <Typography sx={{ textTransform: "none" }}>
              {loading ? t("loading") : t("register")}
            </Typography>
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: 5,
          }}
        >
          <Typography sx={{ mb: 1 }}>{t("doHaveAccount")}</Typography>
          <Button
            sx={{
              textTransform: "none",
              textDecoration: "underline",
              color: colors?.golden,
            }}
            onClick={() => navigate("/login")}
          >
            {t("login")}
          </Button>
        </Box>

        {alert.show && (
          <Alert
            variant="filled"
            severity={alert.severity}
            onClose={() => setAlert((prev) => ({ ...prev, show: false }))}
          >
            {alert.text}
          </Alert>
        )}
      </Box>
    </Box>
  );
};

export default Registration;
