import React, { useEffect, useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form";
import { Typography,TextField,Card, CardContent,Button, Box, makeStyles } from "@material-ui/core";

const useStyles = makeStyles((theme)=>({
  successMsg:{
    color:theme.palette.primary.main,
    margin:'5px 20px',
  },
  errorMsg:{
    color:theme.palette.warning.main,
    margin:'5px 20px'
  },
  mainButton: {
    margin:"1rem",
  },
}))

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
    const classes = useStyles()


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
      console.log("Rendering fields. Any errors?:",errors)
      let fieldDiv = Object.values(fields).map((formField)=>{
        return (
              <div className="flex-column auth-form-row">
                  {
                      <TextField  {...register(formField.name,{...formField})} label = {formField.display?formField.label:null} type = {formField.display?formField.type:"hidden"} defaultValue={formField.defaultValue} required={formField.required}/>
                  }
                  {errors[formField.name] && <Typography variant='caption' className={classes.errorMsg} align='center'>{errors[formField.name]?.message}</Typography>}

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

    return (
      <div className="flex-row">
        <div className="flex lg-margin">
          <Card>
            <CardContent>
              {
                now>expiryDateFormatted
                  ?(<Box className="flex-column">
                    <Typography align="center" variant="subtitle1">
                        Sorry, your password reset link has expired
                      </Typography>
                      <Typography align="center" variant="subtitle2">
                        Please return to login to request another link
                      </Typography>
                      <Button className={classes.mainButton} color="primary" variant= "contained" onClick={()=>navigate('/app/login')}>Login</Button>
                    </Box>)
                  :(
                    <React.Fragment>
                      <Typography align="center" variant="subtitle1"> Welcome to the Tacoma Watershed Insights Tool</Typography>
                      <Typography align = "center" variant="subtitle2"> Enter your new password below</Typography>
                      <Box sx={{margin:'1em'}}>
                        <form className = "flex" onSubmit={handleSubmit(_handleSubmit)}>
                          {_renderFormFields()}
                          <div className="auth-button-bar flex-column">
                            <Button className={classes.mainButton} variant="contained" type="submit" color="primary">Submit</Button>
                            <Button className={classes.mainButton} color="primary" variant= "contained" onClick={()=>navigate('/app/login')}>Login</Button>
                            {
                              error &&
                                <div className="flex auth-form-row">
                                  <Typography variant='caption' className={classes.errorMsg} align='center'>Password reset failed. Please return to <a href="javascript:;" onClick={()=>navigate('/app/login')}>login and request a new reset link</a></Typography>
                                </div>
                            }
                            {
                              success &&
                                <div className="flex auth-form-row">
                                  <Typography variant='caption' className={classes.successMsg} align='center'>Your password was reset successfully. Please return to <a href="javascript:;" onClick={()=>navigate('/app/login')}>login</a></Typography>
                                </div>
                            }
                          </div>
                        </form>
                      </Box>
                    </React.Fragment>
                  )
              }
            </CardContent>
          </Card>
        </div>
      </div>
  );
}
