import React, { useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form";
import { Typography,TextField,Button, CardContent, Card, Box, makeStyles} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  errorMsg: {
    color: theme.palette.warning.main,
    margin: "5px 20px",
  },
  successMsg:{
    color:theme.palette.primary.main,
    margin:'5px 20px',
  },
  mainCard: {
    backgroundColor: theme.palette.grey[100],
  },
  mainButton: {
    margin:"1rem",
  },
}));

export default function Forgot(){
    const navigate = useNavigate()
    const {register,handleSubmit,formState: { errors },getValues} = useForm()
    const [error,setError] = useState(false)
    const [success,setSuccess] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()
    const classes = useStyles()

    const fields: {
      name: string;
      label: string;
      type: string;
      required?: boolean;
      defaultValue: string | number | null;
      minLength?: { value: number; message: string };
      maxLength?: { value: number; message: string };
      validate?: (val: any) => boolean | string;
    }[] = [
      {
        name: "username",
        label: "username",
        type: "email",
        required: true,
        defaultValue: "",
      },
    ];

    function _renderFormFields(){
        let fieldDiv = Object.values(fields).map((formField)=>{
          return (
                <div className="flex auth-form-row">
                    {
                        <TextField  {...register(formField.name,{...formField})} label = {formField.label} type = {formField.type} required={formField.required}/>
                    }
                    {errors[formField.name] && <Typography variant='caption' className={classes.errorMsg} align='center'>{errors[formField.name]?.message}</Typography>}
                </div>

            )
        })
        return fieldDiv;

    }


    async function _handleSubmit() {
        const response = await fetch("/auth/forgot-password", {
        credentials: "same-origin",
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: getValues().username }),
        }).then((resp) => {
        if (resp.status == 202) {
            setError(false);
            setSuccess(true)
        } else {
            console.warn("login failure", resp);
            setError(true);
            setSuccess(false)
        }
        });
        return response;
    }



    return (
        <div className="flex-row">
            <div className="flex lg-margin">
                <Card className={classes.mainCard}>
                    <CardContent>
                        <Typography variant="subtitle1" align="center"> Welcome to the Tacoma Watershed Insights Tool</Typography>
                        <Typography variant="subtitle2" align="center"> Enter the email associated with your account below to reset your password</Typography>
                        <Box sx={{margin:'1em'}}>
                            <form onSubmit={handleSubmit(_handleSubmit)}>
                            {_renderFormFields()}
                            <div className="auth-button-bar flex">
                                <Button className={classes.mainButton} color="primary" variant="contained" type = "submit">Submit</Button>
                                <Button className={classes.mainButton} color="primary" variant="contained"  onClick={()=>navigate('/app/login')}>Login</Button>
                                {
                                    error &&
                                        <div className="flex auth-form-row">
                                            <Typography variant='caption' className={classes.errorMsg} align='center'>Reset request failed - please try again</Typography>
                                        </div>
                                }
                                {
                                    success &&
                                        <div className="flex-column auth-form-row">
                                            <Typography variant='caption' className={classes.successMsg} align='center'>A reset link was sent to the email associated with this account - Use the link to reset your email, and return to login</Typography>
                                        </div>
                                }
                            </div>
                            </form>
                        </Box>
                    </CardContent>
                </Card>
            </div>
        </div>
        );
}



