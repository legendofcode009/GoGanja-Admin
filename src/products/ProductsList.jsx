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
} from "@mui/material";
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

function createData(name, code, population, size) {
  const density = population / size;
  return { name, code, population, size, density };
}

const rows = [];

export default function StickyHeadTable() {
  const [t] = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [rows, setRows] = useState([]);
  const [open, setOpen] = React.useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const navigate = useNavigate();

  const getClinics = async () => {
    const empCollectionRef = collection(db, "clinics");
    const uid = localStorage.getItem("uid");
    const q = query(empCollectionRef, where("clinicAdmin", "==", uid));
    const data = await getDocs(q);
    setRows(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    setIsLoading(false);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const deleteUser = (id) => {
    console.log("id", id);

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
    const userDoc = doc(db, "clinics", id);
    try {
      const data = await deleteDoc(userDoc);
      console.log("data", data);
      if (data) {
        Swal.fire(t("deleted"), t("yourFileHasBeenDeleted"), "success");
        getClinics();
      }
    } catch (error) {
      Swal.fire(t("error"), t("registrationUnSuccessful"), "error");
    }
  };

  const filterData = (v) => {
    if (v) {
      setRows([v]);
    } else {
      setRows();
      getClinics();
    }
  };

  useEffect(() => {
    setIsLoading(true);
    getClinics();
  }, []);

  return (
    <>
      <div>
        <Modal
          open={open}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <AddForm closeEvent={handleClose} />
          </Box>
        </Modal>
      </div>

      <Paper
        sx={{
          width: "100%",
          overflow: "hidden",
          borderRadius: 5,
          boxShadow: 0,
        }}
      >
        <Typography variant="h5" component="div" sx={{ padding: "16px" }}>
          {t("yourClinics")}
        </Typography>

        <Divider />
        <Box height={16} />
        <Stack
          direction="row"
          spacing={2}
          className="my-2 mb-2"
          sx={{ padding: "0 16px " }}
          justifyContent="space-between"
        >
          <Autocomplete
            disablePortal
            id="combo-box-demo"
            options={rows}
            sx={{ width: 300 }}
            onChange={(e, v) => filterData(v)}
            getOptionLabel={(rows) => rows.name || ""}
            renderInput={(params) => (
              <TextField
                color="secondary"
                {...params}
                size="small"
                label={t("search")}
              />
            )}
          />

          <Button
            variant="contained"
            endIcon={<AddCircleIcon />}
            onClick={() => navigate("/add-clinic")}
            color="secondary"
          >
            {t("addClinic")}
          </Button>
        </Stack>
        <Box height={10} />

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                <TableCell align="left" style={{ minWidth: "100px" }}>
                  {t("name")}
                </TableCell>

                <TableCell align="left" style={{ minWidth: "100px" }}>
                  {t("featuredImage")}
                </TableCell>

                <TableCell align="left" style={{ minWidth: "100px" }}>
                  {t("address")}
                </TableCell>

                <TableCell align="left" style={{ minWidth: "100px" }}>
                  {t("city")}
                </TableCell>

                <TableCell align="left"></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {rows.length > 0 ? (
                rows
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => {
                    return (
                      <TableRow hover role="checkbox" tabIndex={-1}>
                        <TableCell key={row.id} align="left">
                          {row.name}
                        </TableCell>
                        <TableCell key={row.id} align="left">
                          <img
                            src={row.featuredImage}
                            style={{ width: "100px", height: "auto" }}
                          />
                        </TableCell>
                        <TableCell key={row.id} align="left">
                          {row.address}
                        </TableCell>
                        <TableCell key={row.id} align="left">
                          {row.city}
                        </TableCell>
                        <TableCell align="left">
                          <Stack spacing={2} direction="row">
                            <EditIcon
                              style={{
                                fontSize: "20px",

                                cursor: "pointer",
                              }}
                              className="cursor-pointer"
                              color="secondary"
                            />
                            <DeleteIcon
                              style={{
                                fontSize: "20px",
                                color: "darkred",
                                cursor: "pointer",
                              }}
                              onClick={() => {
                                deleteUser(row.id);
                              }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
              ) : (
                <TableRow>
                  <TableCell
                    component="th"
                    scope="row"
                    align="center"
                    colSpan={8}
                  >
                    {t("clinicsNotFound")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {isLoading === true ? (
        <Box
          sx={{
            width: "100%",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            flex: 1,
            alignItems: "center",
            height: "500px",
          }}
        >
          <CircularProgress color="secondary" />
        </Box>
      ) : null}
    </>
  );
}
