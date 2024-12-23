import React, { useEffect, useState, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import CloseIcon from "@mui/icons-material/Close";
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
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from "dayjs";
import { useTranslation } from "react-i18next";
import { colors } from "../utilities/colors";
import useMediaQuery from "@mui/material/useMediaQuery";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

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
    font-family: "lato";
  }
  .fc .fc-button-primary {
    background-color: transparent;
    color: #000;
    border-color: transparent;
  }
  .fc-toolbar {
    display: flex;
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
  clientName: "",
  doctorName: "",
  clientPhone: "",
  clientEmail: "",
  pinCode: "",
  bookedAt: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  clinicId: "",
  createdAt: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
  confirmationCode: "",
  status: "Pending",
  totalPrice: 140,
  userId: "o5aGHIukOLZntqoCoc26kfkJjue2",
  selectedServices: [
    { name: "Caregiver Support", price: 100 },
    { name: "Legal Assistance", price: 40 },
  ],
};

const CalendarComponent = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const [t] = useTranslation();
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [formData, setFormData] = useState(defaultValues);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [addBooking, setAddBooking] = useState(false);
  const [clinics, setClinics] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const uid = localStorage.getItem("uid");

      // Fetch clinics
      const clinicsCollection = collection(db, "clinics");
      const clinicsQuery = query(clinicsCollection, where("clinicAdmin", "==", uid));
      const clinicData = await getDocs(clinicsQuery);
      const clinicList = clinicData.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
      setClinics(clinicList);

      // Fetch events
      const clinicIds = clinicList.map((clinic) => clinic.id);
      const clinicBookingsCollection = collection(db, "clinics_bookings");
      const eventsQuery = query(clinicBookingsCollection, where("clinicId", "in", clinicIds));
      const eventData = await getDocs(eventsQuery);
      setEvents(eventData.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleEventUpdate = async (info) => {
    if (info && selectedEvent) {
      try {
        console.log("Selected Event:", selectedEvent);
        console.log("Info to Update:", info);

        await updateDoc(doc(db, "clinics_bookings", selectedEvent.id), {
          ...info,
          bookedAt: formData.bookedAt,
        });

        setEvents((prevEvents) =>
          prevEvents.map((event) =>
            event.id === selectedEvent.id ? { ...event, ...info } : event
          )
        );
      } catch (error) {
        console.error("Error updating event:", error);
      }
    } else {
      console.error("Invalid event data or selected event is undefined.");
    }
    setUpdateModalOpen(false);
  };

  const handleAddEvent = async (info) => {
    if (info) {
      try {
        console.log("Attempting to add new event:", info);
        const newEvent = {
          ...info,
          createdAt: dayjs().format("YYYY-MM-DDTHH:mm:ss"),
          bookedAt: formData.bookedAt,
        };
        const docRef = await addDoc(collection(db, "clinics_bookings"), newEvent);
        console.log("Document added with ID:", docRef.id);
        setEvents((prevEvents) => [...prevEvents, { id: docRef.id, ...newEvent }]);
      } catch (error) {
        console.error("Error adding event:", error);
      } finally {
        setUpdateModalOpen(false);
      }
    } else {
      console.error("Invalid event data.");
    }
  };

  const handleDeleteEvent = async () => {
    if (selectedEvent && selectedEvent.id) {
      try {
        console.log("Deleting Event ID:", selectedEvent.id);
        await deleteDoc(doc(db, "clinics_bookings", selectedEvent.id));
        setEvents((prevEvents) =>
          prevEvents.filter((event) => event.id !== selectedEvent.id)
        );
        setSelectedEvent(null);
      } catch (error) {
        console.error("Error deleting event:", error);
      }
    } else {
      console.error("No event selected for deletion.");
    }
  };

  const onAddNewBookingButtonClick = () => {
    const defaultClinicId = clinics.length > 0 ? clinics[0].id : "";
    setFormData({ ...defaultValues, clinicId: defaultClinicId });
    setAddBooking(true);
    setUpdateModalOpen(true);
    setSelectedEvent({ dateStr: dayjs().format("YYYY-MM-DD") });
  };

  const handleEventClick = (info) => {
    const pinCode = info.event.title.match(/\((.*)\)/i)[1];
    const filteredData = events.find((item) => item?.pinCode === pinCode);
    console.log("Filtered Data:", filteredData);
    setFormData(filteredData);
    setAddBooking(false);
    setUpdateModalOpen(true);
    setSelectedEvent(filteredData);
  };

  const handleDateTimeChange = (newDate, newTime) => {
    if (newDate && newTime) {
      const date = dayjs(newDate).format("YYYY-MM-DD");
      const time = dayjs(newTime).format("HH:mm:ss");
      const combinedDateTime = `${date}T${time}`;
      console.log("Combined DateTime (as ISO 8601 string):", combinedDateTime);

      setFormData({
        ...formData,
        bookedAt: combinedDateTime,
      });
    }
  };

  const UpdateEventModal = ({ isOpen, onClose, onConfirm, onDelete }) => {
    const handleConfirm = (action) => {
      if (action === "create") {
        handleAddEvent(formData);
      } else if (action === "update") {
        handleEventUpdate(formData);
      }
    };

    const handleChange = (e) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
      setErrors({ ...errors, [e.target.name]: "" });
    };

    const handleTimeChange = (time) => {
      setFormData({ ...formData, bookedAt: dayjs(time).format("YYYY-MM-DDTHH:mm:ss") });
    };

    const handleDelete = () => {
      onDelete();
      onClose();
    };

    const onCancelAddBooking = () => {
      onClose();
      setFormData(defaultValues);
    };

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
                alignSelf: "center",
                textAlign: "center",
                marginTop: "40px",
              }}
            >
              {addBooking ? t("createNewBooking") : t("bookingDetails")}
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
                label={t("Customer Name")}
                variant="outlined"
                placeholder={t("Customer Name")}
                name="clientName"
                value={formData?.clientName}
                style={{
                  marginBottom: "16px",
                  width: isMobile ? "100%" : "49%",
                }}
                onChange={handleChange}
                InputProps={{
                  style: propStyle?.inputStyle,
                }}
                error={Boolean(errors.clientName)}
                helperText={t(errors.clientName)}
              />

              <TextField
                color="secondary"
                type="text"
                label={t("Doctor Name")}
                variant="outlined"
                placeholder={t("Doctor Name")}
                name="doctorName"
                value={formData?.doctorName}
                style={{
                  marginBottom: "16px",
                  width: isMobile ? "100%" : "49%",
                }}
                onChange={handleChange}
                InputProps={{
                  style: propStyle?.inputStyle,
                }}
                error={Boolean(errors.doctorName)}
                helperText={t(errors.doctorNameReq)}
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
                label={t("Customer Phone Number")}
                variant="outlined"
                placeholder={t("Customer Phone Number")}
                name="clientPhone"
                value={formData?.clientPhone}
                style={{
                  marginBottom: "16px",
                  width: isMobile ? "100%" : "49%",
                }}
                onChange={handleChange}
                InputProps={{
                  style: propStyle?.inputStyle,
                }}
                error={Boolean(errors.clientPhone)}
                helperText={t(errors.clientPhone)}
              />

              <TextField
                color="secondary"
                type="text"
                label={t("Customer Email")}
                variant="outlined"
                placeholder={t("Customer Email")}
                name="clientEmail"
                value={formData?.clientEmail}
                fullWidth
                style={{
                  marginBottom: "16px",
                  width: isMobile ? "100%" : "49%",
                }}
                onChange={handleChange}
                InputProps={{
                  style: propStyle?.inputStyle,
                }}
                error={Boolean(errors.clientEmail)}
                helperText={t(errors.clientEmail)}
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
                <Box sx={{ width: "100%" }}>
                  {addBooking ? (
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
                  ) : (
                    <TextField
                      color="secondary"
                      disabled
                      type="text"
                      label={"Booking Id"}
                      variant="outlined"
                      placeholder={"Booking Id"}
                      name="pinCode"
                      value={formData?.pinCode}
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
                  )}
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
                            error: Boolean(errors.bookingDate),
                            helperText: t(errors.checkInDateReq),
                          },
                        }}
                        label={t("checkInDate")}
                        value={formData?.bookedAt ? dayjs(formData.bookedAt) : null}
                        onChange={(newValue) => handleDateTimeChange(newValue, formData.bookedAt)}
                        sx={{ width: "100%" }}
                      />

                      <TimePicker
                        slotProps={{
                          textField: {
                            variant: "outlined",
                            InputProps: {
                              sx: {
                                borderRadius: "16px",
                              },
                            },
                            error: Boolean(errors.bookedAt),
                            helperText: t(errors.checkInTimeReq),
                          },
                        }}
                        labelId={`bookingTime-label`}
                        value={formData?.bookedAt ? dayjs(formData.bookedAt) : null}
                        onChange={(newValue) => handleDateTimeChange(formData.bookedAt, newValue)}
                        sx={{
                          svg: {
                            color: colors?.golden,
                          },
                        }}
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
                  addBooking ? onCancelAddBooking() : handleDelete()
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
                  {addBooking ? t("cancel") : t("delete")}
                </Typography>
              </Button>

              <Button
                onClick={() =>
                  handleConfirm(addBooking ? "create" : "update")
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
                  {addBooking ? t("create") : t("update")}
                </Typography>
              </Button>
            </Grid>
          </div>
        </Modal>
      )
    );
  };

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
            {console.log("events", events)}
            <FullCalendar
              height={"65vh"}
              plugins={[dayGridPlugin]}
              initialView="dayGridMonth"
              events={events.map((booking) => {
                return {
                  title: `${booking?.clientName} (${booking?.pinCode})`,
                  start: booking.bookedAt,
                };
              })}
              eventClick={(info) => handleEventClick(info)}
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
              onConfirm: handleEventUpdate,
              onDelete: handleDeleteEvent,
            })}
          </StyleWrapper>
        </CardContent>
      </Card>
    </>
  );
};

export default CalendarComponent;
