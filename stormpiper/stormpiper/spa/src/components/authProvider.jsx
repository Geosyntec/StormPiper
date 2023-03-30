import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api_fetch } from "../utils/utils";

export default function AuthProvider(props) {
  const navigate = useNavigate();

  useEffect(() => {
    api_fetch("/api/rest/users/me")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.detail === "Unauthorized") {
          navigate("/app/login");
          return null;
        } else {
          console.log("Trying to return app");
          return props.children;
        }
      });
  });

  return props.children;
}
