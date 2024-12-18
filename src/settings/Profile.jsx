import { useAuth } from "../context/UserContext";
import { useTranslation } from "react-i18next";
import {
  Card,
  CardContent,
  Grid,
  Typography,
  Divider,
  Box,
  Stack,
} from "@mui/material";
import {
  Email as EmailIcon,
  Smartphone as SmartphoneIcon,
  LocationOn as LocationOnIcon,
} from "@mui/icons-material";

export default function Profile() {
  const { userData } = useAuth();
  const [t] = useTranslation();

  return (
    <>
      <Grid container spacing={2} sx={{ mt: "200" }}>
        <Grid item md={4}>
          <Grid container spacing={2} sx={{ mt: "20" }}>
            <Grid item md={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" align="left">
                    {userData?.name}
                  </Typography>
                  <Divider sx={{ mt: 2 }} />
                  <Stack direction="row" spacing={2}>
                    <div>
                      <EmailIcon sx={{ m: 2 }} />
                    </div>
                    <div>
                      <p>{userData?.email || "-"}</p>
                    </div>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2}>
                    <div>
                      <SmartphoneIcon sx={{ m: 2 }} />
                    </div>
                    <div>
                      <p>{userData?.phone || "-"}</p>
                    </div>
                  </Stack>
                  <Divider />
                  <Stack direction="row" spacing={2}>
                    <div>
                      <LocationOnIcon sx={{ m: 2 }} />
                    </div>
                    <div>
                      <p>{userData?.location || "-"}</p>
                    </div>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={8}>
          <Grid container spacing={2} sx={{ mt: "200" }}>
            <Grid item md={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" align="left">
                    {/* About me */}
                    {t("aboutMe")}
                  </Typography>
                  <Divider sx={{ mt: 2 }} />
                  <Typography variant="body2" gutterBottom sx={{ mt: 2 }}>
                    {userData?.bio || "-"}
                  </Typography>
                  <Typography variant="h6" align="left" sx={{ mt: "30px" }}>
                    {/* Details */}
                    {t("details")}
                  </Typography>
                  <Divider sx={{ mt: 2 }} />
                  <Box sx={{ m: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="subtitle2" sx={{ width: "140px" }}>
                        {/* Full Name: */}
                        {t("fullName")}:
                      </Typography>
                      <Typography variant="body2">
                        {userData?.name || "-"}
                      </Typography>
                    </Stack>
                  </Box>
                  <Divider />
                  <Box sx={{ m: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="subtitle2" sx={{ width: "140px" }}>
                        {t("firstName")}:
                      </Typography>
                      <Typography variant="body2">
                        {userData?.fatherName || "-"}
                      </Typography>
                    </Stack>
                  </Box>
                  <Divider />
                  <Box sx={{ m: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="subtitle2" sx={{ width: "140px" }}>
                        {/* Address: */}
                        {t("address")}:
                      </Typography>
                      <Typography variant="body2">
                        {userData?.location || "-"}
                      </Typography>
                    </Stack>
                  </Box>
                  <Divider />
                  <Box sx={{ m: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="subtitle2" sx={{ width: "140px" }}>
                        {/* Zip Code: */}
                        {t("zipCode")}:
                      </Typography>
                      <Typography variant="body2">
                        {userData?.zipCode || "-"}
                      </Typography>
                    </Stack>
                  </Box>
                  <Divider />
                  <Box sx={{ m: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Typography variant="subtitle2" sx={{ width: "140px" }}>
                        {/* Website: */}
                        {t("website")}:
                      </Typography>
                      <Typography variant="body2">
                        {userData?.profileUrl || "-"}
                      </Typography>
                    </Stack>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
