import React, { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import CloseIcon from "@mui/icons-material/Close";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { db } from "../firebase-config";
import AddIcon from "@mui/icons-material/Add";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore/lite";
import {
  Button,
  Card,
  CardContent,
  FormControl,
  Modal,
  TextField,
  Typography,
  Box,
  Grid,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { commonStyles } from "../utilities/commonStyles";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { DemoContainer } from "@mui/x-date-pickers/internals/demo";

import styled from "@emotion/styled";
import { LocalizationProvider, TimePicker } from "@mui/x-date-pickers";
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { colors } from "../utilities/colors";
import useMediaQuery from "@mui/material/useMediaQuery";
const propStyle = {
  inputStyle: { fontSize: commonStyles?.fontSize, borderRadius: "16px" },
};

export const StyleWrapper = styled.div`
  .fc .fc-scrollgrid-section table,
  .fc .fc-scrollgrid-section-body table tbody tr,
  .fc .fc-scrollgrid-section-body table,
  .fc .fc-daygrid-body,
  .fc .fc-scrollgrid-section-body table {
    width: 100% !important;
  }
  .fc .fc-toolbar-title,
  .fc .fc-col-header-cell-cushion {
    // font-family: "montserrat";
    // font-family: "poppins";
    font-family: "lato";
  }
  .fc .fc-button-primary {
    // background-color: #DEBA5C;
    background-color: transparent;
    color: #000;
    // border-color: #DEBA5C;
    border-color: transparent;
    // margin-left: 15px;
    // margin-right: 15px;
  }
  .fc-toolbar {
    display: flex;
    // justify-content: center;
    justify-content: space-between;

    align-items: center;
    flex-direction: row;
  }
  .fc-toolbar h2 {
    display: inline;
    justify-content: center;
    align-items: center;
    padding-left: 15px;
    padding-right: 15px;
  }
  .fc-toolbar.fc-header-toolbar .fc-toolbar-chunk:first-child {
    display: flex;
    justify-content: flex-start;
    align-items: center;
  }

  .fc-toolbar.fc-header-toolbar .fc-toolbar-chunk:nth-child(2) {
    width: 25%;
    // align-items: flex-start;
    align-items: center;
    justify-content: flex-start;
    display: flex;
    height: 100%;
  }

  .fc .fc-button.fc-button-active {
    background-color: #deba5c;
    color: #fff;
    border: none;
  }
`;

const defaultValues = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  emailAddress: "",
  bookingId: "",
  bookingDate: dayjs(new Date()).format("YYYY-MM-DD"),
  clinicId: "",
  bookingTime: dayjs(new Date()).format("YYYY-MM-DD"),
};

const CalendarComponent = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [t] = useTranslation();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventAction, seteventAction] = useState(null);
  const [initialTime, setInitialTime] = useState(null);
  const [formData, setFormData] = useState(defaultValues);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [addBooking, setAddBooking] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [errors, setErrors] = useState({});

  const getClinics = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const clinicsCollection = collection(db, "clinics");
      const q = query(clinicsCollection, where("clinicAdmin", "==", uid));
      const clinicData = await getDocs(q);
      setClinics(clinicData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error fetching hotels:", error);
    }
  };

  const getSelectedBookingDetails = async () => {
    try {
      const uid = localStorage.getItem("uid");
      const clinicCollection = collection(db, "clinics");
      const q = query(clinicCollection, where("clinicAdmin", "==", uid));
      const clinicData = await getDocs(q);
      const hotelsIds = clinicData?.docs?.map((doc) => doc?.data()?.id);

      // Fetching Bookings data mapped to hotel id of the logged in user
      const clinicBookingsCollection = collection(db, "clinics_bookings");
      const docsQuery = query(
        clinicBookingsCollection,
        where("clinicId", "in", hotelsIds)
      );
      const data = await getDocs(docsQuery);
      setEvents(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error getHotel:", error);
    }
  };

  const fetchEvents = async () => {
    try {
      // Fetching Clinics list of the logged in user
      const uid = localStorage.getItem("uid");
      const clinicCollection = collection(db, "clinics");
      const q = query(clinicCollection, where("clinicAdmin", "==", uid));
      const clinicData = await getDocs(q);
      const hotelsIds = clinicData?.docs?.map((doc) => doc?.data()?.id);

      // Fetching Bookings data mapped to hotel id of the logged in user
      const clinicBookingsCollection = collection(db, "clinics_bookings");
      const docsQuery = query(
        clinicBookingsCollection,
        where("clinicId", "in", hotelsIds)
      );
      const data = await getDocs(docsQuery);
      setEvents(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error getHotel:", error);
    }
  };

  const UpdateEventModal = ({ isOpen, onClose, onConfirm, onDelete }) => {
    const onSubmitButtonClick = async () => {
      const bookingsCollection = collection(db, "clinics_bookings");
      try {
        const uid = localStorage.getItem("uid");

        const docRef = await addDoc(bookingsCollection, formData);
        await updateDoc(docRef, {
          bookingId: docRef.id,
          clinicAdmin: uid,
        });
        setUpdateModalOpen(false);
        setAddBooking(false);
        fetchEvents();
      } catch (error) {
        console.error("Error create:", error);
      }
    };

    const updateEvent = async () => {
      const bookingsCollection = doc(db, "clinics_bookings", selectedEvent);
      await updateDoc(bookingsCollection, {
        firstName: formData?.firstName,
        lastName: formData?.lastName,
        phoneNumber: formData?.phoneNumber,
        emailAddress: formData?.emailAddress,
        bookingId: formData?.bookingId,
        bookingDate: formData?.bookingDate,
        clinicId: formData?.clinicId,
        bookingTime: formData?.bookingTime,
      });
      setUpdateModalOpen(false);
      fetchEvents();
    };

    const handleConfirm = (e) => {
      if (e === "create") {
        onSubmitButtonClick();
      } else if (e === "update") {
        updateEvent();
      }
    };

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleTimeChange = (time) => {
      setFormData({ ...formData, bookingTime: time.$d });
    };

    const handleDelete = (bookingId) => {
      onDelete();
      onClose();
    };

    function onCancelAddBooking() {
      onClose();
      setFormData(defaultValues);
    }

    return (
      isOpen && (
        <Modal
          open={isOpen}
          onClose={onClose}
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          style={{
            backdropFilter: "blur(2px)",
            overflow: "scroll",
            display: "block",
            height: "100%",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#ffffff",
              width: "70%",
              padding: "20px",
              borderRadius: "24px",
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.1)",
            }}
          >
            <span
              onClick={onClose}
              style={{
                cursor: "pointer",
                position: "absolute",
                top: "24px",
                right: "24px",
                padding: "10px",
              }}
            >
              <CloseIcon style={{ fontSize: "32px", color: "black" }} />
            </span>

            <Typography
              variant="h5"
              id="modal-title"
              fontSize={commonStyles?.dashboardFontSize}
              sx={{
                fontWeight: "600",
                marginBottom: "32px",
                // fontSize: "24px",
                alignSelf: "center",
                textAlign: "center",
                marginTop: "40px",
              }}
            >
              {addBooking === true
                ? t("createNewBooking")
                : t("bookingDetails")}
            </Typography>

            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <TextField
                color="secondary"
                type="text"
                label={t("customerFirstName")}
                variant="outlined"
                placeholder={t("customerFirstName")}
                name="firstName"
                value={formData?.firstName}
                style={{
                  marginBottom: "16px",
                  width: isMobile ? "100%" : "49%",
                }}
                onChange={handleChange}
                InputProps={{
                  style: propStyle?.inputStyle,
                }}
                error={Boolean(errors.firstName)}
                helperText={t(errors.firstName)}
              />

              <TextField
                color="secondary"
                type="text"
                label={t("customerLastName")}
                variant="outlined"
                placeholder={t("customerLastName")}
                name="lastName"
                value={formData?.lastName}
                style={{
                  marginBottom: "16px",
                  width: isMobile ? "100%" : "49%",
                }}
                onChange={handleChange}
                InputProps={{
                  style: propStyle?.inputStyle,
                }}
                error={Boolean(errors.lastName)}
                helperText={t(errors.lastNameReq)}
              />
            </Box>

            <Box
              sx={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                flexDirection: isMobile ? "column" : "row",
              }}
            >
              <TextField
                color="secondary"
                type="text"
                label={t("customerPhoneNumber")}
                variant="outlined"
                placeholder={t("customerPhoneNumber")}
                name="phoneNumber"
                value={formData?.phoneNumber}
                style={{
                  marginBottom: "16px",
                  width: isMobile ? "100%" : "49%",
                }}
                onChange={handleChange}
                InputProps={{
                  style: propStyle?.inputStyle,
                }}
                error={Boolean(errors.phoneNumber)}
                helperText={t(errors.phoneNumberReq)}
              />

              <TextField
                color="secondary"
                type="text"
                label={t("customerEmail")}
                variant="outlined"
                placeholder={t("customerEmail")}
                name="emailAddress"
                value={formData?.emailAddress}
                fullWidth
                style={{
                  marginBottom: "16px",
                  width: isMobile ? "100%" : "49%",
                }}
                onChange={handleChange}
                InputProps={{
                  style: propStyle?.inputStyle,
                }}
                error={Boolean(errors.emailAddress)}
                helperText={t(errors.emailReq)}
              />
            </Box>

            <Grid
              container
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                display: "flex",
                width: "100%",
              }}
            >
              <Grid item xs={5.9}>
                <Box
                  sx={{
                    width: "100%",
                  }}
                >
                  {addBooking === true ? (
                    <Box
                      sx={{
                        width: isMobile ? "100%" : "100%",
                        borderRadius: "16px",
                        marginTop: "7px",
                      }}
                    >
                      <FormControl fullWidth>
                        <InputLabel
                          id="demo-simple-select-label"
                          InputProps={{ sx: { borderRadius: 16 } }}
                        >
                          {t("selectClinic")}
                        </InputLabel>

                        <Select
                          color="secondary"
                          name="clinicId"
                          value={formData.clinicId}
                          label={t("selectClinic")}
                          onChange={handleChange}
                          sx={{ borderRadius: "16px" }}
                          error={Boolean(errors.clinicId)}
                          helperText={t(errors.selectClinicReq)}
                        >
                          {clinics.map((item) => (
                            <MenuItem key={item.id} value={item.id}>
                              {item.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>
                  ) : null}

                  {addBooking === false ? (
                    <TextField
                      color="secondary"
                      disabled={true}
                      type="text"
                      label={"Booking Id"}
                      variant="outlined"
                      placeholder={"Booking Id"}
                      name="bookingId"
                      value={formData?.bookingId}
                      fullWidth
                      style={{
                        marginBottom: "16px",
                        marginTop: "7px",
                      }}
                      onChange={handleChange}
                      InputProps={{
                        style: propStyle?.inputStyle,
                      }}
                    />
                  ) : null}
                </Box>
              </Grid>

              <Grid item xs={5.9}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    flexDirection: isMobile ? "column" : "row",
                  }}
                >
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer
                      components={["DatePicker"]}
                      sx={{ width: "100%" }}
                    >
                      <DatePicker
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            InputProps: {
                              sx: {
                                borderRadius: "16px",
                              },
                            },
                          },
                        }}
                        label={t("checkInDate")}
                        value={dayjs(formData?.bookingDate)}
                        onChange={(newValue) =>
                          setFormData({
                            ...formData,
                            bookingDate: dayjs(newValue).format("YYYY-MM-DD"),
                          })
                        }
                        sx={{ width: "100%" }}
                        error={Boolean(errors.bookingDate)}
                        helperText={t(errors.checkInDateReq)}
                      />

                      <TimePicker
                        sx={{
                          svg: {
                            color: colors?.golden,
                          },
                        }}
                        labelId={`bookingTime-label`}
                        // value={dayjs(formData.bookingTime?.seconds)}
                        value={
                          addBooking === false
                            ? dayjs(formData.bookingTime?.seconds)
                            : dayjs(formData.bookingTime)
                        }
                        onChange={(time) => handleTimeChange(time)}
                        renderInput={(params) => (
                          <TextField
                            color="secondary"
                            {...params}
                            size="small"
                            variant="outlined"
                            value={formData.bookingTime}
                          />
                        )}
                        error={Boolean(errors.bookingTime)}
                        helperText={t(errors.checkInTimeReq)}
                      />
                    </DemoContainer>
                  </LocalizationProvider>
                </Box>
              </Grid>
            </Grid>

            <Grid
              container
              spacing={0}
              direction="row"
              gap={3}
              alignItems="center"
              justifyContent="center"
              sx={{ marginTop: "40px" }}
            >
              <Button
                onClick={() =>
                  addBooking === true
                    ? onCancelAddBooking()
                    : handleDelete(formData?.bookingId)
                }
                variant="outlined"
                sx={{
                  width: "200px",
                  borderRadius: "16px",
                  height: "56px",
                  textTransform: "capitalize",
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
                  {addBooking === true ? t("cancel") : t("delete")}
                </Typography>
              </Button>

              <Button
                onClick={() =>
                  handleConfirm(addBooking === true ? "create" : "update")
                }
                variant="contained"
                sx={{
                  width: "200px",
                  borderRadius: "16px",
                  height: "56px",
                  textTransform: "capitalize",
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
                  {addBooking === true ? t("create") : t("update")}
                </Typography>
              </Button>
            </Grid>
          </div>
        </Modal>
      )
    );
  };

  const handleEventUpdate = async (info) => {
    if (info !== null) {
      try {
        await updateDoc(doc(db, "events", selectedEvent.id), {
          formData: info,
        });
        // Update the event in the local state
        const updatedEvents = events.map((event) =>
          event.id === selectedEvent.id ? { ...event, formData: info } : event
        );
        setEvents(updatedEvents);
      } catch (error) {
        console.error("Error updating event:", error);
      }
    }
    setUpdateModalOpen(false);
  };

  const onAddNewBookingButtonClick = () => {
    setFormData(defaultValues);
    setAddBooking(true);
    setUpdateModalOpen(true);
  };

  const handleEventClick = (info, eventAction) => {
    let extract = /\((.*)\)/i;
    const bookingId = info.title.match(extract)[1];

    const filteredData = events.filter((item) =>
      item?.bookingId?.includes(bookingId)
    );

    setFormData(filteredData[0]);

    setAddBooking(false);
    setUpdateModalOpen(true);
    // getSelectedBookingDetails();
    setSelectedEvent(bookingId);
  };

  const handleAddEvent = async (info) => {
    if (info !== null) {
      try {
        const newEvent = { formData: info, date: selectedEvent.dateStr };
        const docRef = await addDoc(collection(db, "events"), newEvent);
        setEvents([...events, { id: docRef.id, ...newEvent }]);
      } catch (error) {
        console.error("Error adding event:", error);
      }
    }
  };

  // Event handler for deleting an event
  const handleDeleteEvent = async (info, event) => {
    try {
      await deleteDoc(doc(db, "clinics_bookings", selectedEvent));
      const updatedEvents = events.filter(
        (event) => event.bookingId !== selectedEvent
      );
      setEvents(updatedEvents);
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
    getClinics();
  }, []);

  return (
    <>
      <Box
        sx={{
          flexDirection: "row",
          justifyContent: "space-between",
          width: "100%",
          display: "flex",
        }}
      >
        <Typography
          fontSize={commonStyles?.dashboardFontSize}
          sx={{
            fontWeight: "600",
            color: colors?.lighterBlack,
            marginBottom: "31px",
          }}
        >
          {t("bookings")}
        </Typography>

        <Button
          onClick={onAddNewBookingButtonClick}
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
            <AddIcon sx={{ color: colors?.lighterWhite, fontSize: 24 }} />
          }
        >
          <Typography
            sx={{
              fontWeight: "500",
              fontSize: "20px",
              color: colors?.lighterWhite,
            }}
          >
            {t("newBooking")}
          </Typography>
        </Button>
      </Box>

      <Card style={{ borderRadius: 15 }}>
        <CardContent>
          <StyleWrapper>
            <FullCalendar
              height={"65vh"}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events.map((booking) => ({
                title: `${booking?.firstName} (${booking?.bookingId})`,
                start: dayjs(booking.bookingDate).format("YYYY-MM-DD"),
              }))}
              eventClick={(info) => handleEventClick(info.event)}
              headerToolbar={{
                start: "dayGridDay dayGridWeek dayGridMonth",
                center: "prev,title,next",
                end: "",
              }}
              buttonText={{
                dayGridDay: "Today",
                dayGridWeek: "Week",
                dayGridMonth: "Month",
              }}
            />

            {UpdateEventModal({
              isOpen: updateModalOpen,
              onClose: () => setUpdateModalOpen(false),
              onConfirm:
                eventAction === "edit" ? handleEventUpdate : handleAddEvent,
              onDelete: handleDeleteEvent,
            })}
          </StyleWrapper>
        </CardContent>
      </Card>
    </>
  );
};

export default CalendarComponent;
