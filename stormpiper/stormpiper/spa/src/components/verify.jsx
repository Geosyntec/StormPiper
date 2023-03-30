import { useSearchParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Typography } from "@mui/material";
import { ThemeProvider } from "@mui/material";
import { api_fetch } from "../utils/utils";
import { default as SimpleCardForm } from "./forms/simpleCardForm";
import { staticTheme } from "../theme";

export default function Verify() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  let token = searchParams.get("token");
  let expiresAt = searchParams.get("expires_at");
  let now = new Date();
  let expiryDateFormatted = new Date(expiresAt);
  console.log("Token:", token);
  console.log("expires_at: ", expiryDateFormatted);

  const [verifyResults, setVerifyResults] = useState(
    <>
      <Typography variant="subtitle1">
        Checking your verification status...
      </Typography>
    </>
  );

  useEffect(() => {
    if (now > expiryDateFormatted) {
      setVerifyResults(
        <>
          <Typography variant="subtitle1">
            Sorry, your email verification link has expired
          </Typography>
          <Typography variant="subtitle2">
            Please{" "}
            <a href="#" onClick={() => navigate("/app/login")}>
              log in{" "}
            </a>{" "}
            again to request another link
          </Typography>
        </>
      );
    } else {
      api_fetch("/auth/verify", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ token: token }),
      }).then((resp) => {
        console.log("Auth response: ", resp.status);
        if (resp.status === 200) {
          setVerifyResults(
            <>
              <Typography variant="subtitle1" align="center">
                Thank you for verifying your email with Tacoma Watershed
                Insights
              </Typography>
              <Typography variant="subtitle2" align="center">
                Please{" "}
                <a href="#" onClick={() => navigate("/app/login")}>
                  log in{" "}
                </a>{" "}
                with the credentials you created for your account
              </Typography>
            </>
          );
        } else {
          setVerifyResults(
            <>
              <Typography variant="subtitle1" align="center">
                Sorry, something went wrong with your verification
              </Typography>
              <Typography variant="subtitle2" align="center">
                Please{" "}
                <a href="#" onClick={() => navigate("/app/login")}>
                  log in{" "}
                </a>{" "}
                again to request another link
              </Typography>
            </>
          );
        }
      });
    }
  }, []);

  return (
    <ThemeProvider theme={staticTheme}>
      <SimpleCardForm>{verifyResults}</SimpleCardForm>
    </ThemeProvider>
  );
}
