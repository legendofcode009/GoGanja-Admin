import { useState } from "react";
import { useAuth } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import { getAuth } from "firebase/auth";
import { db } from "../firebase-config";
import { doc, setDoc } from "firebase/firestore/lite";
import Swal from "sweetalert2";
import useMediaQuery from "@mui/material/useMediaQuery";
import {
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  CardContent,
  Container,
  Box,
} from "@mui/material";
import { constants } from "../utilities/constants";
import { colors } from "../utilities/colors";
import { commonStyles } from "../utilities/commonStyles";

export default function Personal() {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [t] = useTranslation();
  const [loading, setLoading] = useState(false);
  const { userData, updateUser } = useAuth();
  const [values, setValues] = useState({
    name: userData?.name || "",
    location: userData?.location || "",
    bio: userData?.bio || "",
    userType: userData?.userType || "",
    phone: userData?.phone || "",
    email: userData?.email || "",
    profileUrl: userData?.profileUrl || "",
    address: userData?.address || "",
    fatherName: userData?.fatherName || "",
    zipCode: userData?.zipCode || "",
  });

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

  const handleChange = (event) => {
    setValues({
      ...values,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
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

    // Update user data in context
    updateUser(values);

    // // Update user data in Firestore
    const auth = getAuth();
    const userRef = doc(db, "users", auth.currentUser.uid);
    await setDoc(userRef, values, { merge: true });

    Swal.fire(t("updated"), t("personalDetailsUpdated"), "success");
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid
        container
        spacing={2}
        sx={{
          flexDirection: isMobile ? "column" : "row",
        }}
      >
        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, pb: 4 }}>
            <Typography
              fontSize={commonStyles?.dashboardFontSize}
              variant="h6"
              align="left"
              sx={{
                color: colors?.lighterBlack,
                fontWeight: "400",
              }}
            >
              {t("personalInformation")}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  label={t("name")}
                  value={values.name}
                  onChange={handleChange}
                  name="name"
                  sx={{ mt: 2, minWidth: "100%" }}
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  label={t("location")}
                  name="location"
                  select
                  sx={{ mt: 2, minWidth: "100%" }}
                  variant="outlined"
                  value={values.location}
                  onChange={handleChange}
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

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  label={t("fatherName")}
                  value={values.fatherName}
                  onChange={handleChange}
                  name="fatherName"
                  sx={{ mt: 2, minWidth: "100%" }}
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  label={t("zipCode")}
                  name="zipCode"
                  value={values.zipCode}
                  onChange={handleChange}
                  sx={{ mt: 2, minWidth: "100%" }}
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  color="secondary"
                  id="outlined-multiline-flexible"
                  label={t("bio")}
                  name="bio"
                  value={values.bio}
                  onChange={handleChange}
                  sx={{ mt: 2, minWidth: "100%" }}
                  multiline
                  rows={3}
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  label={t("userType")}
                  name="userType"
                  value={values.userType}
                  onChange={handleChange}
                  select
                  sx={{ mt: 2, minWidth: "100%" }}
                  variant="outlined"
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
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Box sx={{ p: 2, pb: 4 }}>
            <Typography
              fontSize={commonStyles?.dashboardFontSize}
              variant="h6"
              align="left"
              sx={{
                color: colors?.lighterBlack,
                fontWeight: "400",
              }}
            >
              {t("contactInformation")}
            </Typography>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  label={t("contactPhone")}
                  name="phone"
                  value={values.phone}
                  onChange={handleChange}
                  type="number"
                  sx={{ mt: 2, minWidth: "100%" }}
                  variant="outlined"
                  onWheel={(e) => e.target.blur()}
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>

              <Grid item xs={6}>
                <TextField
                  color="secondary"
                  label={t("email")}
                  name="email"
                  value={values.email}
                  disabled
                  type="email"
                  sx={{ mt: 2, minWidth: "100%" }}
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  color="secondary"
                  label={t("profileUrl")}
                  name="profileUrl"
                  value={values.profileUrl}
                  onChange={handleChange}
                  sx={{ mt: 2, minWidth: "100%" }}
                  variant="outlined"
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12}>
                <TextField
                  color="secondary"
                  id="outlined-multiline-flexible"
                  label={t("address")}
                  name="address"
                  value={values.address}
                  onChange={handleChange}
                  sx={{ mt: 2, minWidth: "100%" }}
                  multiline
                  rows={3}
                  InputProps={{
                    style: {
                      borderRadius: "16px",
                    },
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>

        <Grid item xs={12} sx={{ mt: 2, textAlign: "center", ml: 2 }}>
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
              alignSelf: "center ",
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
      </Grid>
    </form>
  );
}
