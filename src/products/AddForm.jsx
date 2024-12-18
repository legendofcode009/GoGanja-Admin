import {
  Box,
  Button,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
  Stack,
  Badge,
} from "@mui/material";
import "../Dashboard.css";
import * as React from "react";
import { useState, useEffect, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar";
import Sidenav from "../components/Sidenav";
import SvgIcon from "@mui/material/SvgIcon";
import ThailandBahtIcon from "../components/CustomIcons";
import { db, storage } from "../firebase-config";
import CloseIcon from "@mui/icons-material/Close";
import Swal from "sweetalert2";
import { commonStyles } from "../utilities/commonStyles";
import AddIcon from "@mui/icons-material/Add";
import {
  addDoc,
  collection,
  getDocs,
  updateDoc,
} from "firebase/firestore/lite";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import MultiSelect from "../components/MultiSelect";
import MultiSelectTreatments from "../components/MultiSelectTreatments";
import Icon from "@mui/material/Icon";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../appStore";
import { styled } from "@mui/material/styles";
import { colors } from "../utilities/colors";
import useMediaQuery from "@mui/material/useMediaQuery";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

const Item = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(1),
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    right: 0,
    top: 0,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "14px 3px",
    borderRadius: "50%",
  },
}));

const BusinessHourRow = React.memo(
  ({ day, dayData, onTimeChange, onLinkClick, onClosedClick }) => {
    return (
      <Grid
        container
        rowSpacing={1}
        columnSpacing={1}
        sx={{
          border: 0.1,
          borderColor: "#ECECEC",
          margin: 1,
          padding: 1,
          borderRadius: "16px",
          boxShadow: "0px 3px 10px 0px #9999991A",
        }}
      >
        <Grid
          container
          direction="row"
          alignItems={"center"}
          justifyContent={"space-around"}
          sx={{ paddingY: "10px" }}
        >
          <IconButton
            disabled={dayData.closed}
            onClick={() => onLinkClick(day)}
          >
            <AddLinkIcon sx={{ fontSize: 30, color: colors?.lighterBlack }} />
          </IconButton>

          <FormControl disabled={dayData.closed} sx={{ width: "25%" }}>
            <TimePicker
              sx={{ svg: { color: colors?.golden } }}
              disabled={dayData.closed}
              value={dayData.opening}
              onChange={(time) => onTimeChange(day, "opening", time)}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  size="small"
                  variant="outlined"
                />
              )}
            />
          </FormControl>

          <Typography
            fontSize={commonStyles?.fontSize}
            variant="h4"
            fontWeight={400}
            sx={{
              marginBottom: "16px",
              color: colors?.lighterBlack,
              marginTop: "16px",
              width: "15%",
              textAlign: "center",
            }}
          >
            {day}
          </Typography>

          <FormControl disabled={dayData.closed} sx={{ width: "25%" }}>
            <TimePicker
              sx={{ svg: { color: colors?.golden } }}
              disabled={dayData.closed}
              value={dayData.closing}
              onChange={(time) => onTimeChange(day, "closing", time)}
              renderInput={(params) => (
                <TextField
                  color="secondary"
                  {...params}
                  size="small"
                  variant="outlined"
                />
              )}
            />
          </FormControl>

          <IconButton onClick={() => onClosedClick(day)}>
            <CancelOutlinedIcon
              sx={{ fontSize: 30, color: colors?.lighterBlack }}
            />
          </IconButton>
        </Grid>
      </Grid>
    );
  }
);

const BusinessHours = React.memo(
  ({ formData, handleTimeChange, linkButtonClick, closedButtonClick }) => {
    return (
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <Grid container spacing={0.1}>
          {Object.entries(formData.openingHours).map(([day, dayData]) => (
            <BusinessHourRow
              key={day}
              day={day}
              dayData={dayData}
              onTimeChange={handleTimeChange}
              onLinkClick={linkButtonClick}
              onClosedClick={closedButtonClick}
            />
          ))}
        </Grid>
      </LocalizationProvider>
    );
  }
);

const AddForm = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:960px)");
  const [t] = useTranslation();
  const { changeSnackBarVisibility, changeSnackBarText } = useAppStore(
    (state) => state
  );
  const [loading, setLoading] = useState(false);
  const cities = useMemo(
    () => [
      {
        value: "Bangkok",
        label: "Bangkok",
      },
      {
        value: "Pattaya",
        label: "Pattaya",
      },
      {
        value: "KoSamui",
        label: "Ko Samui",
      },
      {
        value: "ChiangMai",
        label: "Chiang Mai",
      },
      {
        value: "Phuket",
        label: "Phuket",
      },
    ],
    []
  );
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    initialConsultFee: "",
    featuredImage: "",
    featuredImageLocalUrl: "",
    additionalImages: [],
    services: [],
    treatments: [],
    important_information: "",
    openingHours: {
      Monday: { opening: null, closing: null, closed: false },
      Tuesday: { opening: null, closing: null, closed: false },
      Wednesday: { opening: null, closing: null, closed: false },
      Thursday: { opening: null, closing: null, closed: false },
      Friday: { opening: null, closing: null, closed: false },
      Saturday: { opening: null, closing: null, closed: false },
      Sunday: { opening: null, closing: null, closed: false },
    },
  });
  const [apiOpeningHours, setAPIOpeningHours] = useState({
    openingHours: {
      Monday: { opening: null, closing: null, closed: false },
      Tuesday: { opening: null, closing: null, closed: false },
      Wednesday: { opening: null, closing: null, closed: false },
      Thursday: { opening: null, closing: null, closed: false },
      Friday: { opening: null, closing: null, closed: false },
      Saturday: { opening: null, closing: null, closed: false },
      Sunday: { opening: null, closing: null, closed: false },
    },
  });
  const [open, setOpen] = React.useState(false);
  const [showAddButton, setShowAddButton] = useState(true);
  const [services, setServices] = useState([]);
  const [treatments, setTreatments] = useState([]);
  const [newService, setNewService] = useState("");
  const [rows, setRows] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const empCollectionRef = collection(db, "clinics");
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedTreatments, setSelectedTreatments] = useState([]);
  const [additionalImagesFiles, setAdditionalImagesFiles] = useState([]);

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  const createClinic = useCallback(async () => {
    setLoading(true);
    try {
      const {
        name,
        initialConsultFee,
        featuredImage,
        featuredImageLocalUrl,
        address,
        city,
        important_information,
        openingHours,
      } = formData;

      // Generate a unique filename for the featured image
      const featuredImageFileName = `${Date.now()}_${uuidv4()}_${
        featuredImageLocalUrl.name
      }`;
      const featuredImageRef = ref(
        storage,
        `clinic_images/${featuredImageFileName}`
      );

      await uploadBytesResumable(featuredImageRef, featuredImageLocalUrl);

      // Get the download URL for the featured image
      const featuredImageUrl = await getDownloadURL(featuredImageRef);

      // Upload additional images to Firebase Storage with unique filenames
      const additionalImageUrls = await Promise.all(
        additionalImagesFiles.map(async (file) => {
          const uniqueFileName = `${Date.now()}_${uuidv4()}_${file.name}`;
          const imageRef = ref(storage, `clinic_images/${uniqueFileName}`);
          await uploadBytesResumable(imageRef, file);
          return getDownloadURL(imageRef);
        })
      );

      // Save clinic data with image URLs to Firestore
      const uid = localStorage.getItem("uid");

      const docRef = await addDoc(empCollectionRef, {
        name,
        initialConsultFee: Number(initialConsultFee),
        address,
        city,
        featuredImage: featuredImageUrl,
        additionalImages: additionalImageUrls,
        date: String(new Date()),
        clinicAdmin: uid,
        important_information: important_information,
        treatments: selectedTreatments,
        services: selectedServices,
        openingHours: apiOpeningHours,
      });
      await updateDoc(docRef, { id: docRef.id });
      setLoading(false);

      Swal.fire(t("submitted"), t("yourFileHasBeenSubmitted"), "success").then(
        function () {
          window.location = "/clinics";
        }
      );
    } catch (error) {
      console.error("Error creating clinic:", error);
      // Handle error (show error message to user)
    } finally {
      setLoading(false);
    }
  }, [formData, selectedServices, selectedTreatments, apiOpeningHours]);

  const closedButtonClick = useCallback((day) => {
    setFormData((prevData) => ({
      ...prevData,
      openingHours: {
        ...prevData.openingHours,
        [day]: {
          ...prevData.openingHours[day],
          closed: !prevData.openingHours[day].closed,
          opening: null,
          closing: null,
        },
      },
    }));

    setAPIOpeningHours((prevData) => ({
      ...prevData,
      openingHours: {
        ...prevData.openingHours,
        [day]: {
          ...prevData.openingHours[day],
          closed: !prevData.openingHours[day].closed,
          opening: null,
          closing: null,
        },
      },
    }));
  }, []);

  const linkButtonClick = useCallback(
    (day) => {
      let openingTime = formData.openingHours[day].opening;
      let closingTime = formData.openingHours[day].closing;

      setFormData((prevData) => ({
        ...prevData,
        openingHours: Object.fromEntries(
          Object.entries(prevData.openingHours).map(([key, value]) => [
            key,
            { closed: false, opening: openingTime, closing: closingTime },
          ])
        ),
      }));

      setAPIOpeningHours((prevData) => ({
        ...prevData,
        openingHours: Object.fromEntries(
          Object.entries(prevData.openingHours).map(([key, value]) => [
            key,
            {
              closed: false,
              opening: dayjs(openingTime).format("hh:mm:ss A"),
              closing: dayjs(closingTime).format("hh:mm:ss A"),
            },
          ])
        ),
      }));

      changeSnackBarText(t("businessHourCopied"));
      changeSnackBarVisibility(true);
      setOpen(true);
    },
    [formData.openingHours, changeSnackBarText, changeSnackBarVisibility, t]
  );

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    if (name === "city") {
      setSelectedCity(value);
    }

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  }, []);

  const handleFeaturedImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      featuredImage: URL?.createObjectURL(file),
      featuredImageLocalUrl: file,
    }));
  }, []);

  const handleImageUpload = useCallback((e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      additionalImages: [
        ...prevData.additionalImages,
        URL.createObjectURL(file),
      ],
    }));
    setAdditionalImagesFiles((prevFiles) => [...prevFiles, file]);
    setShowAddButton(false);
  }, []);

  const handleAddImage = useCallback(() => {
    setShowAddButton(true);
  }, []);

  const handleDeleteProfileImage = useCallback(() => {
    setFormData((prevData) => ({
      ...prevData,
      featuredImage: "",
      featuredImageLocalUrl: "",
    }));
  }, []);

  const handleDeleteImage = useCallback(
    (index) => {
      const newImages = [...formData.additionalImages];
      newImages.splice(index, 1);
      setFormData((prevData) => ({ ...prevData, additionalImages: newImages }));

      const newFiles = [...additionalImagesFiles];
      newFiles.splice(index, 1);
      setAdditionalImagesFiles(newFiles);
    },
    [formData.additionalImages, additionalImagesFiles]
  );

  const handleServiceChange = useCallback((e) => {
    setNewService(e.target.value);
  }, []);

  const handleAddService = useCallback(() => {
    if (newService.trim() !== "") {
      setServices((prevServices) => [...prevServices, newService]);
      setNewService("");
    }
  }, [newService]);

  const handleDeleteService = useCallback(
    (index) => {
      const newServices = [...services];
      newServices.splice(index, 1);
      setServices(newServices);
    },
    [services]
  );

  const handleTimeChange = useCallback((day, timeType, time) => {
    const formattedTime = dayjs(time).format("hh:mm:ss A");
    setFormData((prevData) => ({
      ...prevData,
      openingHours: {
        ...prevData.openingHours,
        [day]: {
          ...prevData.openingHours[day],
          [timeType]: time,
        },
      },
    }));
    setAPIOpeningHours((prevData) => ({
      ...prevData,
      openingHours: {
        ...prevData.openingHours,
        [day]: {
          ...prevData.openingHours[day],
          [timeType]: formattedTime,
        },
      },
    }));
  }, []);

  const getServices = useCallback(async () => {
    try {
      const clinicsServicesRef = collection(db, "clinics_services_listing");
      const data = await getDocs(clinicsServicesRef);
      setServices(data?.docs?.map((doc) => doc?.data()?.services));
    } catch (error) {
      console.error("Error fetching services:", error);
    }
  }, []);

  const getTreatments = useCallback(async () => {
    try {
      const clinicsTreatmentsRef = collection(db, "clinics_treatments_listing");
      const data = await getDocs(clinicsTreatmentsRef);
      setTreatments(data?.docs?.map((doc) => doc?.data()?.treatments));
    } catch (error) {
      console.error("Error fetching treatments:", error);
    }
  }, []);

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <Icon>close_icon</Icon>
      </IconButton>
    </React.Fragment>
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, treatmentsData] = await Promise.all([
          getDocs(collection(db, "clinics_services_listing")),
          getDocs(collection(db, "clinics_treatments_listing")),
        ]);
        setServices(servicesData?.docs?.map((doc) => doc?.data()?.services));
        setTreatments(
          treatmentsData?.docs?.map((doc) => doc?.data()?.treatments)
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
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

        <Box
          sx={{
            display: "flex",
            padding: 2,
            minHeight: "900px",
            backgroundColor: colors?.backgroundWhite,
          }}
        >
          <Box
            sx={{
              flexDirection: "row",
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                fontSize={commonStyles?.dashboardFontSize}
                variant="h4"
                fontWeight={500}
                sx={{
                  marginBottom: "16px",
                  color: colors?.lighterBlack,
                  fontWeight: "600",
                }}
              >
                {t("addClinic")}
              </Typography>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                width: "100%",
                borderRadius: 5,
                boxShadow: 0,
                backgroundColor: colors?.lighterWhite,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    color="secondary"
                    id="name"
                    name="name"
                    label={t("name")}
                    variant="outlined"
                    fullWidth
                    value={formData.name}
                    onChange={handleInputChange}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    color="secondary"
                    id="city"
                    label={t("city")}
                    select
                    name="city"
                    variant="outlined"
                    fullWidth
                    value={selectedCity}
                    onChange={(e) => handleInputChange(e)}
                    InputProps={{
                      style: {
                        borderRadius: "16px",
                      },
                    }}
                  >
                    {cities.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Box>
                <Grid container spacing={2} sx={{ marginTop: 1 }}>
                  <Grid item xs={12} md={7}>
                    <TextField
                      color="secondary"
                      id="address"
                      label={t("address")}
                      name="address"
                      variant="outlined"
                      fullWidth
                      value={formData.address}
                      onChange={handleInputChange}
                      InputProps={{
                        style: {
                          borderRadius: "16px",
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <TextField
                      color="secondary"
                      id="initialConsultFee"
                      name="initialConsultFee"
                      label={t("initialConsultFee")}
                      variant="outlined"
                      fullWidth
                      type="string"
                      value={formData.initialConsultFee}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: (
                          <ThailandBahtIcon
                            color="primary"
                            fontSize="default"
                          />
                        ),
                        style: {
                          borderRadius: "16px",
                        },
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2} gap={2} sx={{ marginTop: 1 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      color="secondary"
                      id="important_information"
                      label={t("importantInformation")}
                      name="important_information"
                      variant="outlined"
                      fullWidth
                      value={formData.important_information}
                      onChange={handleInputChange}
                      InputProps={{
                        style: {
                          borderRadius: "16px",
                        },
                      }}
                    />
                  </Grid>
                  <Grid
                    container
                    spacing={2}
                    sx={{ marginTop: 0 }}
                    xs={12}
                    md={8}
                  >
                    <Grid item xs={12} md={6}>
                      <MultiSelect
                        data={services}
                        value={selectedServices}
                        setValue={(val) => setSelectedServices(val)}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <MultiSelectTreatments
                        data={treatments}
                        value={selectedTreatments}
                        setValue={(val) => setSelectedTreatments(val)}
                      />
                    </Grid>
                  </Grid>
                </Grid>

                <Grid
                  container
                  spacing={0}
                  sx={{
                    marginTop: 0,
                    flexDirection: "row",
                  }}
                >
                  <Grid item xs={12} md={7.5}>
                    <Typography
                      fontSize={commonStyles?.fontSize}
                      variant="h4"
                      fontWeight={500}
                      sx={{
                        marginBottom: "16px",
                        color: colors?.lighterBlack,
                        fontWeight: "500",
                        marginTop: "16px",
                      }}
                    >
                      {t("businessHours")}
                    </Typography>
                    <BusinessHours
                      formData={formData}
                      handleTimeChange={handleTimeChange}
                      linkButtonClick={linkButtonClick}
                      closedButtonClick={closedButtonClick}
                    />
                  </Grid>

                  <Grid item xs={12} md={4.5}>
                    <Typography
                      fontSize={commonStyles?.fontSize}
                      variant="h4"
                      fontWeight={500}
                      sx={{
                        marginBottom: "16px",
                        color: colors?.lighterBlack,
                        fontWeight: "500",
                        marginTop: "16px",
                      }}
                    >
                      {t("selectMainImage")}
                    </Typography>

                    <Item
                      sx={{ display: "flex", alignItems: "center", gap: 4 }}
                    >
                      <Button
                        variant="text"
                        component="label"
                        name="image"
                        sx={{
                          width: "max-content",
                          height: "max-content",
                          textAlign: "center",
                          fontSize: "0.8rem",
                        }}
                      >
                        <input
                          type="file"
                          hidden
                          id="main_image"
                          name="image"
                          onChange={(e) => handleFeaturedImageUpload(e)}
                          accept="image/*"
                        />
                        <Box
                          sx={{
                            borderWidth: "1px",
                            borderColor: colors?.lighterBlack,
                            width: "138px",
                            height: "138px",
                            backgroundColor: "#fff",
                            borderRadius: "24px",
                            alignItems: "center",
                            justifyContent: "center",
                            display: "flex",
                            borderStyle: "solid",
                          }}
                        >
                          <AddIcon color="#808080" />
                        </Box>
                      </Button>
                      {formData?.featuredImage && (
                        <StyledBadge
                          color="secondary"
                          badgeContent={<CloseIcon sx={{ fontSize: "20px" }} />}
                          sx={{
                            cursor: "pointer",
                            padding: "0px !important",
                          }}
                          className="hello"
                          onClick={() => handleDeleteProfileImage()}
                        >
                          <img
                            src={formData?.featuredImage}
                            alt="preview of selected"
                            height="150px"
                            width="150px"
                            style={{
                              borderRadius: "10px",
                              objectFit: "cover",
                            }}
                          />
                        </StyledBadge>
                      )}
                    </Item>

                    <Box sx={{ padding: "10px 0" }}>
                      <Typography
                        fontSize={commonStyles?.fontSize}
                        variant="h4"
                        fontWeight={500}
                        sx={{
                          marginBottom: "16px",
                          color: colors?.lighterBlack,
                          fontWeight: "500",
                          marginTop: "16px",
                        }}
                      >
                        {t("photos")}
                      </Typography>
                    </Box>

                    <Stack
                      mb={5}
                      display="flex"
                      flexDirection={{ xs: "column", sm: "row" }}
                      alignItems={"center"}
                      gap={4}
                    >
                      <Stack>
                        <Button
                          disabled={
                            formData?.additionalImages?.length >= 25
                              ? true
                              : false
                          }
                          // variant="contained"
                          component="label"
                          name="ImgFile"
                          sx={{
                            width: "max-content",
                            height: "max-content",
                            textAlign: "center",
                            fontSize: "0.8rem",
                            borderRadius: "24px",
                          }}
                        >
                          <input
                            disabled={
                              formData?.additionalImages?.length >= 25
                                ? true
                                : false
                            }
                            type="file"
                            hidden
                            id="IdImages"
                            name="IdImages"
                            onChange={(e) => {
                              handleImageUpload(e);
                            }}
                            accept="image/*"
                          />
                          <Box
                            sx={{
                              borderWidth: "1px",
                              borderColor: colors?.lighterBlack,
                              width: "138px",
                              height: "138px",
                              backgroundColor: "#fff",
                              borderRadius: "24px",
                              alignItems: "center",
                              justifyContent: "center",
                              display: "flex",
                              borderStyle: "solid",
                            }}
                          >
                            <AddIcon color="#808080" />
                          </Box>
                        </Button>
                      </Stack>

                      {formData?.additionalImages?.length !== 0 ? (
                        <Stack
                          display="flex"
                          flexDirection={"row"}
                          gap="1rem"
                          useFlexGap
                          flexWrap="wrap"
                        >
                          {formData?.additionalImages &&
                            formData?.additionalImages.map((res, index) => {
                              return (
                                <StyledBadge
                                  key={index}
                                  color="secondary"
                                  badgeContent={
                                    <CloseIcon sx={{ fontSize: "20px" }} />
                                  }
                                  sx={{
                                    cursor: "pointer",
                                    padding: "0px !important",
                                  }}
                                  className="hello"
                                  onClick={() => handleDeleteImage(index)}
                                >
                                  <img
                                    src={res}
                                    alt="preview of additional"
                                    height="150px"
                                    width="150px"
                                    style={{
                                      borderRadius: "10px",
                                      objectFit: "cover",
                                    }}
                                  />
                                </StyledBadge>
                              );
                            })}
                        </Stack>
                      ) : (
                        ""
                      )}
                    </Stack>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: { xs: "center", sm: "flex-end" },
                    gap: "10px",
                    marginTop: "20px",
                  }}
                >
                  <Button
                    disabled={loading}
                    type="button"
                    variant="outlined"
                    color="primary"
                    onClick={() => {
                      navigate("/clinics");
                    }}
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
                      {t("cancel")}
                    </Typography>
                  </Button>

                  <Button
                    type="submit"
                    variant="contained"
                    color="primary"
                    onClick={createClinic}
                    sx={{
                      borderRadius: "16px",
                      borderWidth: 1,
                      color: colors?.lightBlack,
                    }}
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
                      {loading ? (
                        <CircularProgress
                          sx={{
                            color: colors?.lighterWhite,
                            fontSize: "12px",
                          }}
                          size={24}
                        />
                      ) : (
                        t("create")
                      )}
                    </Typography>
                  </Button>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default React.memo(AddForm);
