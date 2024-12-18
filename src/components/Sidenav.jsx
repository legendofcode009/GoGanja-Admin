import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { useNavigate, useLocation } from "react-router-dom";
import GroupIcon from "@mui/icons-material/Group";
import { useAppStore } from "../appStore";
import SettingsIcon from "@mui/icons-material/Settings";
import HomeIcon from "@mui/icons-material/Home";
import AnalyticsIcon from "@mui/icons-material/Analytics";
import DateRangeIcon from "@mui/icons-material/DateRange";
import "../Dashboard.css";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;

const openedMixin = (theme) => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
  // background: theme.palette.primary.main,
  background: theme.palette.background.main,
});

const closedMixin = (theme) => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
  // background: theme.palette.primary.main,
  background: theme.palette.background.main,
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function Sidenav() {
  const [t] = useTranslation();
  const theme = useTheme();
  // const [open, setOpen] = React.useState(true);
  const navigate = useNavigate();
  const open = useAppStore((state) => state.dopen);
  const location = useLocation();

  return (
    <Drawer variant="permanent" open={open}>
      <DrawerHeader>
        {/* <IconButton onClick={() => setOpen(!open)}>
         <MenuIcon />
        </IconButton> */}
      </DrawerHeader>
      <List>
        <ListItem
          disablePadding
          sx={{ display: "block" }}
          onClick={() => {
            navigate("/");
          }}
        >
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              color: "#fff",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                ml: open ? 1 : "auto",
                justifyContent: "center",
              }}
            >
              <HomeIcon
                sx={{ fontSize: 20 }}
                color={location?.pathname === "/" ? "secondary" : "primary"}
              />
            </ListItemIcon>

            <ListItemText
              // primary="Dashboard"
              primary={t("dashboard")}
              sx={{
                opacity: open ? 1 : 0,
              }}
              primaryTypographyProps={{
                fontWeight: location?.pathname === "/" ? "bold" : "normal",
                color: location?.pathname === "/" ? "secondary" : "primary",
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem
          disablePadding
          sx={{ display: "block" }}
          onClick={() => {
            navigate("/clinics");
          }}
        >
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              color: "#fff",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                ml: open ? 1 : "auto",
                justifyContent: "center",
              }}
            >
              <ShoppingCartIcon
                sx={{ fontSize: 20 }}
                color={
                  location?.pathname === "/clinics" ? "secondary" : "primary"
                }
              />
            </ListItemIcon>
            <ListItemText
              // primary="Clinics"
              primary={t("clinics")}
              sx={{
                opacity: open ? 1 : 0,
              }}
              primaryTypographyProps={{
                fontWeight:
                  location?.pathname === "/clinics" ? "bold" : "normal",
                color:
                  location?.pathname === "/clinics" ? "secondary" : "primary",
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem
          disablePadding
          sx={{ display: "block" }}
          onClick={() => {
            navigate("/bookings");
          }}
        >
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              color: "#fff",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                ml: open ? 1 : "auto",
                justifyContent: "center",
              }}
            >
              <DateRangeIcon
                sx={{ fontSize: 20 }}
                color={
                  location?.pathname === "/bookings" ? "secondary" : "primary"
                }
              />
            </ListItemIcon>
            <ListItemText
              // primary="Bookings"
              primary={t("bookings")}
              sx={{
                opacity: open ? 1 : 0,
              }}
              primaryTypographyProps={{
                fontWeight:
                  location?.pathname === "/bookings" ? "bold" : "normal",
                color:
                  location?.pathname === "/bookings" ? "secondary" : "primary",
              }}
            />
          </ListItemButton>
        </ListItem>

        {/* <ListItem
          disablePadding
          sx={{ display: "block" }}
          onClick={() => {
            navigate("/analytics");
          }}
        >
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              color: "#fff",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                ml: open ? 1 : "auto",
                justifyContent: "center",
              }}
            >
              <AnalyticsIcon sx={{ fontSize:  location?.pathname === "/" ? 20:18}} color="secondary" />
            </ListItemIcon>
            <ListItemText
              primary="Analytics"
              sx={{
                opacity: open ? 1 : 0,
                color: theme.palette.secondary.main,
              }}
            />
          </ListItemButton>
        </ListItem> */}

        <ListItem
          disablePadding
          sx={{ display: "block" }}
          onClick={() => {
            navigate("/settings");
          }}
        >
          <ListItemButton
            sx={{
              minHeight: 48,
              justifyContent: open ? "initial" : "center",
              px: 2.5,
              color: "#fff",
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                mr: open ? 2 : "auto",
                ml: open ? 1 : "auto",
                justifyContent: "center",
              }}
            >
              <SettingsIcon
                sx={{ fontSize: 20 }}
                color={
                  location?.pathname === "/settings" ? "secondary" : "primary"
                }
              />
            </ListItemIcon>
            <ListItemText
              // primary="Settings"
              primary={t("settings")}
              sx={{
                opacity: open ? 1 : 0,
              }}
              primaryTypographyProps={{
                fontWeight:
                  location?.pathname === "/settings" ? "bold" : "normal",
                color:
                  location?.pathname === "/settings" ? "secondary" : "primary",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </Drawer>
  );
}
