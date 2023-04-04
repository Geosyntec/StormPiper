import { useEffect, useState, cloneElement, Children } from "react";
import { api_fetch } from "../utils/utils";

const defaultUserProfile = {
  first_name: "",
  email: "",
  id: "",
  role: "",
};

export default function AuthProvider({ children }) {
  const [userProfile, setUserProfile] = useState(defaultUserProfile);

  const renderChildren = () => {
    return Children.map(children, (child) => {
      return cloneElement(child, { userProfile });
    });
  };

  useEffect(async () => {
    const res = await api_fetch("/api/rest/users/me");
    const resjson = await res.json();
    if (resjson.detail === "Unauthorized") {
      console.log("ya basic");
    } else {
      setUserProfile({ ...resjson });
    }
  }, []);

  return renderChildren();
}
