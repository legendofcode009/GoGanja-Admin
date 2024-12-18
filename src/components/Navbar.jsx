import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { signOut } from "firebase/auth";
import i18n from "i18next";
import {
  Box,
  Toolbar,
  IconButton,
  MenuItem,
  Menu,
  Button,
  Typography,
  Grid,
  InputBase,
  Image,
} from "@mui/material";
import {
  Translate as TranslateIcon,
  GridViewOutlined as GridViewOutlinedIcon,
  CalendarMonthOutlined as CalendarMonthOutlinedIcon,
  DomainAddOutlined as DomainAddOutlinedIcon,
  NotificationsNoneOutlined as NotificationsNoneOutlinedIcon,
  EmailOutlined as EmailOutlinedIcon,
  AccountCircleOutlined as AccountCircleOutlinedIcon,
  HealthAndSafetyOutlined as HealthAndSafetyOutlinedIcon,
} from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import { styled, alpha } from "@mui/material/styles";
import { useAppStore } from "../appStore";
import { auth } from "../firebase-config";
import { useAuth } from "../context/UserContext";
import { colors } from "../utilities/colors";
import MuiAppBar from "@mui/material/AppBar";
import { commonStyles } from "../utilities/commonStyles";
import Logo from "../assets/Logo.png";

const AppBar = styled(
  MuiAppBar,
  {}
)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: "red",
  width: "90%",
}));

const styles = {
  activeSelection: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    backgroundColor: colors?.golden,
    borderRadius: "16px",
    "&:hover": {
      background: colors?.golden,
    },
    paddingX: "20px",
  },
  activeTextSelection: {
    color: colors?.lighterWhite,
    textTransform: "capitalize",
    fontSize: commonStyles?.fontSize,
  },
  inActiveSelection: {
    flexDirection: "row",
    display: "flex",
    alignItems: "center",
    borderRadius: "16px",
    backgroundColor: "transparent",
    paddingX: "20px",
  },
  inActiveTextSelection: {
    color: colors?.lighterBlack,
    textTransform: "capitalize",
    fontSize: commonStyles?.fontSize,
  },
  middleContainer: {
    backgroundColor: colors.lighterWhite,
    boxShadow: "0px 3px 7px #A3A3A350",
    borderRadius: "24px",
    paddingY: {
      xs: "1.2em", // 0px
      sm: "0.7em", // 600px
      md: "0.9em", // 900px
      lg: "1em", // 1200px
      xl: "1em", // 1536px
    },
    paddingX: {
      xs: "0.9em", // 0px
      sm: "0.7em", // 600px
      md: "0.9em", // 900px
      lg: "1em", // 1200px
      xl: "1em", // 1536px
    },
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-around",
    alignSelf: "center",
    alignItems: "center",
    width: {
      xs: "40%", // 0px
      sm: "60%", // 600px
      md: "50%", // 900px
      lg: "50%", // 1200px
      xl: "60%", // 1536px
    },
  },
  notificationsContainer: {
    backgroundColor: colors.lighterWhite,
    boxShadow: "0px 3px 7px #A3A3A350",
    borderRadius: "24px",
    paddingY: {
      xs: "1.2em", // 0px
      sm: "1.3em", // 600px
      md: "1.3em", // 900px
      lg: "1.5em", // 1200px
      xl: "1.8em", // 1536px
    },
    paddingX: {
      xs: "0.5em", // 0px
      sm: "0.5em", // 600px
      md: "0.9em", // 900px
      lg: "0.9em", // 1200px
      xl: "1em", // 1536px
    },
    flexDirection: "row",
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    width: {
      xs: "15%", // 0px
      sm: "15%", // 600px
      md: "15%", // 900px
      lg: "20%", // 1200px
      xl: "15%", // 1536px
    },
  },
  translationContainer: {
    backgroundColor: colors.lighterWhite,
    borderRadius: "24px",
    boxShadow: "0px 3px 7px #A3A3A350",
    // paddingY: "15px",
    // paddingX: "15px",
    paddingY: {
      xs: "1.2em", // 0px
      sm: "1.3em", // 600px
      md: "1.3em", // 900px
      lg: "1.5em", // 1200px
      xl: "1.8em", // 1536px
    },
    paddingX: {
      xs: "0.8em", // 0px
      sm: "0.8em", // 600px
      md: "1em", // 900px
      lg: "1.5em", // 1200px
      xl: "1.5em", // 1536px
    },
    alignSelf: "center",
  },
  iconStyle: {
    xs: "1em", // 0px
    sm: "0.8em", // 600px
    md: "1em", // 900px
    lg: "1.8em", // 1200px
    xl: "2em", // 1536px
  },
  iconWithOutText: {
    xs: "0.9em", // 0px
    sm: "1em", // 600px
    md: "1.1em", // 900px
    lg: "1.3em", // 1200px
    xl: "1.5em", // 1536px
  },
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: "#31443510",
  "&:hover": {
    backgroundColor: "#31443525",
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: "100%",
  [theme.breakpoints.up("sm")]: {
    marginLeft: theme.spacing(3),
    width: "auto",
  },
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
    [theme.breakpoints.up("md")]: {
      width: "20ch",
    },
  },
}));

export default function Navbar() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [t] = useTranslation();
  const { logoutUser } = useAuth();
  const navigate = useNavigate();
  const { changeSnackBarVisibility, changeSnackBarText } = useAppStore(
    (state) => state
  );
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [anchorLang, setAnchorLang] = React.useState(null);
  const isMenuOpen = Boolean(anchorEl);
  const isLanguageMenuOpen = Boolean(anchorLang);

  const handleLanguageMenuOpen = (event) => {
    setAnchorLang(event.currentTarget);
  };

  const handleMenuClose = (val) => {
    setAnchorEl(null);
    setAnchorLang(null);
    if (val === "profile") {
      navigate("/settings");
    } else if (val === "myAccount") {
      navigate("/settings", { state: { tab: "MyAccount" } });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      navigate("/login");
      logoutUser();
    } catch (error) {
      console.error("Logout error:", error.message);
    }
  };

  const menuId = "primary-search-account-menu";

  const onChange = (value, name) => {
    i18n.changeLanguage(value);
    localStorage.setItem("SelectedLanguage", value);
    setAnchorLang(null);
    changeSnackBarText(`${t("switchedTo")}${name}`);
    changeSnackBarVisibility(true);
  };

  const handleNavigation = (val) => {
    const routes = {
      dashboard: "/",
      bookings: "/bookings",
      hotels: "/hotels",
      clinics: "/clinics",
      prescriptions: "/prescriptions",
      settings: "/settings",
    };
    navigate(routes[val]);
  };

  const renderLanguageMenu = (
    <Menu
      anchorEl={anchorLang}
      anchorOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: "top",
        horizontal: "right",
      }}
      open={isLanguageMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={() => onChange("en", "English")}>English</MenuItem>
      <MenuItem onClick={() => onChange("th", "Thai")}>Thai</MenuItem>
    </Menu>
  );

  return (
    <Grid
      xs={2}
      sm={4}
      md={4}
      sx={{ backgroundColor: colors?.backgroundWhite }}
    >
      <Toolbar
        sx={{
          justifyContent: "space-between",
          backgroundColor: "transparent",
          paddingTop: "1%",
          paddingBottom: "1%",
          alignSelf: "center",
          alignContent: "center",
          alignItems: "center",
          display: "flex",
        }}
      >
        <Button
          onClick={() => handleNavigation("dashboard")}
          sx={{
            backgroundColor: colors.lighterWhite,
            borderRadius: "24px",
            boxShadow: "0px 3px 7px #A3A3A350",
            justifyContent: "center",
            alignContent: "center",
            paddingTop: "19px",
            paddingBottom: "20px",
            width: {
              xs: "10%", // 0px
              sm: "10%", // 600px
              md: "15%", // 900px
              lg: "10%", // 1200px
              xl: "10%", // 1536px
            },
          }}
        >
          {/* <Typography
            fontWeight="700"
            sx={{
              color: colors?.lightBlack,
              textTransform: "capitalize",
              fontSize: {
                xs: "0.8em", // 0px
                sm: "0.9em", // 600px
                md: "1em", // 900px
                lg: "1.2em", // 1200px
                xl: "1.5em", // 1536px
              },
            }}
          >
            GoGanja
          </Typography> */}
          {/* <img
            src={Logo}
            style={{
              width: 50,
              height: 40,
            }}
            alt={"GoGanja Logo"}
            loading="eager"
          /> */}
          <Box
            component="img"
            src={Logo}
            alt="GoGanja Logo"
            sx={{
              width: {
                xs: "40px", // 0-599px
                sm: "45px", // 600-899px
                md: "50px", // 900-1199px
                lg: "55px", // 1200-1535px
                xl: "50px", // 1536px and up
              },
              height: "auto",
              maxHeight: {
                xs: "20px",
                sm: "25px",
                md: "25px",
                lg: "30px",
                xl: "40px",
              },
              objectFit: "contain",
            }}
          />
        </Button>

        <Box sx={styles.middleContainer}>
          {isMobile === false ? (
            <Button
              onClick={() => handleNavigation("dashboard")}
              startIcon={
                <GridViewOutlinedIcon
                  sx={{ fontSize: styles?.iconStyle }}
                  style={{
                    color:
                      window.location.pathname === "/"
                        ? colors?.lighterWhite
                        : colors?.lighterBlack,
                    fontSize: isMobile ? 15 : 20,
                  }}
                />
              }
              sx={
                window.location.pathname === "/"
                  ? styles?.activeSelection
                  : styles?.inActiveSelection
              }
            >
              <Typography
                fontWeight="600"
                sx={
                  window.location.pathname === "/"
                    ? styles?.activeTextSelection
                    : styles?.inActiveTextSelection
                }
              >
                {t("dashboard")}
              </Typography>
            </Button>
          ) : (
            <GridViewOutlinedIcon
              onClick={() => handleNavigation("dashboard")}
              style={{
                color:
                  window.location.pathname === "/"
                    ? colors?.golden
                    : colors?.lighterBlack,
                fontSize: isMobile ? 15 : 20,
              }}
            />
          )}

          {isMobile === false ? (
            <Button
              onClick={() => handleNavigation("bookings")}
              sx={{ fontSize: styles?.iconStyle }}
              startIcon={
                <CalendarMonthOutlinedIcon
                  style={{
                    color:
                      window.location.pathname === "/bookings"
                        ? colors?.lighterWhite
                        : colors?.lighterBlack,
                    // fontSize: isMobile ? 15 : 20,
                  }}
                />
              }
              sx={
                window.location.pathname === "/bookings"
                  ? styles?.activeSelection
                  : styles?.inActiveSelection
              }
            >
              <Typography
                fontWeight="600"
                sx={
                  window.location.pathname === "/bookings"
                    ? styles?.activeTextSelection
                    : styles?.inActiveTextSelection
                }
              >
                {t("bookings")}
              </Typography>
            </Button>
          ) : (
            <CalendarMonthOutlinedIcon
              onClick={() => handleNavigation("bookings")}
              style={{
                color:
                  window.location.pathname === "/bookings"
                    ? colors?.golden
                    : colors?.lighterBlack,
                fontSize: isMobile ? 15 : 20,
              }}
            />
          )}

          {isMobile === false ? (
            <Button
              onClick={() => handleNavigation("clinics")}
              startIcon={
                <DomainAddOutlinedIcon
                  sx={{ fontSize: styles?.iconStyle }}
                  style={{
                    color:
                      window.location.pathname === "/clinics" ||
                      window.location.pathname === "/add-clinic" ||
                      window.location.toString().includes("edit-clinic")
                        ? colors?.lighterWhite
                        : colors?.lighterBlack,
                    // fontSize: isMobile ? 15 : 20,
                  }}
                />
              }
              sx={
                window.location.pathname === "/clinics" ||
                window.location.pathname === "/add-clinic" ||
                window.location.toString().includes("edit-clinic")
                  ? styles?.activeSelection
                  : styles?.inActiveSelection
              }
            >
              <Typography
                fontWeight="600"
                sx={
                  window.location.pathname === "/clinics" ||
                  window.location.pathname === "/add-clinic" ||
                  window.location.toString().includes("edit-clinic")
                    ? styles?.activeTextSelection
                    : styles?.inActiveTextSelection
                }
              >
                {t("clinics")}
              </Typography>
            </Button>
          ) : (
            <DomainAddOutlinedIcon
              onClick={() => handleNavigation("clinic")}
              sx={{ fontSize: styles?.iconStyle }}
              style={{
                color:
                  window.location.pathname === "/clinics" ||
                  window.location.pathname === "/add-clinic" ||
                  window.location.toString().includes("edit-clinic")
                    ? colors?.golden
                    : colors?.lighterBlack,
                // fontSize: isMobile ? 15 : 20,
              }}
            />
          )}

          {isMobile === false ? (
            <Button
              onClick={() => handleNavigation("prescriptions")}
              startIcon={
                <HealthAndSafetyOutlinedIcon
                  style={{
                    color:
                      window.location.pathname === "/prescriptions" ||
                      window.location.pathname === "/prescription_management" ||
                      window.location.toString().includes("client_management")
                        ? colors?.lighterWhite
                        : colors?.lighterBlack,
                    // fontSize: isMobile ? 15 : 20,
                  }}
                  sx={{ fontSize: styles?.iconStyle }}
                />
              }
              sx={
                window.location.pathname === "/prescriptions" ||
                window.location.pathname === "/prescription_management" ||
                window.location.toString().includes("client_management")
                  ? styles?.activeSelection
                  : styles?.inActiveSelection
              }
            >
              <Typography
                fontWeight="600"
                sx={
                  window.location.pathname === "/prescriptions" ||
                  window.location.pathname === "/prescription_management" ||
                  window.location.toString().includes("client_management")
                    ? styles?.activeTextSelection
                    : styles?.inActiveTextSelection
                }
              >
                {t("prescriptions")}
              </Typography>
            </Button>
          ) : (
            <HealthAndSafetyOutlinedIcon
              onClick={() => handleNavigation("rooms")}
              style={{
                color:
                  window.location.pathname === "/prescriptions" ||
                  window.location.pathname === "/prescription_management" ||
                  window.location.toString().includes("client_management")
                    ? colors?.golden
                    : colors?.lighterBlack,
                fontSize: isMobile ? 15 : 20,
              }}
            />
          )}
        </Box>

        <Box sx={styles.notificationsContainer}>
          <NotificationsNoneOutlinedIcon
            style={{
              color: colors?.lighterBlack,
            }}
            sx={{ fontSize: styles?.iconWithOutText }}
          />
          {/* 
          <EmailOutlinedIcon
            style={{
              color: colors?.lighterBlack,
            }}
            sx={{ fontSize: styles?.iconWithOutText }}
          /> */}

          <AccountCircleOutlinedIcon
            onClick={() => handleNavigation("settings")}
            style={{
              color:
                window.location.pathname === "/settings"
                  ? colors?.golden
                  : colors?.lighterBlack,
            }}
            sx={{ fontSize: styles?.iconWithOutText }}
          />
        </Box>

        <Box sx={styles.translationContainer}>
          <TranslateIcon
            onClick={handleLanguageMenuOpen}
            style={{
              color: colors?.lighterBlack,
            }}
            sx={{ fontSize: styles?.iconWithOutText }}
          />
        </Box>
      </Toolbar>
      {renderLanguageMenu}
    </Grid>
  );
}
