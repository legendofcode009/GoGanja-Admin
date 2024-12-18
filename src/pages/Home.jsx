import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CountUp from "react-countup";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Badge,
} from "@mui/material";
import {
  LocalHospital,
  Favorite,
  East as EastIcon,
  CalendarMonth as CalendarMonthIcon,
} from "@mui/icons-material";

import Navbar from "../components/Navbar";
import VBarChart from "../charts/VBarChart";
import GeoChart from "../charts/GeoChart";
import PieChart from "../charts/PieChart";
import BarChart from "../charts/BarChart";
import { colors } from "../utilities/colors";
import "../Dashboard.css";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  getDoc,
  doc,
} from "firebase/firestore/lite";
import { db, auth } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";

const styles = {
  cardContainer: {
    minWidth: "100%", // Adjusted for responsiveness
    height: "123px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "24px",
    boxShadow: "0px 3px 7px #A3A3A350",
    marginBottom: "24px",
  },
  titleStyle: {
    fontWeight: "600",
    fontSize: "18px",
    color: colors?.lighterBlack,
  },
  valueStyle: {
    fontWeight: "600",
    fontSize: "40px",
    color: colors?.golden,
    marginTop: "16px",
  },
  dashboardMainCardTitle: {
    textAlign: "center",
    fontSize: {
      xs: "1em",
      sm: "1.25em",
      md: "0.8em",
      lg: "1.2em",
      xl: "1.2em",
    },
    color: colors?.lighterBlack,
  },
  dashboardMainCardSubtitle: {
    textAlign: "center",
    fontSize: {
      xs: "1em",
      sm: "1.25em",
      md: "0.8em",
      lg: "1.2em",
      xl: "1em",
    },
    color: colors?.lighterBlack,
  },
};

const StatCard = ({ title, value, prefix = "" }) => (
  <Card sx={styles.cardContainer}>
    <Typography sx={styles.titleStyle}>{title}</Typography>
    <Typography sx={styles.valueStyle}>
      {prefix}
      <CountUp delay={0.2} end={value} duration={0.3} />
    </Typography>
  </Card>
);

const LatestUpdates = () => {
  const [t] = useTranslation();
  const [bookings, setBookings] = useState([]);
  const [clinicAdminUid, setClinicAdminUid] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setClinicAdminUid(user.uid);
      } else {
        setClinicAdminUid(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBookings = async () => {
      if (clinicAdminUid) {
        const bookingsRef = collection(db, "clinics_bookings");
        const q = query(
          bookingsRef,
          where("clinicAdmin", "==", clinicAdminUid),
          limit(2)
        );

        try {
          const querySnapshot = await getDocs(q);
          const fetchedBookings = await Promise.all(
            querySnapshot.docs.map(async (bookingDoc) => {
              const bookingData = bookingDoc.data();

              // Validate clinicId
              if (!bookingData.clinicId) {
                console.error("No clinicId found for booking:", bookingDoc.id);
                return {
                  ...bookingData,
                  id: bookingDoc.id,
                  hotelName: "-",
                };
              }

              const clinicRef = doc(db, "clinics", bookingData.clinicId);
              const clinicSnap = await getDoc(clinicRef);

              if (!clinicSnap.exists()) {
                console.warn(
                  "No clinic found for clinicId:",
                  bookingData.clinicId
                );
                return {
                  ...bookingData,
                  id: bookingDoc.id,
                  hotelName: "Unknown Clinic",
                };
              }

              const clinicData = clinicSnap.data();
              return {
                id: bookingDoc.id,
                ...bookingData,
                hotelName: clinicData?.hotelName || "Unnamed Clinic",
              };
            })
          );

          console.log("Fetched bookings:", fetchedBookings);
          setBookings(fetchedBookings);
        } catch (error) {
          console.error("Error fetching bookings:", error);
        }
      }
    };
    fetchBookings();
  }, [clinicAdminUid]);

  const sections = [
    {
      title: "Bookings",
      subtitle: "Check for new requests",
      items: bookings.map((booking) => ({
        name: booking.hotelName,
        date: booking.bookingDate
          ? new Date(booking.bookingDate).toLocaleDateString()
          : "-",
      })),
      unfinished: bookings.length,
      icon: <CalendarMonthIcon />,
    },
    {
      title: "Unfinished actions",
      subtitle: "You have 2 unfinished actions",
      unfinished: 2,
      icon: <LocalHospital />,
    },
    {
      title: "Prescriptions",
      subtitle: "Check for new requests",
      items: [
        { name: "John Doe", description: "Epidiolex 100 mg." },
        { name: "John Doe", description: "Epidiolex 100 mg." },
      ],
      unfinished: 0,
      icon: <Favorite />,
    },
  ];

  return (
    <Box
      sx={{
        backgroundColor: colors.lighterWhite,
        p: 3,
        borderRadius: "24px",
        marginBottom: "10px",
        boxShadow: "0px 3px 7px #A3A3A350",
      }}
    >
      <Typography
        variant="h5"
        fontWeight="bold"
        gutterBottom
        sx={styles.dashboardMainCardTitle}
      >
        {t("latestUpdates")}
      </Typography>

      <Typography
        variant="body1"
        color="text.secondary"
        gutterBottom
        sx={styles.dashboardMainCardSubtitle}
      >
        {t("checkOutSection")}
      </Typography>
      <Grid container spacing={3}>
        {sections.map((section, index) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            sx={{ marginTop: "24px", marginBottom: "24px" }}
            key={index}
          >
            <Card
              sx={{
                height: "100%",
                backgroundColor: colors.lighterWhite,
                boxShadow: "0px 3px 7px #9999991A",
                borderRadius: "24px",
                borderWidth: "1px",
                borderStyle: "solid",
                borderColor: "#ECECEC",
              }}
            >
              <CardContent>
                <Typography
                  variant="h6"
                  fontWeight="bold"
                  gutterBottom
                  sx={styles.dashboardMainCardTitle}
                >
                  {section.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  gutterBottom
                  sx={styles.dashboardMainCardSubtitle}
                >
                  {section.subtitle}
                </Typography>
                {section.items &&
                  section.items.map((item, idx) => (
                    <Button
                      key={idx}
                      variant="outlined"
                      fullWidth
                      sx={{
                        justifyContent: "space-between",
                        mb: 1,
                        borderRadius: "16px",
                        textTransform: "none",
                        borderColor: "#e0e0e0",
                        "&:hover": {
                          borderColor: "#bdbdbd",
                          backgroundColor: "transparent",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          textAlign: "left",
                          flexDirection: "row",
                          display: "flex",
                        }}
                        gap={1}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontSize: {
                              xs: "1em",
                              sm: "1.25em",
                              md: "0.8em",
                              lg: "1.2em",
                              xl: "1em",
                            },
                            fontWeight: "600",
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{
                            fontSize: {
                              xs: "1em",
                              sm: "1.25em",
                              md: "0.8em",
                              lg: "1.2em",
                              xl: "0.9em",
                            },
                            fontWeight: "400",
                          }}
                        >
                          {item.date || item.description}
                        </Typography>
                      </Box>
                      <EastIcon />
                    </Button>
                  ))}
              </CardContent>
              {index === 1 && (
                <Box
                  sx={{
                    display: "flex",
                    mt: 3,
                    justifyContent: "space-evenly",
                  }}
                >
                  {sections.map((section, index) => (
                    <Badge
                      key={index}
                      badgeContent={section.unfinished}
                      color="primary"
                      sx={{ mx: 2 }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                        }}
                      >
                        {React.cloneElement(section.icon, {
                          color: "action",
                          sx: { fontSize: 28, color: colors.lighterBlack },
                        })}
                        <Typography
                          variant="caption"
                          color={colors.lighterBlack}
                          sx={{ mt: 0.5 }}
                        >
                          {section.title === "Unfinished actions"
                            ? "Clinics"
                            : section.title}
                        </Typography>
                      </Box>
                    </Badge>
                  ))}
                </Box>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default function Home() {
  const [t] = useTranslation();

  return (
    <Box
      sx={{
        backgroundColor: colors.backgroundWhite,
        flexGrow: 1,
        p: { xs: 2, sm: 3, md: 5, lg: 5, xl: 5 }, // Responsive padding
      }}
    >
      <Navbar />
      <Box height={32} />
      <Box
        sx={{
          display: "flex",
          backgroundColor: colors.backgroundWhite,
          width: "100%",
          height: "100%",
        }}
      >
        <Box component="main" sx={{ flexGrow: 1, px: 3 }}>
          <Grid
            container
            spacing={2}
            style={{ justifyContent: "space-between", width: "100%" }}
          >
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title={t("totalOrders")} value={0} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title={t("totalVisitors")} value={0} />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title={t("totalEarnings")} value={0} prefix="$" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title={t("totalIncome")} value={0} prefix="$" />
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <StatCard title={t("totalExpenses")} value={0} prefix="$" />
            </Grid>
          </Grid>

          <LatestUpdates />

          <Grid
            container
            spacing={2}
            sx={{ mt: 0, justifyContent: "space-between" }}
          >
            <Grid item xs={12} md={6.9}>
              <Card
                sx={{
                  borderRadius: "24px",
                  boxShadow: "0px 3px 7px #A3A3A350",
                }}
              >
                <CardContent>
                  <VBarChart />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={5}>
              <Card
                sx={{
                  height: "44vh",
                  borderRadius: "24px",
                  boxShadow: "0px 3px 7px #A3A3A350",
                }}
              >
                <CardContent>
                  <PieChart />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Card
                sx={{
                  height: "35vh",
                  borderRadius: "24px",
                  boxShadow: "0px 3px 7px #A3A3A350",
                }}
              >
                <CardContent>
                  <BarChart />
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Card
                sx={{
                  height: "40vh",
                  borderRadius: "24px",
                  boxShadow: "0px 3px 7px #A3A3A350",
                }}
              >
                <CardContent>
                  <GeoChart />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
