import { createContext, useContext, useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore/lite";
import { auth, db } from "../firebase-config";

const UserContext = createContext();

export const useAuth = () => useContext(UserContext);

const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  // users/{uid}

  useEffect(() => {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);
        const document = await getDoc(userRef);
        if (document.exists) {
          setUserData({ ...document.data(), email: user.email });
        } else {
          console.log("No such document!");
        }
      } else {
        setUserData(null);
      }
    });
  }, []);

  const updateUser = (updatedUserData) => {
    setUserData({ ...userData, ...updatedUserData });
  };

  const loginUser = (userData) => {
    setUserData(userData);
  };

  const logoutUser = () => {
    setUserData(null);
  };

  return (
    <UserContext.Provider
      value={{ userData, loginUser, logoutUser, updateUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
