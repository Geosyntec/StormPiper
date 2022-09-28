import React, { useEffect, useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form";
// import "./reset.css"
import { Typography,TextField,Card, CardContent,Button } from "@material-ui/core";
import { textAlign } from "@mui/system";

export default function Reset(){
    const navigate = useNavigate()
    const {register,handleSubmit,formState: { errors },getValues} = useForm()
    const [error,setError] = useState(false)
    const [success,setSuccess] = useState(false)
    const [resetContents,setResetContents] = useState((
      <React.Fragment>
          <Typography variant="subtitle1">
            Checking your reset link...
          </Typography>
        </React.Fragment>
    ))
    const [searchParams, setSearchParams] = useSearchParams()

    let expiresAt:string|null = searchParams.get('expires_at')
    let now = new Date()
    let expiryDateFormatted = new Date(expiresAt)

    console.log("Expiry date: ",expiryDateFormatted)

    const fields: {
      name: string;
      label: string;
      type: string;
      required?: boolean;
      defaultValue: string | number | null;
      minLength?: { value: number; message: string };
      maxLength?: { value: number; message: string };
      validate?: (val: any) => boolean | string;
      display?: boolean;
    }[] = [
      {
        name: "password",
        label: "New Password",
        type: "password",
        defaultValue: "",
        minLength: {
          value: 8,
          message: "Password must be longer than 8 characters",
        },
        required: true,
        display:true,
      },
      {
        name: "confirm_password",
        label: "Confirm Password",
        type: "password",
        required: true,
        defaultValue: "",
        validate: (val) =>
          val === getValues("password") || "Passwords don't match",
          display:true,
      },
      {
        name: "token",
        label: "Reset token",
        type: "string",
        required: true,
        defaultValue: searchParams.get("token"),
        display:false,
      }
    ];

    function _renderFormFields(){
      let fieldDiv = Object.values(fields).map((formField)=>{
        return (
              <div className="flex auth-form-row">
                  {
                      <TextField  {...register(formField.name)} label = {formField.display?formField.label:null} type = {formField.display?formField.type:"hidden"} defaultValue={formField.defaultValue} required={formField.required}/>
                  }
              </div>
          )
      })
      return fieldDiv;

}

    async function _handleSubmit(data:any,e:any){
        console.log("Event: ",e)
          const formData = new FormData(e.target);
          console.log("formData: ",formData)
          const response = await fetch('/auth/reset-password', {
              credentials: "same-origin",
              method: "POST",
              headers:{
                Accept:"application/json",
                "Content-Type":"application/json"
              },
              body: JSON.stringify(Object.fromEntries(formData.entries())),
            }).then((resp) => {
              if (resp.status == 200) {
                setError(false)
                setSuccess(true)
              } else {
                console.warn("reset failure", resp);
                setError(true)
                setSuccess(false)
              }
            });
          return response
      }


    useEffect(()=>{
      if(now>expiryDateFormatted){
        setResetContents(
          <React.Fragment>
            <Typography variant="subtitle1">
                Sorry, your password reset link has expired
              </Typography>
              <Typography variant="subtitle2">
                Please return to <a href="javascript:;" onClick={()=>navigate('/app/login')}>login </a> to request another link
              </Typography>
          </React.Fragment>
        )
      }else{
        setResetContents(
          <React.Fragment>
            <Typography align="center" variant="subtitle1"> Welcome to the Tacoma Watershed Insights Tool</Typography>
            <Typography align = "center" variant="subtitle2"> Enter your new password below</Typography>
            <form className = "flex" onSubmit={handleSubmit(_handleSubmit)}>
              {_renderFormFields()}
              <div className="button-bar">
                <Button variant="contained" type = "submit">Submit</Button>
              </div>
              {
                error
                  ?<p className="err-msg">Something went wrong - please try again</p>
                  :<p></p>
              }
                {
              success && <p className="success-msg">Your password was reset successfully. Please return to <a href="javascript:;" onClick={()=>navigate('/app/login')}>login</a></p>
              }
            </form>
          </React.Fragment>
        )
      }
    },[])


    return (
      <div className="flex-row">
        <div className="flex lg-margin">
          <Card>
            <CardContent>
              {resetContents}
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
