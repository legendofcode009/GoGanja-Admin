import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
  Button,
  ThemeProvider,
  createTheme,
  Pagination,
  CircularProgress,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { commonStyles } from "../utilities/commonStyles";
import { BarChart } from "@mui/x-charts";
import { colors } from "../utilities/colors";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../firebase-config";
import { collection, query, where, getDocs } from "firebase/firestore/lite";
import dayjs from "dayjs";

export default function Prescriptions() {
  const navigate = useNavigate();
  const [t] = useTranslation();
  const [clinicAdminUid, setClinicAdminUid] = useState("");
  const [unProcessedSubscriptionPage, setUnProcessedSubscriptionPage] = useState(1);
  const [allSubscriptionPage, setAllSubscriptionPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [allPrescriptions, setAllPrescriptions] = useState([]);
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const theme = createTheme({
    typography: {
      fontFamily: "Lato",
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            textTransform: "none",
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: "none",
          },
          head: {
            fontWeight: 600,
          },
        },
      },
    },
  });

  const unprocessedPrescriptions = [
    {
      name: "John Doe",
      medicinal: "Aspirin",
      dosage: "500 mg",
      email: "john@example.com",
      date: "07/08/24",
    },
    {
      name: "Jane Smith",
      medicinal: "Ibuprofen",
      dosage: "500 mg",
      email: "jane@example.com",
      date: "07/08/24",
    },
    {
      name: "Bob Johnson",
      medicinal: "Paracetamol",
      dosage: "500 mg",
      email: "bob@example.com",
      date: "07/08/24",
    },
    {
      name: "Alice Green",
      medicinal: "Ciprofloxacin",
      dosage: "250 mg",
      email: "alice@example.com",
      date: "07/09/24",
    },
    {
      name: "Tom Brown",
      medicinal: "Amoxicillin",
      dosage: "500 mg",
      email: "tom@example.com",
      date: "07/10/24",
    },
    {
      name: "Lucy Black",
      medicinal: "Metoprolol",
      dosage: "50 mg",
      email: "lucy@example.com",
      date: "07/11/24",
    },
    {
      name: "Michael White",
      medicinal: "Simvastatin",
      dosage: "20 mg",
      email: "michael@example.com",
      date: "07/12/24",
    },
    {
      name: "Emma Blue",
      medicinal: "Levothyroxine",
      dosage: "75 mcg",
      email: "emma@example.com",
      date: "07/13/24",
    },
    {
      name: "Chris Red",
      medicinal: "Gabapentin",
      dosage: "300 mg",
      email: "chris@example.com",
      date: "07/14/24",
    },
    {
      name: "Sophia Yellow",
      medicinal: "Sertraline",
      dosage: "50 mg",
      email: "sophia@example.com",
      date: "07/15/24",
    },
    {
      name: "James Grey",
      medicinal: "Lisinopril",
      dosage: "10 mg",
      email: "james@example.com",
      date: "07/16/24",
    },
    {
      name: "Olivia Pink",
      medicinal: "Furosemide",
      dosage: "40 mg",
      email: "olivia@example.com",
      date: "07/17/24",
    },
    {
      name: "Liam Orange",
      medicinal: "Atorvastatin",
      dosage: "80 mg",
      email: "liam@example.com",
      date: "07/18/24",
    },
    {
      name: "Mia Violet",
      medicinal: "Clopidogrel",
      dosage: "75 mg",
      email: "mia@example.com",
      date: "07/19/24",
    },
    {
      name: "Noah Indigo",
      medicinal: "Montelukast",
      dosage: "10 mg",
      email: "noah@example.com",
      date: "07/20/24",
    },
    {
      name: "Ava Teal",
      medicinal: "Duloxetine",
      dosage: "30 mg",
      email: "ava@example.com",
      date: "07/21/24",
    },
    {
      name: "Ethan Brown",
      medicinal: "Tamsulosin",
      dosage: "0.4 mg",
      email: "ethan@example.com",
      date: "07/22/24",
    },
    {
      name: "Isabella Gold",
      medicinal: "Ranitidine",
      dosage: "150 mg",
      email: "isabella@example.com",
      date: "07/23/24",
    },
    {
      name: "Lucas Silver",
      medicinal: "Omeprazole",
      dosage: "20 mg",
      email: "lucas@example.com",
      date: "07/24/24",
    },
    {
      name: "Charlotte Bronze",
      medicinal: "Hydrochlorothiazide",
      dosage: "25 mg",
      email: "charlotte@example.com",
      date: "07/25/24",
    },
    {
      name: "Amelia Copper",
      medicinal: "Atenolol",
      dosage: "50 mg",
      email: "amelia@example.com",
      date: "07/26/24",
    },
  ];

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

  const ActiveRejectedSection = () => {
    return (
      <Grid
        container
        sx={{ my: 4 }}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Grid flexDirection={"column"} xs={2}>
          <Grid item xs={12} sx={{ my: 2 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: colors.lighterWhite,
                height: 150, // Set a fixed height
                display: "flex",
                flexDirection: "column",
                justifyContent: "center", // Center content vertically
              }}
            >
              <Typography
                variant="h6"
                color={colors.lightBlack}
                sx={{ fontWeight: 600 }}
              >
                Active Prescriptions
              </Typography>
              <Typography
                variant="h3"
                color={colors.lighterBlack}
                sx={{ fontWeight: 600 }}
              >
                0
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sx={{ my: 2 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: colors.lighterWhite,
                height: 150,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                variant="h6"
                color={colors.lightBlack}
                sx={{ fontWeight: 600 }}
              >
                Rejected Prescriptions
              </Typography>
              <Typography
                variant="h3"
                color={colors.lighterBlack}
                sx={{ fontWeight: 600 }}
              >
                0
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Grid xs={7.5}>
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                backgroundColor: colors.lighterWhite,
                justifyContent: "center",
                alignItems: "center",
                alignContent: "center",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Typography
                variant="h6"
                color={colors.lightBlack}
                sx={{ fontWeight: 600, marginTop: "10px", fontSize: "18px" }}
              >
                Company Performance
              </Typography>

              <Typography
                variant="h6"
                color={colors.lightBlack}
                sx={{ fontWeight: 400, fontSize: "14px" }}
              >
                Sales, Expenses, and Profit: 2014-2023
              </Typography>

              <BarChart
                xAxis={[
                  {
                    scaleType: "band",
                    data: ["2014", "2015", "2016", "2017", "2018", "2019"],
                  },
                ]}
                series={[
                  { data: [400, 300, 500, 800, 100, 500] },
                  { data: [100, 600, 300, 200, 400, 150] },
                  { data: [200, 500, 600, 300, 800, 400] },
                ]}
                height={400}
                colors={[
                  colors?.lightBlack,
                  colors?.golden,
                  colors?.lightGreen,
                ]}
              ></BarChart>
            </Paper>
          </Grid>
        </Grid>

        <Grid flexDirection={"column"} xs={2}>
          <Grid item xs={12} sx={{ my: 2 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: colors.lighterWhite,
                height: 150, // Set a fixed height
                display: "flex",
                flexDirection: "column",
                justifyContent: "center", // Center content vertically
              }}
            >
              <Typography
                variant="h6"
                color={colors.lightBlack}
                sx={{ fontWeight: 600 }}
              >
                Total Amount for the Week
              </Typography>
              <Typography
                variant="h4"
                color={colors.lighterBlack}
                sx={{ fontWeight: 600 }}
              >
                $0
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sx={{ my: 2 }}>
            <Paper
              sx={{
                p: 2,
                textAlign: "center",
                backgroundColor: colors.lighterWhite,
                height: 150, // Set a fixed height
                display: "flex",
                flexDirection: "column",
                justifyContent: "center", // Center content vertically
              }}
            >
              <Typography
                variant="h6"
                color={colors.lightBlack}
                sx={{ fontWeight: 600 }}
              >
                Total Amount for the Month
              </Typography>
              <Typography
                variant="h4"
                color={colors.lighterBlack}
                sx={{ fontWeight: 600 }}
              >
                $0
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    );
  };

  const handleChangePage = (event, newPage) => {
    setUnProcessedSubscriptionPage(newPage);
  };

  const totalUnProcessedSubscriptionPages = Math.ceil(
    unprocessedPrescriptions.length / rowsPerPage
  );

  const getCurrentUnprocessedPrescriptions = () => {
    const startIndex = (unProcessedSubscriptionPage - 1) * rowsPerPage;
    return unprocessedPrescriptions.slice(startIndex, startIndex + rowsPerPage);
  };

  const getCurrentAllPrescriptions = () => {
    const startIndex = (allSubscriptionPage - 1) * rowsPerPage;
    return allPrescriptions.slice(startIndex, startIndex + rowsPerPage);
  };

  const getCurrentClientData = () => {
    const startIndex = (clientPage - 1) * rowsPerPage;
    return clientData.slice(startIndex, startIndex + rowsPerPage);
  };

  const fetchClientData = async () => {
    const clientsRef = collection(db, "clinics_clients");
    const q = query(clientsRef, where("clinicAdminUid", "==", clinicAdminUid));

    try {
      const querySnapshot = await getDocs(q);
      const clientsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setClientData(clientsData);
      setLoading(false);
    } catch (error) {
      setError(error);
      console.error("Error fetching client data: ", error);
    }
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
      setAllPrescriptions(prescriptionsData);
    } catch (error) {
      setError(error);
      console.error("Error fetching prescriptions: ", error);
    } finally {
      setLoading(false);
      console.log(clinicAdminUid);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
    fetchClientData();
  }, [clinicAdminUid]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setClinicAdminUid(user.uid);
      }
    });
    return unsubscribe;
  }, []);

  const parseDateString = (dateString) => {
    const [month, day, year] = dateString.split('/');
    return new Date(`20${year}`, month - 1, day);
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          backgroundColor: colors?.backgroundWhite,
          flexGrow: 1,
          p: {
            xs: 0, // 0px
            sm: 0, // 600px
            md: 5, // 900px
            lg: 5, // 1200px
            xl: 5, // 1536px
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
            <>
              <Box
                sx={{
                  mt: 3,
                  mb: 2,
                  flexDirection: "row",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  fontSize={commonStyles?.dashboardFontSize}
                  sx={{
                    fontWeight: "600",
                    color: colors?.lighterBlack,
                    marginBottom: "16px",
                  }}
                >
                  {t("prescriptionManagement")}
                </Typography>

                <Button
                  onClick={() => navigate("/prescription_management")}
                  sx={{
                    height: "56px",
                    textTransform: "capitalize",
                    borderRadius: "16px",
                    backgroundColor: colors?.lightBlack,
                    paddingX: "51px",
                    boxShadow: "0px 3px 7px #A3A3A350",
                  }}
                  variant="contained"
                  startIcon={
                    <AddIcon
                      sx={{ color: colors?.lighterWhite, fontSize: 24 }}
                    />
                  }
                >
                  <Typography
                    sx={{
                      fontWeight: "500",
                      fontSize: "20px",
                      color: colors?.lighterWhite,
                    }}
                  >
                    {t("newPrescription")}
                  </Typography>
                </Button>
              </Box>

              <Box
                sx={{
                  backgroundColor: colors.lighterWhite,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "24px",
                  boxShadow: "0px 3px 7px #A3A3A350",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    p: 2,
                    fontWeight: 600,
                    alignSelf: "flex-start",
                    marginLeft: "2%",
                  }}
                  color={colors.lightBlack}
                  fontSize={commonStyles?.subFontSize}
                >
                  {t("unProcessedReq")}
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: colors.lighterWhite,
                    overflow: "hidden",
                    width: "95%",
                    borderRadius: "24px",
                  }}
                >
                  <Table>
                    <TableHead>
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
                      {getCurrentUnprocessedPrescriptions().map(
                        (row, index) => (
                          <TableRow
                            key={index}
                            sx={{
                              borderColor: colors?.lightGrey,
                              borderWidth: 1,
                              borderStyle: "solid",
                            }}
                          >
                            <TableCell sx={styles?.tableRow}>
                              {row.name}
                            </TableCell>
                            <TableCell sx={styles?.tableRow}>
                              {row.medicinal}
                            </TableCell>
                            <TableCell sx={styles?.tableRow}>
                              {row.dosage}
                            </TableCell>
                            <TableCell sx={styles?.tableRow}>
                              {row.email}
                            </TableCell>
                            <TableCell sx={styles?.tableRow}>
                              {row.date}
                            </TableCell>
                          </TableRow>
                        )
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <Pagination
                    count={totalUnProcessedSubscriptionPages}
                    page={unProcessedSubscriptionPage}
                    onChange={handleChangePage}
                    color={colors?.lightBlack}
                  />
                </Box>
              </Box>

              <ActiveRejectedSection />

              <Box sx={{ textAlign: "center", mb: 4 }}>
                <Button
                  variant="text"
                  sx={{
                    color: colors.lighterGreen,
                    borderColor: colors.lighterGreen,
                    textDecorationLine: "underline",
                    fontWeight: "400",
                    fontSize: "20px",
                  }}
                >
                  {t("downloadReport")}
                </Button>
              </Box>

              <Box
                sx={{
                  backgroundColor: colors.lighterWhite,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "24px",
                  boxShadow: "0px 3px 7px #A3A3A350",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    p: 2,
                    fontWeight: 600,
                    alignSelf: "flex-start",
                    marginLeft: "2%",
                  }}
                  color={colors.lightBlack}
                  fontSize={commonStyles?.subFontSize}
                >
                  {t("allPrescriptions")}
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: colors.lighterWhite,
                    overflow: "hidden",
                    width: "95%",
                    borderRadius: "24px",
                  }}
                >
                  <Table>
                    <TableHead>
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
                            {row.medications[0].name}
                          </TableCell>
                          <TableCell sx={styles?.tableRow}>
                            {row.medications[0].dosage}
                          </TableCell>
                          <TableCell sx={styles?.tableRow}>
                            {row.email}
                          </TableCell>
                          <TableCell sx={styles?.tableRow}>
                            {dayjs(row.date).format("DD MMM, YYYY HH:mm")}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <Pagination
                    count={Math.ceil(allPrescriptions.length / rowsPerPage)}
                    page={allSubscriptionPage}
                    onChange={(event, newPage) =>
                      setAllSubscriptionPage(newPage)
                    }
                    color={colors?.lightBlack}
                  />
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 3,
                  mb: 2,
                  flexDirection: "row",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    alignSelf: "flex-start",
                  }}
                  color={colors.lightBlack}
                  fontSize={commonStyles?.dashboardFontSize}
                >
                  {t("clientManagement")}
                </Typography>

                <Button
                  onClick={() => navigate("/client_management")}
                  sx={{
                    height: "56px",
                    textTransform: "capitalize",
                    borderRadius: "16px",
                    backgroundColor: colors?.lightBlack,
                    paddingX: "51px",
                    boxShadow: "0px 3px 7px #A3A3A350",
                  }}
                  variant="contained"
                  startIcon={
                    <AddIcon
                      sx={{ color: colors?.lighterWhite, fontSize: 24 }}
                    />
                  }
                >
                  <Typography
                    sx={{
                      fontWeight: "500",
                      fontSize: "20px",
                      color: colors?.lighterWhite,
                    }}
                  >
                    {t("newClient")}
                  </Typography>
                </Button>
              </Box>

              <Box
                sx={{
                  backgroundColor: colors.lighterWhite,
                  width: "100%",
                  height: "100%",
                  alignItems: "center",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: "24px",
                  boxShadow: "0px 3px 7px #A3A3A350",
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    p: 2,
                    fontWeight: 600,
                    alignSelf: "flex-start",
                    marginLeft: "2%",
                  }}
                  color={colors.lightBlack}
                  fontSize={commonStyles?.subFontSize}
                >
                  {t("allClient")}
                </Typography>

                <TableContainer
                  component={Paper}
                  sx={{
                    backgroundColor: colors.lighterWhite,
                    overflow: "hidden",
                    width: "95%",
                    borderRadius: "24px",
                  }}
                >
                  <Table>
                    <TableHead>
                      <TableRow
                        sx={{
                          backgroundColor: colors.lightGreen,
                        }}
                      >
                        <TableCell sx={styles?.tableHeader}>
                          {t("patientName")}
                        </TableCell>
                        <TableCell sx={styles?.tableHeader}>
                          {t("diagnosis")}
                        </TableCell>
                        <TableCell sx={styles?.tableHeader}>
                          {t("email")}
                        </TableCell>
                        <TableCell sx={styles?.tableHeader}>
                          {t("phoneNumber")}
                        </TableCell>
                        <TableCell sx={styles?.tableHeader}>
                          {t("address")}
                        </TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {getCurrentClientData().map((row, index) => (
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
                            {row.diagnosis}
                          </TableCell>
                          <TableCell sx={styles?.tableRow}>
                            {row.email}
                          </TableCell>
                          <TableCell sx={styles?.tableRow}>
                            {row.phoneNumber}
                          </TableCell>
                          <TableCell sx={styles?.tableRow}>
                            {row.address}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                  <Pagination
                    count={Math.ceil(clientData.length / rowsPerPage)}
                    page={clientPage}
                    onChange={(event, newPage) => setClientPage(newPage)}
                    color={colors?.lightBlack}
                  />
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
}
