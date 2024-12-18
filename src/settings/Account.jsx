import { useState } from "react";
import { useAuth } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import { doc, updateDoc } from "firebase/firestore/lite";
import { auth, db } from "../firebase-config";
import Swal from "sweetalert2";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  TextField,
  Button,
  MenuItem,
} from "@mui/material";
import { constants } from "../utilities/constants";
import { commonStyles } from "../utilities/commonStyles";
import { colors } from "../utilities/colors";

export default function Account() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const { userData, updateUser } = useAuth();
  const user = auth.currentUser;

  const utypes = [
    {
      value: "Super Admin",
      label: t("superAdmin"),
    },
    {
      value: "Admin",
      label: t("admin"),
    },
    {
      value: "Manager",
      label: t("manager"),
    },
    {
      value: "User",
      label: t("user"),
    },
  ];

  const [state, setState] = useState({
    gilad: true,
    jason: false,
    antoine: true,
  });

  const [values, setValues] = useState({
    username: userData?.username || "",
    email: userData?.email || "",
    userType: userData?.userType || "",
    location: userData?.location || "",
  });

  const onValueChangeHandler = (event) => {
    setValues((prevValues) => ({
      ...prevValues,
      [event.target.name]: event.target.value,
    }));
  };

  const handleChange = (event) => {
    setState({
      ...state,
      [event.target.name]: event.target.checked,
    });
  };

  const onSubmitHandler = async (event) => {
    try {
      setLoading(true);
      event.preventDefault();

      // Check if any value is empty
      // for (let key in values) {
      //   if (values[key] === "") {
      //     alert(`Please fill in the ${key}`);
      //     setLoading(false);
      //     return;
      //   }
      // }

      await updateDoc(doc(db, "users", user.uid), values);
      updateUser(values);
      Swal.fire(t("updated"), t("accountDetailsUpdated"), "success");
      setLoading(false);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <form onSubmit={onSubmitHandler}>
      <Grid container spacing={2}>
        <Grid
          item
          xs={12}
          sx={{
            justifyContent: "center",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <CardContent>
            <Typography
              fontSize={commonStyles?.dashboardFontSize}
              variant="h6"
              align="left"
              sx={{
                color: colors?.lighterBlack,
                fontWeight: "400",
              }}
            >
              {t("generalSettings")}
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={isMobile ? 12 : 3}>
                <TextField
                  color="secondary"
                  label={t("userName")}
                  name="username"
                  sx={{ marginTop: "25px", minWidth: "100%" }}
                  variant="outlined"
                  onChange={onValueChangeHandler}
                  value={values.username}
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
                  label={t("email")}
                  type="email"
                  name="email"
                  disabled
                  value={values.email}
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

            <Grid container spacing={2}>
              <Grid item xs={isMobile ? 12 : 3}>
                <TextField
                  color="secondary"
                  label={t("userType")}
                  name="userType"
                  value={values.userType}
                  select
                  sx={{ marginTop: "25px", minWidth: "100%" }}
                  variant="outlined"
                  onChange={onValueChangeHandler}
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                >
                  {utypes.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={isMobile ? 12 : 3}>
                <TextField
                  color="secondary"
                  label={t("location")}
                  name="location"
                  select
                  sx={{ marginTop: "25px", minWidth: "100%" }}
                  variant="outlined"
                  value={values.location}
                  onChange={onValueChangeHandler}
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                >
                  {constants?.countries.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            </Grid>
          </CardContent>

          {/* <Button
            color="secondary"
            sx={{ margin: "16px" }}
            disabled={loading}
            variant="contained"
            type="submit"
          >
            {loading ? t("updating") : t("update")}
          </Button> */}
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
          {/* </Card> */}
        </Grid>
      </Grid>

      {/* <Grid container spacing={2} sx={{ mt: "200" }}>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" align="left">
                Advance Setting
              </Typography>
              <Divider sx={{ mt: 2 }} />
              <Grid container spacing={2} sx={{ mt: "20" }}>
                <Grid item xs={6}>
                  <FormControl component="fieldset" variant="standard">
                    <FormLabel component="legend">
                      Assign responsibility
                    </FormLabel>
                    <FormGroup>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={state.gilad}
                            onChange={handleChange}
                            name="gilad"
                            color="secondary"
                          />
                        }
                        label="Gilad Gray"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={state.jason}
                            onChange={handleChange}
                            name="jason"
                            color="secondary"
                          />
                        }
                        label="Jason Killian"
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={state.antoine}
                            onChange={handleChange}
                            name="antoine"
                            color="secondary"
                          />
                        }
                        label="Antoine Llorca"
                      />
                    </FormGroup>
                    <FormHelperText>Be careful</FormHelperText>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid> */}
    </form>
  );
}
