import {
  Box,
  Button,
  FormControl,
  Grid,
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
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ThailandBahtIcon from "../components/CustomIcons";
import { db, storage } from "../firebase-config";
import CloseIcon from "@mui/icons-material/Close";
import { commonStyles } from "../utilities/commonStyles";
import AddIcon from "@mui/icons-material/Add";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore/lite";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import MultiSelect from "../components/MultiSelect";
import MultiSelectTreatments from "../components/MultiSelectTreatments";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { useAppStore } from "../appStore";
import { styled } from "@mui/material/styles";
import { colors } from "../utilities/colors";
import useMediaQuery from "@mui/material/useMediaQuery";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import AddLinkIcon from "@mui/icons-material/AddLink";
import { useNavigate, useParams } from "react-router-dom";
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

export default function EditForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isMobile = useMediaQuery("(max-width:600px)");
  const [t] = useTranslation();
  const { changeSnackBarVisibility, changeSnackBarText } = useAppStore(
    (state) => state
  );
  const [loading, setLoading] = useState(false);
  const cities = [
    {
      value: "Bangkok",
      label: "Bangkok",
    },
    {
      value: "Pattaya",
      label: "Pattaya",
    },
    {
      value: "Ko Samui",
      label: "Ko Samui",
    },
    {
      value: "Chiang Mai",
      label: "Chiang Mai",
    },
    {
      value: "Phuket",
      label: "Phuket",
    },
  ];
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
    rating: 3.9,
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
    navigate("/clinics");
  };

  const closedButtonClick = async (day) => {
    setFormData((prevData) => ({
      ...prevData,
      openingHours: {
        ...prevData.openingHours,
        [day]: {
          ...prevData.openingHours[day],
          closed: !formData.openingHours[day].closed,
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
          closed: !formData.openingHours[day].closed,
          opening: null,
          closing: null,
        },
      },
    }));
  };

  const linkButtonClick = async (val) => {
    let openingTime = formData.openingHours[val].opening;
    let closingTime = formData.openingHours[val].closing;

    Object.keys(formData.openingHours).map((day) => {
      setFormData((prevData) => ({
        ...prevData,
        openingHours: {
          ...prevData.openingHours,
          [day]: {
            closed: false,
            opening: openingTime,
            closing: closingTime,
          },
        },
      }));

      setAPIOpeningHours((prevData) => ({
        ...prevData,
        openingHours: {
          ...prevData.openingHours,
          [day]: {
            closed: false,
            opening: dayjs(openingTime).format("hh:mm:ss A"),
            closing: dayjs(closingTime).format("hh:mm:ss A"),
          },
        },
      }));
    });

    changeSnackBarText(t("businessHourCopied"));
    changeSnackBarVisibility(true);
    setOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "city") {
      setSelectedCity(value);
    }

    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFeaturedImageUpload = (e) => {
    const file = e.target.files[0];
    setFormData((prevData) => ({
      ...prevData,
      featuredImage: URL?.createObjectURL(file),
      featuredImageLocalUrl: file,
    }));
  };

  const handleImageUpload = (e) => {
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
  };

  const handleAddImage = () => {
    setShowAddButton(true);
  };

  function handleDeleteProfileImage() {
    setFormData((prevData) => ({
      ...prevData,
      featuredImage: "",
      featuredImageLocalUrl: "",
    }));
  }

  const handleDeleteImage = (index) => {
    const newImages = [...formData.additionalImages];
    newImages.splice(index, 1);
    setFormData((prevData) => ({ ...prevData, additionalImages: newImages }));

    const newFiles = [...additionalImagesFiles];
    newFiles.splice(index, 1);
    setAdditionalImagesFiles(newFiles);
  };

  const handleServiceChange = (e) => {
    setNewService(e.target.value);
  };

  const handleAddService = () => {
    if (newService.trim() !== "") {
      setServices((prevServices) => [...prevServices, newService]);
      setNewService("");
    }
  };

  const handleDeleteService = (index) => {
    const newServices = [...services];
    newServices.splice(index, 1);
    setServices(newServices);
  };

  const handleTimeChange = (day, timeType, time) => {
    let formattedTime = dayjs(time).format("hh:mm:ss A");

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
  };

  const getServices = async () => {
    try {
      const clinicsServicesRef = collection(db, "clinics_services_listing");
      const data = await getDocs(clinicsServicesRef);
      setServices(data?.docs?.map((doc) => doc?.data()?.services));
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const getTreatments = async () => {
    try {
      const clinicsTreatmentsRef = collection(db, "clinics_treatments_listing");
      const data = await getDocs(clinicsTreatmentsRef);
      setTreatments(data?.docs?.map((doc) => doc?.data()?.treatments));
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const fetchEditRecord = async (id) => {
    try {
      const documentRef = doc(db, "clinics", id);
      const documentSnapshot = await getDoc(documentRef);

      if (documentSnapshot.exists()) {
        const data = documentSnapshot.data();

        // Define the order of days
        const daysOrder = [
          "Sunday",
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
        ];

        // Process openingHours
        const processedOpeningHours = {};
        if (data.openingHours && data.openingHours.openingHours) {
          daysOrder.forEach((day) => {
            const hours = data.openingHours.openingHours[day] || {};
            processedOpeningHours[day] = {
              opening: hours.opening
                ? dayjs(hours.opening, "hh:mm:ss A")
                : null,
              closing: hours.closing
                ? dayjs(hours.closing, "hh:mm:ss A")
                : null,
              closed: hours.closed || false,
            };
          });
        }

        setFormData({
          ...data,
          openingHours: processedOpeningHours,
        });
        setSelectedServices(data?.services?.map((service) => service.name));
        setSelectedTreatments(data?.treatments);
        setSelectedCity(data?.city);

        // Set API opening hours
        setAPIOpeningHours({
          openingHours: data.openingHours?.openingHours || {},
        });
      }
    } catch (error) {
      console.error("Error fetchEditRecord:", error);
    }
  };

  const updateClinic = async () => {
    setLoading(true);
    const { featuredImageLocalUrl } = formData;
    const clinicRef = doc(db, "clinics", id);
    try {
      let featuredImageUrl = formData.featuredImage;

      // Upload new featured image if changed
      if (featuredImageLocalUrl instanceof File) {
        const featuredImageFileName = `${Date.now()}_${uuidv4()}_${
          featuredImageLocalUrl.name
        }`;
        const featuredImageRef = ref(
          storage,
          `clinic_images/${featuredImageFileName}`
        );
        await uploadBytesResumable(featuredImageRef, featuredImageLocalUrl);
        featuredImageUrl = await getDownloadURL(featuredImageRef);
      }

      // Combine existing and new additional images
      const existingAdditionalImages = formData.additionalImages.filter(
        (url) => typeof url === "string"
      );
      const newAdditionalImageUrls = await Promise.all(
        additionalImagesFiles.map(async (file) => {
          const uniqueFileName = `${Date.now()}_${uuidv4()}_${file.name}`;
          const imageRef = ref(storage, `clinic_images/${uniqueFileName}`);
          await uploadBytesResumable(imageRef, file);
          return getDownloadURL(imageRef);
        })
      );

      const allAdditionalImages = [
        ...existingAdditionalImages,
        ...newAdditionalImageUrls,
      ];

      const newData = {
        treatments: selectedTreatments,
        openingHours: apiOpeningHours,
        name: formData?.name,
        initialConsultFee: Number(formData?.initialConsultFee),
        address: formData?.address,
        city: formData?.city,
        important_information: formData?.important_information,
        featuredImage: featuredImageUrl,
        additionalImages: allAdditionalImages,
        services: selectedServices.map((service, index) => ({
          name: service,
          price: 10 * index,
        })),
      };

      await updateDoc(clinicRef, newData, { merge: false });
      changeSnackBarText(t("clinicUpdatedSuccessfully"));
      changeSnackBarVisibility(true);
      setLoading(false);
      handleClose();
    } catch (error) {
      setLoading(false);
      console.error("Error update:", error);
    }
  };

  useEffect(() => {
    getServices();
    getTreatments();
  }, []);

  useEffect(() => {
    if (id) {
      fetchEditRecord(id);
    }
  }, [id]);

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
                  // fontSize: "32px",
                  color: colors?.lighterBlack,
                  fontWeight: "600",
                }}
              >
                {t("editClinic")}
              </Typography>
            </Box>

            <Box
              sx={{
                flexGrow: 1,
                // maxWidth: "1000px",
                width: "97%",
                padding: "30px",
                borderRadius: 5,
                boxShadow: 0,
                backgroundColor: colors?.lighterWhite,
              }}
            >
              <Grid container spacing={2}>
                <Grid item xs={isMobile ? 12 : 6}>
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

                <Grid item xs={isMobile ? 12 : 6}>
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

              <>
                <Grid container spacing={2} sx={{ marginTop: 1 }}>
                  <Grid item xs={isMobile ? 12 : 7}>
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
                  <Grid item xs={isMobile ? 12 : 5}>
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
                  <Grid item xs={isMobile ? 12 : 4}>
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
                    xs={isMobile ? 12 : 8}
                  >
                    <Grid item xs={isMobile ? 12 : 6}>
                      <MultiSelect
                        data={services}
                        value={selectedServices}
                        setValue={(val) => setSelectedServices(val)}
                      />
                    </Grid>

                    <Grid item xs={isMobile ? 12 : 6}>
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
                  <Grid item xs={7.5}>
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

                    <Grid item xs={12}>
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <Grid container spacing={0.1}>
                          {Object.keys(formData.openingHours).map((day) => (
                            <Grid
                              key={day}
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
                                  disabled={formData.openingHours[day]?.closed}
                                  onClick={() => linkButtonClick(day)}
                                >
                                  <AddLinkIcon
                                    sx={{
                                      fontSize: 30,
                                      color: colors?.lighterBlack,
                                    }}
                                  />
                                </IconButton>

                                <FormControl
                                  disabled={formData.openingHours[day]?.closed}
                                  sx={{
                                    width: "25%",
                                  }}
                                >
                                  <TimePicker
                                    sx={{
                                      svg: {
                                        color: colors?.golden,
                                      },
                                    }}
                                    disabled={
                                      formData.openingHours[day]?.closed
                                    }
                                    labelId={`${day}-opening-picker-label`}
                                    value={formData.openingHours[day].opening}
                                    onChange={(time) =>
                                      handleTimeChange(day, "opening", time)
                                    }
                                    renderInput={(params) => (
                                      <TextField
                                        color="secondary"
                                        {...params}
                                        size="small"
                                        variant="outlined"
                                        value={
                                          formData.openingHours[day].opening
                                        }
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

                                <FormControl
                                  disabled={formData.openingHours[day]?.closed}
                                  sx={{ width: "25%" }}
                                >
                                  <TimePicker
                                    sx={{
                                      svg: { color: colors?.golden },
                                    }}
                                    disabled={
                                      formData.openingHours[day]?.closed
                                    }
                                    labelId={`${day}-closing-picker-label`}
                                    value={formData.openingHours[day].closing}
                                    onChange={(time) =>
                                      handleTimeChange(day, "closing", time)
                                    }
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

                                <IconButton
                                  onClick={() => closedButtonClick(day)}
                                >
                                  <CancelOutlinedIcon
                                    sx={{
                                      fontSize: 30,
                                      color: colors?.lighterBlack,
                                    }}
                                  />
                                </IconButton>
                              </Grid>
                            </Grid>
                          ))}
                        </Grid>
                      </LocalizationProvider>
                    </Grid>
                  </Grid>

                  <Grid item xs={4.5}>
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
                          sx={{ cursor: "pointer", padding: "0px !important" }}
                          className="hello"
                          onClick={() => handleDeleteProfileImage()}
                        >
                          <img
                            src={formData?.featuredImage}
                            alt="preview of selected"
                            height="150px"
                            width="150px"
                            style={{ borderRadius: "10px", objectFit: "cover" }}
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
                      flexDirection={"row"}
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
                    justifyContent: "end",
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
                    onClick={() => {
                      updateClinic();
                    }}
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
                          sx={{ color: colors?.lighterWhite, fontSize: "12px" }}
                          size={24}
                        />
                      ) : (
                        t("update")
                      )}
                    </Typography>
                  </Button>
                </Box>
              </>
            </Box>
          </Box>
        </Box>
      </Box>
    </div>
  );
}
