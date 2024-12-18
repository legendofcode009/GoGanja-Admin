import * as React from "react";
import PropTypes from "prop-types";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import { auth } from "../firebase-config";
import { commonStyles } from "../utilities/commonStyles";
import { colors } from "../utilities/colors";
import { signOut } from "firebase/auth";
import {
  Box,
  Button,
  Card,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";
import Personal from "./Personal";
import Account from "./Account";
import Password from "./Password";

const StyledTabs = styled((props) => (
  <Tabs
    {...props}
    TabIndicatorProps={{ children: <span className="MuiTabs-indicatorSpan" /> }}
  />
))(({ theme }) => ({
  "& .MuiTabs-indicator": {
    display: "flex",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
  "& .MuiTabs-indicatorSpan": {
    width: "100%",
    backgroundColor: theme.palette.secondary.main,
  },
}));

const StyledTab = styled((props) => <Tab disableRipple {...props} />)(
  ({ theme }) => ({
    textTransform: "none",
    fontWeight: theme.typography.fontWeightRegular,
    fontSize: theme.typography.pxToRem(15),
    marginRight: theme.spacing(1),
    color: "#141414",
    fontWeight: "400",
    "&.Mui-selected": {
      color: theme.palette.secondary.main,
    },
    "&.Mui-focusVisible": {
      backgroundColor: theme.palette.secondary.main,
    },
  })
);

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

export default function List() {
  const { logoutUser, userData } = useAuth();
  const [t] = useTranslation();
  const [value, setValue] = React.useState(0);
  const { state } = useLocation();
  const { tab } = state || {};
  const navigate = useNavigate();
  const [openLogoutDialog, setOpenLogoutDialog] = React.useState(false);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  React.useEffect(() => {
    if (tab === "MyAccount") {
      setValue(2);
    }
  }, [tab]);

  const handleLogout = () => {
    setOpenLogoutDialog(true);
  };

  const handleCloseLogoutDialog = () => {
    setOpenLogoutDialog(false);
  };

  const handleConfirmLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("token");
    navigate("/login");
    logoutUser();
  };

  return (
    <Box sx={{ minHeight: 75 + "vh" }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography
          fontSize={commonStyles?.dashboardFontSize}
          variant="h4"
          fontWeight={600}
          sx={{ color: colors?.lighterBlack }}
        >
          {t("myAccount")}
        </Typography>
        <Button
          onClick={handleLogout}
          sx={{
            height: "56px",
            textTransform: "capitalize",
            borderRadius: "16px",
            color: colors?.lightBlack,
            paddingX: "51px",
            boxShadow: "0px 3px 7px #A3A3A350",
          }}
          variant="contained"
          startIcon={
            <LogoutIcon sx={{ color: colors?.lighterWhite, fontSize: 24 }} />
          }
        >
          <Typography
            sx={{
              fontWeight: "500",
              fontSize: "20px",
              color: colors?.lighterWhite,
            }}
          >
            {t("logOut")}
          </Typography>
        </Button>
      </Box>

      <Dialog
        open={openLogoutDialog}
        onClose={handleCloseLogoutDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        PaperProps={{
          style: {
            borderRadius: "16px",
            padding: "24px",
            width: "60%",
            maxWidth: "90%",
          },
        }}
      >
        <DialogTitle
          id="alert-dialog-title"
          sx={{
            fontWeight: 600,
            textAlign: "center",
            fontSize: "20px",
            mb: 2,
          }}
        >
          {t("logOutOfTheAccount")}
        </DialogTitle>

        <DialogContent>
          <DialogContentText
            id="alert-dialog-description"
            sx={{
              textAlign: "center",
              color: colors?.lightBlack,
              fontSize: "16px",
              fontWeight: 400,
            }}
          >
            {t("areYouSureYouWantToLogOutOfYourAccount")}
          </DialogContentText>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "40%",
            }}
          >
            <Button
              type="button"
              variant="outlined"
              color="primary"
              onClick={handleCloseLogoutDialog}
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
                {t("no")}
              </Typography>
            </Button>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              onClick={handleConfirmLogout}
              sx={{
                borderRadius: "16px",
                borderWidth: 1,
                color: colors?.lightBlack,
              }}
              autoFocus
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
                {t("yes")}
              </Typography>
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      <Card elevation={0} sx={{ borderRadius: 2 }}>
        {userData ? (
          <Box sx={{ width: "100%" }}>
            <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
              <StyledTabs
                value={value}
                onChange={handleChange}
                aria-label="styled tabs example"
              >
                {/* <StyledTab label={t("profile")} {...a11yProps(0)} /> */}
                <StyledTab label={t("personalDetails")} {...a11yProps(0)} />
                <StyledTab label={t("generalSettings")} {...a11yProps(1)} />
                <StyledTab label={t("changePassword")} {...a11yProps(2)} />
              </StyledTabs>
            </Box>

            {/* <TabPanel value={value} index={0}>
              <Profile />
            </TabPanel> */}

            <TabPanel value={value} index={0}>
              <Personal />
            </TabPanel>

            <TabPanel value={value} index={1}>
              <Account />
            </TabPanel>

            <TabPanel value={value} index={2}>
              <Password />
            </TabPanel>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              height: "100vh",
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Card>
    </Box>
  );
}
