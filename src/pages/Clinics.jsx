import React from "react";
import Box from "@mui/material/Box";
import Navbar from "../components/Navbar";
import ClinicsList from "../products/ClinicList";
import { colors } from "../utilities/colors";

export default function Clinics() {
  return (
    <>
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
          height: "100vh",
        }}
      >
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <ClinicsList />
        </Box>
      </Box>
    </>
  );
}
