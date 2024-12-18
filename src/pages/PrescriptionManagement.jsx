import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Grid,
  Snackbar,
  Alert,
  Pagination,
  CircularProgress,
} from "@mui/material";
import { t } from "i18next";
import { colors } from "../utilities/colors";
import Navbar from "../components/Navbar";
import {
  collection,
  getDocs,
  query,
  orderBy,
  addDoc,
  where,
} from "firebase/firestore/lite";
import { commonStyles } from "../utilities/commonStyles";
import { db, auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import dayjs from "dayjs";

const PrescriptionsManagement = () => {
  const [rowsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [prescriptions, setPrescriptions] = useState([]);
  const [allSubscriptionPage, setAllSubscriptionPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [clinicAdminUid, setClinicAdminUid] = useState("");
  const [prescriptionData, setPrescriptionData] = useState({
    medicineName: "",
    dosage: "",
    quantity: "",
    patientName: "",
    diagnosis: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [errors, setErrors] = useState({
    medicineName: "",
    dosage: "",
    quantity: "",
    patientName: "",
    diagnosis: "",
    email: "",
    phoneNumber: "",
    address: "",
  });
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const styles = {
    tableHeader: {
      color: colors?.lighterWhite,
      fontWeight: "500",
      width: "20%",
      fontSize: "18px",
    },
    tableRow: {
      color: colors?.lighterBlack,
      fontWeight: "500",
      width: "20%",
      fontSize: "16px",
    },
  };

  const getCurrentAllPrescriptions = () => {
    const startIndex = (allSubscriptionPage - 1) * rowsPerPage;
    return prescriptions.slice(startIndex, startIndex + rowsPerPage);
  };

  const handleInputChange = (e) => {
    setPrescriptionData({
      ...prescriptionData,
      [e.target.name]: e.target.value,
    });
    validateInput(e);
  };

  const validateInput = (e) => {
    const { name, value } = e.target;
    let error = "";

    switch (name) {
      case "medicineName":
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          error =
            "Please enter a valid medicine name (only letters and spaces allowed)";
        } else if (value.trim() === "") {
          error = "This field is required";
        }
        break;
      case "dosage":
        if (!/^\d+(\.\d+)?$/.test(value)) {
          error =
            "Please enter a valid dosage (only numbers and decimal points allowed)";
        } else if (value.trim() === "") {
          error = "This field is required";
        }
        break;
      case "quantity":
        if (!/^\d+$/.test(value)) {
          error = "Please enter a valid quantity (only whole numbers allowed)";
        } else if (value.trim() === "") {
          error = "This field is required";
        }
        break;
      case "patientName":
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          error =
            "Please enter a valid patient name (only letters and spaces allowed)";
        } else if (value.trim() === "") {
          error = "This field is required";
        }
        break;
      case "diagnosis":
        if (value.trim() === "") {
          error = "This field is required";
        }
        break;
      case "email":
        if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
          error = "Please enter a valid email address";
        } else if (value.trim() === "") {
          error = "This field is required";
        }
        break;
      case "phoneNumber":
        if (!/^\d+$/.test(value)) {
          error = "Please enter a valid phone number (only numbers allowed)";
        } else if (value.trim() === "") {
          error = "This field is required";
        }
        break;
      case "address":
        if (value.trim() === "") {
          error = "This field is required";
        }
        break;
      default:
        break;
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: error }));
  };

  const handleCreatePrescription = async (e) => {
    e.preventDefault();
    if (Object.values(errors).every((error) => error === "")) {
      try {
        const prescriptionRef = collection(db, "clinics_prescriptions");
        await addDoc(prescriptionRef, {
          ...prescriptionData,
          clinicAdminUid,
          date: new Date().toISOString(),
        });
        fetchPrescriptions();
        setPrescriptionData({
          medicineName: "",
          dosage: "",
          quantity: "",
          patientName: "",
          diagnosis: "",
          email: "",
          phoneNumber: "",
          address: "",
        });
        setErrors({
          medicineName: "",
          dosage: "",
          quantity: "",
          patientName: "",
          diagnosis: "",
          email: "",
          phoneNumber: "",
          address: "",
        });
        setSnackbarMessage("Prescription created successfully!");
        setOpenSnackbar(true);
      } catch (error) {
        console.error("Error creating prescription: ", error);
        setSnackbarMessage("Error creating prescription. Please try again.");
        setOpenSnackbar(true);
      }
    } else {
      alert("Please fill in all required fields");
    }
  };

  const handleCancel = () => {
    setPrescriptionData({
      medicineName: "",
      dosage: "",
      quantity: "",
      patientName: "",
      diagnosis: "",
      email: "",
      phoneNumber: "",
      address: "",
    });
    setErrors({
      medicineName: "",
      dosage: "",
      quantity: "",
      patientName: "",
      diagnosis: "",
      email: "",
      phoneNumber: "",
      address: "",
    });
  };

  const fetchPrescriptions = async () => {
    const prescriptionsRef = collection(db, "clinics_prescriptions");
    const q = query(
      prescriptionsRef,
      where("clinicAdminUid", "==", clinicAdminUid)
    );

    try {
      const querySnapshot = await getDocs(q);
      const prescriptionsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPrescriptions(prescriptionsData);
      setLoading(false);
    } catch (error) {
      setError(error);
      console.error("Error fetching prescriptions: ", error);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [clinicAdminUid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setClinicAdminUid(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  return (
    <Box
      sx={{
        backgroundColor: colors.backgroundWhite,
        flexGrow: 1,
        p: {
          xs: 0,
          sm: 0,
          md: 5,
          lg: 5,
          xl: 5,
        },
      }}
    >
      <Navbar />

      <Box
        sx={{
          padding: 2,
          minHeight: "900px",
        }}
      >
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <CircularProgress color={colors?.lightBlack} />
          </Box>
        ) : error ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
            <Typography variant="h6" color={colors.lightBlack}>
              {t("errorOccurred")}
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                fontSize={commonStyles?.dashboardFontSize}
                variant="h4"
                fontWeight={500}
                sx={{
                  marginBottom: "16px",
                  color: colors?.lighterBlack,
                  fontWeight: "600",
                }}
              >
                {t("prescriptions")}
              </Typography>
            </Box>

            <Box
              sx={{
                padding: "24px",
                backgroundColor: colors.backgroundWhite,
                border: 0.1,
                borderColor: "#ECECEC",
                margin: 1,
                borderRadius: "16px",
                boxShadow: "0px 3px 10px 0px #9999991A",
              }}
            >
              <Typography
                fontSize={commonStyles?.fontSize}
                fontWeight={500}
                sx={{
                  color: colors?.lighterBlack,
                  fontWeight: "600",
                  fontSize: "20px",
                  marginBottom: "16px",
                }}
              >
                {t("currentRecipe")}
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    color="secondary"
                    label={t("medicineName")}
                    variant="outlined"
                    fullWidth
                    name="medicineName"
                    value={prescriptionData.medicineName}
                    onChange={handleInputChange}
                    error={errors.medicineName !== ""}
                    helperText={errors.medicineName}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    color="secondary"
                    label={t("dosage")}
                    variant="outlined"
                    fullWidth
                    name="dosage"
                    value={prescriptionData.dosage}
                    onChange={handleInputChange}
                    error={errors.dosage !== ""}
                    helperText={errors.dosage}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    color="secondary"
                    label={t("quantity")}
                    variant="outlined"
                    fullWidth
                    name="quantity"
                    value={prescriptionData.quantity}
                    onChange={handleInputChange}
                    error={errors.quantity !== ""}
                    helperText={errors.quantity}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    color="secondary"
                    label={t("patientName")}
                    variant="outlined"
                    fullWidth
                    name="patientName"
                    value={prescriptionData.patientName}
                    onChange={handleInputChange}
                    error={errors.patientName !== ""}
                    helperText={errors.patientName}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={12}>
                  <TextField
                    color="secondary"
                    label={t("diagnosis")}
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    name="diagnosis"
                    value={prescriptionData.diagnosis}
                    onChange={handleInputChange}
                    error={errors.diagnosis !== ""}
                    helperText={errors.diagnosis}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    color="secondary"
                    label={t("email")}
                    variant="outlined"
                    fullWidth
                    name="email"
                    value={prescriptionData.email}
                    onChange={handleInputChange}
                    error={errors.email !== ""}
                    helperText={errors.email}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    color="secondary"
                    label={t("phoneNumber")}
                    variant="outlined"
                    fullWidth
                    name="phoneNumber"
                    value={prescriptionData.phoneNumber}
                    onChange={handleInputChange}
                    error={errors.phoneNumber !== ""}
                    helperText={errors.phoneNumber}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    color="secondary"
                    label={t("address")}
                    variant="outlined"
                    fullWidth
                    name="address"
                    value={prescriptionData.address}
                    onChange={handleInputChange}
                    error={errors.address !== ""}
                    helperText={errors.address}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>
              </Grid>

              <Typography
                fontSize={commonStyles?.fontSize}
                fontWeight={500}
                sx={{
                  color: colors?.lighterBlack,
                  fontWeight: "600",
                  fontSize: "20px",
                  marginBottom: "16px",
                  marginTop: "16px",
                }}
              >
                {t("pastPrescriptions")}
              </Typography>

              {loading ? (
                <Typography>Loading...</Typography>
              ) : (
                <>
                  <TableContainer
                    component={Paper}
                    sx={{
                      backgroundColor: colors.lighterWhite,
                      overflow: "hidden",
                      width: "100%",
                      borderRadius: "24px",
                    }}
                  >
                    <Table>
                      <TableHead sx={{ backgroundColor: colors.lightGreen }}>
                        <TableRow
                          sx={{
                            backgroundColor: colors.lightGreen,
                          }}
                        >
                          <TableCell sx={styles?.tableHeader}>
                            {t("patientName")}
                          </TableCell>
                          <TableCell sx={styles?.tableHeader}>
                            {t("medicineName")}
                          </TableCell>
                          <TableCell sx={styles?.tableHeader}>
                            {t("dosage")}
                          </TableCell>
                          <TableCell sx={styles?.tableHeader}>
                            {t("email")}
                          </TableCell>
                          <TableCell sx={styles?.tableHeader}>
                            {t("date")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {getCurrentAllPrescriptions().map((row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              borderColor: colors?.lightGrey,
                              borderWidth: 1,
                              borderStyle: "solid",
                            }}
                          >
                            <TableCell sx={styles?.tableRow}>
                              {row.patientName}
                            </TableCell>
                            <TableCell sx={styles?.tableRow}>
                              {row.medicineName}
                            </TableCell>
                            <TableCell sx={styles?.tableRow}>
                              {row.dosage}
                            </TableCell>
                            <TableCell sx={styles?.tableRow}>
                              {row.email}
                            </TableCell>
                            <TableCell sx={styles?.tableRow}>
                              {dayjs(row.date).format("DD MMM, YYYY HH:MM")}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                    <Pagination
                      count={Math.ceil(prescriptions.length / rowsPerPage)}
                      page={allSubscriptionPage}
                      onChange={(event, newPage) =>
                        setAllSubscriptionPage(newPage)
                      }
                      color={colors?.lightBlack}
                    />
                  </Box>
                </>
              )}

              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: { xs: "center", sm: "flex-end" },
                  gap: "10px",
                  marginTop: "20px",
                }}
              >
                <Button
                  disabled={loading}
                  type="button"
                  variant="outlined"
                  color="primary"
                  onClick={handleCancel}
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
                  onClick={handleCreatePrescription}
                  sx={{
                    borderRadius: "16px",
                    borderWidth: 1,
                    color: colors?.lightBlack,
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
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarMessage.includes("Error") ? "error" : "success"}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PrescriptionsManagement;
