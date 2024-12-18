import React from "react";
import { Box, Typography, Grid, Card, Stack, CardContent } from "@mui/material";
import CountUp from "react-countup";
import Sidenav from "../components/Sidenav";
import Navbar from "../components/Navbar";
import GeoChart from "../charts/GeoChart";
import PieChart from "../charts/PieChart";
import BarChart from "../charts/BarChart";
import { colors } from "../utilities/colors";

const StatCard = ({ title, value, className }) => (
  <Card sx={{ height: "19vh" }} className={className}>
    <CardContent>
      <Typography
        gutterBottom
        variant="p"
        component="div"
        sx={{ color: "#f0fcfc", padding: "7px 0px" }}
      >
        {title}
      </Typography>
      <Typography
        gutterBottom
        variant="h5"
        component="div"
        sx={{ color: "#f0fcfc" }}
      >
        <CountUp delay={0.2} end={value} duration={0.4} />
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ color: "#ccd1d1" }}
      >
        Since last week
      </Typography>
    </CardContent>
  </Card>
);

export default function Analytics() {
  return (
    <Box
      sx={{
        backgroundColor: colors?.backgroundWhite,
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
      <Box height={70} />
      <Box sx={{ display: "flex" }}>
        <Sidenav />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={5}>
              <Stack direction="row" spacing={2}>
                <Box sx={{ width: "50%" }}>
                  <StatCard
                    title="Visitors"
                    value={22000}
                    className="gradient"
                  />
                  <Box mt={2}>
                    <StatCard
                      title="Visitors"
                      value={20000}
                      className="gradient"
                    />
                  </Box>
                </Box>
                <Box sx={{ width: "50%" }}>
                  <StatCard
                    title="Visitors"
                    value={22000}
                    className="gradientlight"
                  />
                  <Box mt={2}>
                    <StatCard
                      title="Visitors"
                      value={32000}
                      className="gradientlight"
                    />
                  </Box>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={7}>
              <Card sx={{ height: "40vh" }}>
                <CardContent>
                  <BarChart />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          <Box height={16} />
          <Grid container spacing={2}>
            <Grid item xs={8}>
              <Card sx={{ height: "40vh" }}>
                <CardContent>
                  <GeoChart />
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4}>
              <Card sx={{ height: "40vh" }}>
                <CardContent>
                  <PieChart />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
