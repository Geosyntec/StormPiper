import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AuthProvider(props: any) {
  const navigate = useNavigate();
  let baseURL = import.meta.env.BASE_URL.toString().split("/");
  baseURL.pop();
  baseURL.pop();
  const revisedURL = baseURL.length > 1 ? baseURL.join("/") : "/";
  


  useEffect(() => {
    fetch(revisedURL + "api/rest/users/me")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        if (res.detail === "Unauthorized") {
          navigate("/app/login");
          return null
        } else {
          console.log("Trying to return app");
          return props.children;
        }
      });
  });

  return props.children
}
