import React from "react";
import Sidenav from "../components/Sidenav";
import Box from "@mui/material/Box";
import Navbar from "../components/Navbar";
import ProductsList from "../products/ProductsList";
import { colors } from "../utilities/colors";

export default function Products() {
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
        }}
      >
        <Navbar />
        <Box height={70} />
        <Box sx={{ display: "flex" }}>
          <Sidenav />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <ProductsList />
          </Box>
        </Box>
      </Box>
    </>
  );
}
