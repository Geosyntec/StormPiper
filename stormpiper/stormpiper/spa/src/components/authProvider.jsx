import { useEffect, useState, createContext } from "react";
import { useNavigate } from "react-router-dom";
import { api_fetch } from "../utils/utils";

const defaultUserProfile = {
  first_name: "",
  email: "",
  id: "",
  role: "",
};

export const UserProfileContext = createContext(defaultUserProfile);

export default function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(defaultUserProfile);

  const renderChildren = () => {
    return (
      <UserProfileContext.Provider value={userProfile}>
        {children}
      </UserProfileContext.Provider>
    );
  };

  useEffect(async () => {
    const res = await api_fetch("/api/rest/users/me");
    const resjson = await res.json();
    if (resjson.detail === "Unauthorized") {
      console.log("ya basic");
      navigate("/app/login");
    } else {
      setUserProfile({ ...resjson });
    }
  }, []);

  return renderChildren();
}
