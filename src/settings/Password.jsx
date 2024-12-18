import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../appStore";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  getAuth,
  signInWithEmailAndPassword,
  updatePassword,
} from "firebase/auth";
import {
  Grid,
  Typography,
  TextField,
  Button,
  CardContent,
} from "@mui/material";
import { colors } from "../utilities/colors";
import { commonStyles } from "../utilities/commonStyles";

export default function Password() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [t] = useTranslation();
  const { changeSnackBarVisibility, changeSnackBarText } = useAppStore(
    (state) => state
  );
  const [loading, setLoading] = useState(false);
  const [values, setValues] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  // Re-authenticate the user
  const reauthenticate = async (currentPassword) => {
    const auth = getAuth();
    const user = auth.currentUser;
    try {
      await signInWithEmailAndPassword(auth, user.email, currentPassword);
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  };

  const handleSubmit = async (event) => {
    setLoading(true);
    event.preventDefault();

    if (values.newPassword !== values.confirmPassword) {
      changeSnackBarText(t("newAndOldPassword"));
      changeSnackBarVisibility(true);
      setLoading(false);
      return;
    }

    // Re-authenticate the user with the current password
    const isReauthenticated = await reauthenticate(values.currentPassword);
    if (!isReauthenticated) {
      changeSnackBarText(t("incorrectPassword"));
      changeSnackBarVisibility(true);
      setLoading(false);
      return;
    }

    // Update the password
    const auth = getAuth();
    try {
      await updatePassword(auth.currentUser, values.newPassword);
      changeSnackBarText(t("passwordUpdated"));
      changeSnackBarVisibility(true);
      setValues({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error(error);
      changeSnackBarText(t("passwordUpdateFailed"));
      changeSnackBarVisibility(true);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        container
        spacing={2}
        sx={{ justifyContent: "center", display: "flex" }}
      >
        <Grid item xs={12}>
          {/* <Card> */}
          <CardContent>
            <Typography
              variant="h6"
              align="left"
              fontSize={commonStyles?.dashboardFontSize}
              sx={{
                // fontSize: "24px",
                color: colors?.lighterBlack,
                fontWeight: "400",
              }}
            >
              {t("changePassword")}
            </Typography>

            {/* <Divider sx={{ mt: 2 }} /> */}

            <Grid container spacing={2} sx={{ mt: "20" }}>
              <Grid item xs={isMobile ? 12 : 3}>
                <TextField
                  color="secondary"
                  id="current-password"
                  type="password"
                  label={t("currentPassword")}
                  name="currentPassword"
                  value={values.currentPassword}
                  onChange={handleChange}
                  sx={{ marginTop: "25px", minWidth: "100%" }}
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: "20" }}>
              <Grid item xs={isMobile ? 12 : 3}>
                <TextField
                  color="secondary"
                  id="new-password"
                  type="password"
                  label={t("newPassword")}
                  name="newPassword"
                  value={values.newPassword}
                  onChange={handleChange}
                  sx={{ marginTop: "25px", minWidth: "100%" }}
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={isMobile ? 12 : 3}>
                <TextField
                  color="secondary"
                  type="password"
                  id="confirm-password"
                  label={t("confirmPassword")}
                  name="confirmPassword"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  sx={{ marginTop: "25px", minWidth: "100%" }}
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
          {/* </Card> */}
        </Grid>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          sx={{
            borderRadius: "16px",
            borderWidth: 1,
            color: colors?.lightBlack,
            justifyContent: "center",
            display: "flex",
            alignSelf: "center",
            marginTop: "40px",
          }}
          disabled={loading}
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
            {loading ? t("updating") : t("update")}
          </Typography>
        </Button>
      </Grid>

      {/* <Button
        variant="contained"
        color="secondary"
        type="submit"
        sx={{ mt: "3rem" }}
        disabled={loading}
      >
        {loading ? t("updating") : t("update")}
      </Button> */}
    </form>
  );
}
