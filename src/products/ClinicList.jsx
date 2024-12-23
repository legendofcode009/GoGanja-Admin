import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import {
  Autocomplete,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
  Card,
  CardContent,
  IconButton,
  Grid,
  CardMedia,
  InputBase,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import AddIcon from "@mui/icons-material/Add";
import { useState, useEffect } from "react";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
} from "firebase/firestore/lite";
import { db } from "../firebase-config";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from "sweetalert2";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import Modal from "@mui/material/Modal";
import AddForm from "./AddForm";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { colors } from "../utilities/colors";
import { commonStyles } from "../utilities/commonStyles";
import { styled, alpha } from "@mui/material/styles";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: 0,
  width: "100%",
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    [theme.breakpoints.up("sm")]: {
      width: "12ch",
      "&:focus": {
        width: "20ch",
      },
    },
  },
}));

export default function ClinicsList() {
  const [t] = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [clinicsList, setClinicsList] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();

  const getClinics = async () => {
    const empCollectionRef = collection(db, "clinics");
    const uid = localStorage.getItem("uid");
    const q = query(empCollectionRef, where("clinicAdmin", "==", uid));
    const data = await getDocs(q);
    // setRows(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    setRows(data.docs.map((doc) => ({ ...doc.data() })));
    setClinicsList(data.docs.map((doc) => ({ ...doc.data() })));
    setIsLoading(false);
  };

  const deleteUser = (id) => {
    Swal.fire({
      title: t("areYouSure"),
      text: t("youWontBeAbleToRevert"),
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: t("cancel"),
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: t("yesDeleteIt"),
    }).then((result) => {
      if (result.value) {
        deleteApi(id);
      }
    });
  };

  const deleteApi = async (id) => {
    const clinicsCollection = collection(db, "clinics");
    const userDoc = doc(clinicsCollection, id);

    try {
      await deleteDoc(userDoc);
      Swal.fire(t("deleted"), t("yourFileHasBeenDeleted"), "success");
      setRows([]);
      getClinics();
    } catch (error) {
      Swal.fire(t("error"), t("registrationUnSuccessful"), "error");
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getClinics();
  }, []);
  return (
    <Box
      sx={{
        alignSelf: "center",
        display: "flex",
        alignContent: "center",
        justifyContent: "center",
        // display: "table",
      }}
    >
      <Box
        sx={{
          // width: "97%",
          width: "100%",
          height: "100vh",
          backgroundColor: colors?.backgroundWhite,
          flexDirection: "column",
          display: "flex",
        }}
      >
        <Box
          sx={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: "100%",
            display: "flex",
            alignSelf: "center",
          }}
        >
          <Typography
            fontSize={commonStyles?.dashboardFontSize}
            sx={{
              fontWeight: "600",
              color: colors?.lighterBlack,
              marginBottom: "16px",
            }}
          >
            {t("clinics")}
          </Typography>

          <Button
            onClick={() => navigate("/add-clinic")}
            sx={{
              // height: "56px",
              height: {
                xs: "2em", // 0px
                sm: "2.25em", // 600px
                md: "2.5em", // 900px
                lg: "3.5em", // 1200px
                xl: "4em", // 1536p
              },
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
              fontSize={commonStyles?.fontSize}
              sx={{
                fontWeight: "500",
                // fontSize: "20px",
                color: colors?.lighterWhite,
              }}
            >
              {t("newClinic")}
            </Typography>
          </Button>
        </Box>

        <Box sx={{ width: "40%" }}>
          <Search
            sx={{
              borderRadius: "16px",
              boxShadow: "0px 3px 7px #A3A3A350",
              height: "48px",
              backgroundColor: colors?.lighterWhite,
            }}
          >
            <SearchIconWrapper color={colors?.grey}>
              <SearchIcon sx={{ color: colors?.grey }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder={t("searchClinic")}
              inputProps={{ "aria-label": "search" }}
              sx={{
                height: "48px",
              }}
            />
          </Search>
        </Box>

        {isLoading ? (
          <Box
            sx={{
              alignSelf: "center",
              justifyContent: "center",
              display: "flex",
              flex: 1,
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : rows.length === 0 ? (
          <Typography
            fontSize={commonStyles?.fontSize}
            sx={{
              alignItems: "center",
              justifyContent: "center",
              display: "flex",
              height: "50%",
              // fontSize: "32px",
              fontWeight: "500",
            }}
          >
            {t("clinicsNotFound")}
          </Typography>
        ) : (
          <Grid container spacing={2} sx={{ marginTop: "24px" }}>
            {rows?.map((val) => (
              <Grid item xs={4}>
                <Card
                  sx={{
                    maxWidth: "410px",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "24px",
                    boxShadow: "0px 3px 10px 0px #9999991A",
                  }}
                >
                  <IconButton
                    onClick={() => deleteUser(val.id)}
                    aria-label="update"
                    sx={{
                      width: "32px",
                      height: "32px",
                      position: "absolute",
                      marginTop: "40px",
                      marginLeft: "40px",
                    }}
                  >
                    <DeleteOutlineOutlinedIcon
                      sx={{
                        color: colors?.lighterBlack,
                        fontSize: "24px",
                        backgroundColor: colors?.lighterWhite,
                        padding: "8px",
                        borderRadius: "20px",
                      }}
                    />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      navigate(`/edit-clinic/${val.id}`);
                    }}
                    aria-label="delete"
                    sx={{
                      width: "32px",
                      height: "32px",
                      position: "absolute",
                      marginTop: "40px",
                      marginRight: "40px",
                      alignSelf: "flex-end",
                      display: "flex",
                    }}
                  >
                    <EditOutlinedIcon
                      sx={{
                        color: colors?.lighterBlack,
                        fontSize: "24px",
                        backgroundColor: colors?.lighterWhite,
                        padding: "8px",
                        borderRadius: "20px",
                      }}
                    />
                  </IconButton>
                  <CardMedia
                    sx={{
                      height: "203px",
                      width: "362px",
                      marginTop: "24px",
                      borderRadius: "24px",
                      alignSelf: "center",
                    }}
                    image={val?.featuredImage}
                  />

                  <CardContent sx={{ paddingLeft: "30px" }}>
                    <Typography
                      sx={{
                        textAlign: "left",
                        fontWeight: "600",
                        color: colors?.lighterBlack,
                        // fontSize: "20px"
                        fontSize: commonStyles?.dashboardFontSize,
                      }}
                    >
                      {val?.name}
                    </Typography>
                    <Typography
                      sx={{
                        textAlign: "left",
                        fontWeight: "400",
                        color: colors?.lighterBlack,
                        // fontSize: "16px"
                        fontSize: commonStyles?.fontSize,
                      }}
                    >
                      {val?.address}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Box>
  );

  // return (
  //   <Box
  //     sx={{
  //       alignSelf: "center",
  //       justifyContent: "center",
  //       alignItems: "center",
  //       alignContent: "center",
  //       display: "flex",
  //     }}
  //   >
  //     <div>
  //       <Modal
  //         open={open}
  //         aria-labelledby="modal-modal-title"
  //         aria-describedby="modal-modal-description"
  //       >
  //         <Box sx={style}>
  //           <AddForm closeEvent={handleClose} />
  //         </Box>
  //       </Modal>
  //     </div>

  //     <Paper
  //       sx={{
  //         // overflow: "hidden",
  //         borderRadius: 5,
  //         boxShadow: 0,
  //         width: "95%",
  //       }}
  //     >
  //       <Typography variant="h5" component="div" sx={{ padding: "16px" }}>
  //         {t("yourClinics")}
  //       </Typography>

  //       <Divider />

  //       <Box height={16} />

  //       <Stack
  //         direction="row"
  //         spacing={2}
  //         className="my-2 mb-2"
  //         sx={{ padding: "0 16px " }}
  //         justifyContent="space-between"
  //       >
  //         <Autocomplete
  //           disablePortal
  //           id="combo-box-demo"
  //           options={rows}
  //           sx={{ width: 300 }}
  //           onChange={(e, v) => filterData(v)}
  //           getOptionLabel={(rows) => rows.name || ""}
  //           renderOption={(props, option) => (
  //             <li {...props} key={option.id}>
  //               {option.name}
  //             </li>
  //           )}
  //           renderInput={(params) => (
  //             <TextField
  //               color="secondary"
  //               {...params}
  //               size="small"
  //               label={t("search")}
  //             />
  //           )}
  //         />

  //         <Button
  //           variant="contained"
  //           endIcon={<AddCircleIcon />}
  //           onClick={() => navigate("/add-clinic")}
  //           color="secondary"
  //         >
  //           {t("addClinic")}
  //         </Button>
  //       </Stack>

  //       <Box height={10} />

  //       <TableContainer
  //         sx={{
  //           // maxHeight: 440
  //           maxHeight: "65vh",
  //         }}
  //       >
  //         <Table stickyHeader aria-label="sticky table">
  //           <TableHead>
  //             <TableRow>
  //               <TableCell align="left" style={{ minWidth: "100px" }}>
  //                 {t("name")}
  //               </TableCell>

  //               <TableCell align="left" style={{ minWidth: "100px" }}>
  //                 {t("featuredImage")}
  //               </TableCell>

  //               <TableCell align="left" style={{ minWidth: "100px" }}>
  //                 {t("address")}
  //               </TableCell>

  //               <TableCell align="left" style={{ minWidth: "100px" }}>
  //                 {t("city")}
  //               </TableCell>

  //               <TableCell align="left"></TableCell>
  //             </TableRow>
  //           </TableHead>

  //           <TableBody>
  //             {rows?.length > 0 ? (
  //               rows
  //                 // ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
  //                 ?.map((row, index) => {
  //                   return (
  //                     <TableRow key={index} hover role="checkbox" tabIndex={-1}>
  //                       <TableCell align="left">{row.name}</TableCell>

  //                       <TableCell key={row?.id} align="left">
  //                         <img
  //                           alt="Feature"
  //                           src={row.featuredImageUrl}
  //                           style={{ width: "300px", height: "auto" }}
  //                         />
  //                       </TableCell>

  //                       <TableCell align="left">{row.address}</TableCell>

  //                       <TableCell align="left">{row.city}</TableCell>

  //                       <TableCell align="left">
  //                         <Stack spacing={2} direction="row">
  //                           <EditIcon
  //                             style={{
  //                               fontSize: "20px",

  //                               cursor: "pointer",
  //                             }}
  //                             className="cursor-pointer"
  //                             color="secondary"
  //                           />
  //                           <DeleteIcon
  //                             style={{
  //                               fontSize: "20px",
  //                               color: "darkred",
  //                               cursor: "pointer",
  //                             }}
  //                             onClick={() => {
  //                               deleteUser(row.id);
  //                             }}
  //                           />
  //                         </Stack>
  //                       </TableCell>
  //                     </TableRow>
  //                   );
  //                 })
  //             ) : (
  //               <TableRow>
  //                 <TableCell
  //                   component="th"
  //                   scope="row"
  //                   align="center"
  //                   colSpan={8}
  //                 >
  //                   {t("clinicsNotFound")}
  //                 </TableCell>
  //               </TableRow>
  //             )}
  //           </TableBody>
  //         </Table>
  //       </TableContainer>

  //       <TablePagination
  //         rowsPerPageOptions={[10, 25, 100]}
  //         component="div"
  //         count={rows.length}
  //         rowsPerPage={rowsPerPage}
  //         page={page}
  //         onPageChange={handleChangePage}
  //         onRowsPerPageChange={handleChangeRowsPerPage}
  //       />
  //     </Paper>

  //     {isLoading === true ? (
  //       <Box
  //         sx={{
  //           width: "100%",
  //           overflow: "hidden",
  //           display: "flex",
  //           justifyContent: "center",
  //           flex: 1,
  //           alignItems: "center",
  //           height: "500px",
  //         }}
  //       >
  //         <CircularProgress color="secondary" />
  //       </Box>
  //     ) : null}
  //   </Box>
  // );
}
