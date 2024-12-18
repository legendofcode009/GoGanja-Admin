import Navbar from "../components/Navbar";
import { Box } from "@mui/material";
import CalendarComponent from "../components/Calendar";
import { colors } from "../utilities/colors";

export default function Bookings() {
  return (
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
      <Box sx={{ display: "flex" }}>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: 3,
          }}
        >
          <CalendarComponent />
        </Box>
      </Box>
    </Box>
  );
}
