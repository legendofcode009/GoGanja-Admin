import React from "react";
import {
  Routes,
  Route,
  BrowserRouter,
  Navigate,
  Outlet,
} from "react-router-dom";
import Home from "./pages/Home";
import Clinics from "./pages/Clinics";
import Landing from "./pages/Landing";
import Settings from "./pages/Settings";
import AddForm from "./products/AddForm";
import Bookings from "./pages/Bookings";
import EditForm from "./products/EditForm";
import { ThemeProvider, createTheme, Snackbar } from "@mui/material";
import Registration from "./pages/Register";
import Login from "./pages/Login";
import Prescriptions from "./pages/Prescriptions";
import { useAppStore } from "./appStore";
import ClientManagement from "./pages/ClientManagement";
import PrescriptionsManagement from "./pages/PrescriptionManagement";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/landing" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  if (token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const theme = createTheme({
  typography: {
    fontFamily: ["lato"].join(","),
  },
  palette: {
    primary: {
      main: "#314435",
    },
    secondary: {
      main: "#D7A90D",
    },
    background: {
      main: "#ffffff",
    },
  },
});
export default function App() {
  const { isSnackBarVisible, snackBarText, hideSnackBar } = useAppStore(
    (state) => state
  );

  return (
    <>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <Routes>
            <Route
              path="/registration"
              element={
                <PublicRoute>
                  <Registration />
                </PublicRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/landing"
              element={
                <PublicRoute>
                  <Landing />
                </PublicRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Outlet />
                </ProtectedRoute>
              }
            >
              <Route index element={<Home />} />
              <Route path="/clinics" exact element={<Clinics />} />
              <Route path="/settings" exact element={<Settings />} />
              <Route path="/add-clinic" exact element={<AddForm />} />
              <Route path="/edit-clinic/:id" element={<EditForm />} />
              <Route path="/bookings" exact element={<Bookings />} />
              <Route path="/prescriptions" exact element={<Prescriptions />} />
              <Route
                path="/client_management"
                exact
                element={<ClientManagement />}
              />
              <Route
                path="/prescription_management"
                exact
                element={<PrescriptionsManagement />}
              />
            </Route>
          </Routes>
          <Snackbar
            open={isSnackBarVisible}
            autoHideDuration={3000}
            onClose={hideSnackBar}
            message={snackBarText}
          />
        </ThemeProvider>
      </BrowserRouter>
    </>
  );
}
