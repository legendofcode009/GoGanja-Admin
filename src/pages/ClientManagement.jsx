import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  ThemeProvider,
  createTheme,
  Grid,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import { colors } from "../utilities/colors";
import { commonStyles } from "../utilities/commonStyles";
import Navbar from "../components/Navbar";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged } from "firebase/auth";
import {
  addDoc,
  collection,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore/lite";
import { db, auth } from "../firebase-config";
import dayjs from "dayjs";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: "16px",
  marginBottom: theme.spacing(3),
  backgroundColor: colors.lighterWhite,
  boxShadow: "0px 3px 7px #A3A3A350",
}));

const StyledTextField = styled(TextField)({
  "& .MuiOutlinedInput-root": {
    borderRadius: "16px",
    "& fieldset": {
      borderColor: colors.lightGrey,
    },
    "&:hover fieldset": {
      borderColor: colors.golden,
    },
    "&.Mui-focused fieldset": {
      borderColor: colors.golden,
    },
  },
});

const SectionTitle = ({ children }) => (
  <Typography
    variant="h6"
    sx={{
      fontWeight: 600,
      color: colors.lightBlack,
      fontSize: {
        xs: "1.2rem", // Small screens
        sm: "1.5rem", // Medium screens
        md: "1.8rem", // Large screens
      },
      marginBottom: "16px",
    }}
  >
    {children}
  </Typography>
);

const ClientManagement = () => {
  const [t] = useTranslation();
  const [clients, setClients] = useState([]);
  const [clientData, setClientData] = useState({
    patientName: "",
    age: "",
    diagnosis: "",
    email: "",
    phoneNumber: "",
    address: "",
    notes: "",
  });
  const [errors, setErrors] = useState({
    patientName: "",
    age: "",
    diagnosis: "",
    email: "",
    phoneNumber: "",
    address: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [clinicAdminUid, setClinicAdminUid] = useState("");
  const [createdOn, setCreatedOn] = useState(new Date());

  const fetchClients = async () => {
    try {
      const q = query(
        collection(db, "clinics_clients"),
        orderBy("createdOn", "desc")
      );
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClients(clientsData);
    } catch (error) {
      console.error("Error fetching clients: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setClinicAdminUid(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      setClientData({ ...clientData, [e.target.name]: e.target.value });
      setErrors({ ...errors, [e.target.name]: "" });
    },
    [clientData, errors]
  );

  useEffect(() => {
    fetchClients();
  }, []);

  const validateForm = () => {
    const newErrors = { ...errors };
    if (!clientData.patientName) {
      newErrors.patientName = t("patientNameRequired");
    } else if (typeof clientData.patientName !== "string") {
      newErrors.patientName = t("patientNameMustBeString");
    }

    if (!clientData.age) {
      newErrors.age = t("ageRequired");
    } else if (isNaN(clientData.age) || clientData.age < 0) {
      newErrors.age = t("ageMustBeNumber");
    }

    if (!clientData.diagnosis) {
      newErrors.diagnosis = t("diagnosisRequired");
    } else if (typeof clientData.diagnosis !== "string") {
      newErrors.diagnosis = t("diagnosisMustBeString");
    }

    if (!clientData.email) {
      newErrors.email = t("emailRequired");
    } else if (
      !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(clientData.email)
    ) {
      newErrors.email = t("emailMustBeValid");
    }

    if (!clientData.phoneNumber) {
      newErrors.phoneNumber = t("phoneNumberRequired");
    } else if (!/^\d{3}-\d{3}-\d{4}$/.test(clientData.phoneNumber)) {
      newErrors.phoneNumber = t("phoneNumberMustBeValid");
    }

    if (!clientData.address) {
      newErrors.address = t("addressRequired");
    } else if (typeof clientData.address !== "string") {
      newErrors.address = t("addressMustBeString");
    }

    if (!clientData.notes) {
      newErrors.notes = t("notesRequired");
    } else if (typeof clientData.notes !== "string") {
      newErrors.notes = t("notesMustBeString");
    }

    setErrors(newErrors);
    return Object.values(newErrors).every((error) => error === "");
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (validateForm()) {
        try {
          const clinicClientsRef = collection(db, "clinics_clients");
          const docRef = await addDoc(clinicClientsRef, {
            ...clientData,
            clinicAdminUid,
            createdOn: createdOn.toISOString(),
          });
          fetchClients();
          console.log("Document written with ID: ", docRef.id);
          setClientData({
            patientName: "",
            age: "",
            diagnosis: "",
            email: "",
            phoneNumber: "",
            address: "",
            notes: "",
          });
          setLoading(false);
        } catch (error) {
          console.error("Error adding document: ", error);
        }
      }
    },
    [clientData, clinicAdminUid, createdOn, errors]
  );

  const theme = createTheme({
    typography: {
      fontFamily: "Lato",
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: colors.backgroundWhite,
          flexGrow: 1,
          p: {
            xs: 2,
            sm: 3,
            md: 5,
          },
        }}
      >
        <Navbar />

        <Box
          sx={{
            flexGrow: 1,
            p: 3,
            backgroundColor: colors.backgroundWhite,
          }}
        >
          <Typography
            fontSize={{
              xs: "1.5rem", // Small screens
              sm: "2rem", // Medium screens
              md: "2.5rem", // Large screens
            }}
            sx={{
              fontWeight: "600",
              color: colors.lighterBlack,
              marginBottom: "16px",
            }}
          >
            {t("clientManagement")}
          </Typography>

          <StyledPaper elevation={3}>
            <SectionTitle>{t("addClient")}</SectionTitle>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    color={colors?.golden}
                    label={t("patientName")}
                    name="patientName"
                    value={clientData.patientName}
                    onChange={handleInputChange}
                    fullWidth
                    error={errors.patientName !== ""}
                    helperText={errors.patientName}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    color={colors?.golden}
                    label={t("age")}
                    name="age"
                    value={clientData.age}
                    onChange={handleInputChange}
                    fullWidth
                    error={errors.age !== ""}
                    helperText={errors.age}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2} mb={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    color={colors?.golden}
                    label={t("email")}
                    name="email"
                    value={clientData.email}
                    onChange={handleInputChange}
                    fullWidth
                    error={errors.email !== ""}
                    helperText={errors.email}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    color={colors?.golden}
                    label={t("phoneNumber")}
                    name="phoneNumber"
                    value={clientData.phoneNumber}
                    onChange={handleInputChange}
                    fullWidth
                    error={errors.phoneNumber !== ""}
                    helperText={errors.phoneNumber}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <StyledTextField
                    color={colors?.golden}
                    label={t("address")}
                    name="address"
                    value={clientData.address}
                    onChange={handleInputChange}
                    fullWidth
                    error={errors.address !== ""}
                    helperText={errors.address}
                  />
                </Grid>
              </Grid>

              <StyledTextField
                color={colors?.golden}
                label={t("diagnosis")}
                name="diagnosis"
                value={clientData.diagnosis}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                sx={{ mb: 2 }}
                error={errors.diagnosis !== ""}
                helperText={errors.diagnosis}
              />

              <StyledTextField
                color={colors?.golden}
                label={t("notes")}
                name="notes"
                value={clientData.notes}
                onChange={handleInputChange}
                multiline
                rows={4}
                fullWidth
                sx={{ mb: 2 }}
                error={errors.notes !== ""}
                helperText={errors.notes}
              />

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: " flex-end" },
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <Button
                  disabled={loading}
                  type="button"
                  variant="outlined"
                  color={colors?.lightBlack}
                  sx={{
                    borderRadius: "16px",
                    borderWidth: 1,
                    borderColor: colors?.lightBlack,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "500",
                      fontSize: "20px",
                      color: colors?.lightBlack,
                      textTransform: "capitalize",
                      paddingX: "45px",
                    }}
                  >
                    {t("cancel")}
                  </Typography>
                </Button>

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{
                    borderRadius: "16px",
                    borderWidth: 1,
                    color: "white",
                    backgroundColor: colors?.lightBlack,
                  }}
                >
                  <Typography
                    sx={{
                      fontWeight: "500",
                      fontSize: "20px",
                      color: colors?.lighterWhite,
                      textTransform: "capitalize",
                      paddingX: "45px",
                    }}
                  >
                    {loading ? (
                      <CircularProgress
                        sx={{
                          color: colors?.lighterWhite,
                          fontSize: "12px",
                        }}
                        size={24}
                      />
                    ) : (
                      t("create")
                    )}
                  </Typography>
                </Button>
              </Box>
            </form>
          </StyledPaper>

          <StyledPaper elevation={3}>
            <SectionTitle>Clients</SectionTitle>
            <Box sx={{ overflowX: "auto" }}>
              <TableContainer
                component={Paper}
                sx={{ borderRadius: "16px", overflow: "scroll" }}
              >
                <Table>
                  <TableHead sx={{ backgroundColor: colors.lightGreen }}>
                    <TableRow>
                      <TableCell
                        sx={{ color: colors.lighterWhite, fontWeight: "500" }}
                      >
                        {t("patientName")}
                      </TableCell>
                      <TableCell
                        sx={{ color: colors.lighterWhite, fontWeight: "500" }}
                      >
                        {t("diagnosis")}
                      </TableCell>
                      <TableCell
                        sx={{ color: colors.lighterWhite, fontWeight: "500" }}
                      >
                        {t("email")}
                      </TableCell>
                      <TableCell
                        sx={{ color: colors.lighterWhite, fontWeight: "500" }}
                      >
                        {t("phone")}
                      </TableCell>
                      <TableCell
                        sx={{ color: colors.lighterWhite, fontWeight: "500" }}
                      >
                        {t("address")}
                      </TableCell>
                      <TableCell
                        sx={{ color: colors.lighterWhite, fontWeight: "500" }}
                      >
                        {t("date")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {clients.map((client) => (
                      <TableRow
                        key={client.id}
                        sx={{
                          borderColor: colors.lightGrey,
                          borderWidth: 1,
                          borderStyle: "solid",
                        }}
                      >
                        <TableCell
                          sx={{ color: colors.lighterBlack, fontWeight: "500" }}
                        >
                          {client.patientName}
                        </TableCell>
                        <TableCell
                          sx={{ color: colors.lighterBlack, fontWeight: "500" }}
                        >
                          {client.diagnosis}
                        </TableCell>
                        <TableCell
                          sx={{ color: colors.lighterBlack, fontWeight: "500" }}
                        >
                          {client.email}
                        </TableCell>
                        <TableCell
                          sx={{ color: colors.lighterBlack, fontWeight: "500" }}
                        >
                          {client.phoneNumber}
                        </TableCell>
                        <TableCell
                          sx={{ color: colors.lighterBlack, fontWeight: "500" }}
                        >
                          {client.address}
                        </TableCell>
                        <TableCell
                          sx={{ color: colors.lighterBlack, fontWeight: "500" }}
                        >
                          {dayjs(client.createdOn).format("DD MMM, YYYY HH:MM")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </StyledPaper>
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default ClientManagement;
