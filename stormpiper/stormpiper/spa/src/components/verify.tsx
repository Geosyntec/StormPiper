import { useSearchParams,useNavigate } from "react-router-dom"
import React, {useEffect, useState} from "react";
import { Card, CardContent, Typography } from "@material-ui/core";

export default function Verify(){

    const [searchParams, setSearchParams] = useSearchParams()
    const navigate = useNavigate()

    let token:string|null = searchParams.get('token')
    let expiresAt:string|null = searchParams.get('expires_at')
    let now = new Date()
    let expiryDateFormatted = new Date(expiresAt?.split(' ')[0])
    console.log("Token:",token)
    console.log("expires_at: ",expiryDateFormatted)

    const [verifyResults,setVerifyResults] = useState((
      <React.Fragment>
          <Typography variant="subtitle1">
            Checking your verification status...
          </Typography>
        </React.Fragment>
    ))

    useEffect(()=>{
      if(now>expiryDateFormatted){
        setVerifyResults(
          <React.Fragment>
            <Typography variant="subtitle1">
              Sorry, your email verification link has expired
            </Typography>
            <Typography variant="subtitle2">
              Please <a href="javascript:;" onClick={()=>navigate('/app/login')}>log in </a> again to request another link
            </Typography>
          </React.Fragment>
        )
      }
      else{
        fetch('/auth/verify',{
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          method: "POST",
          body: JSON.stringify({"token":token}),
        }).then(resp=>{
          console.log("Auth response: ",resp.status)
          if(resp.status===200){
            setVerifyResults(
              <React.Fragment>
                <Typography variant="subtitle1">
                  Thank you for verifying your email with Tacoma Watershed Insights
                </Typography>
                <Typography variant="subtitle2">
                  Please <a href="javascript:;" onClick={()=>navigate('/app/login')}>log in </a> with the credentials you created for your account
                </Typography>
              </React.Fragment>
            )
          }else{
            setVerifyResults(
            <React.Fragment>
            <Typography variant="subtitle1">
              Sorry, something went wrong with your verification
            </Typography>
            <Typography variant="subtitle2">
              Please <a href="javascript:;" onClick={()=>navigate('/app/login')}>log in </a> again to request another link
            </Typography>
          </React.Fragment>
            )
          }
        })
      }
    },[])


   return (
            <div className="flex-row">
              <div className="lg-margin">
                <Card>
                  <CardContent>
                    {verifyResults}
                  </CardContent>
                </Card>
              </div>
            </div>
        );
}
