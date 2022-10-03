import React, { useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form";
// import "./reset.css"
import { Typography,TextField,Button, CardContent, Card, Box } from "@material-ui/core";


export default function Forgot(){
    const navigate = useNavigate()
    const {register,handleSubmit,formState: { errors },getValues} = useForm()
    const [error,setError] = useState(false)
    const [success,setSuccess] = useState(false)
    const [searchParams, setSearchParams] = useSearchParams()

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
                    {errors[formField.name] && <p className="form-label error-msg">{errors[formField.name]?.message}</p>}
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
        // <div className="auth-container">
        //     <div className="auth-form flex">
        <div className="flex-row">
            <div className="flex lg-margin">
            {/* <div className="auth-form-body flex"> */}
                <Card>
                    <CardContent>
                        <Typography variant="subtitle1" align="center"> Welcome to the Tacoma Watershed Insights Tool</Typography>
                        <Typography variant="subtitle2" align="center"> Enter the email associated with your account below to reset your password</Typography>
                        <Box sx={{margin:'1em'}}>
                            <form onSubmit={handleSubmit(_handleSubmit)}>
                            {_renderFormFields()}
                            <div className="auth-button-bar flex">
                                <Button variant="contained" type = "submit">Submit</Button>
                            </div>
                            {
                                error && <p className="err-msg">Something went wrong - please try again</p>
                            }
                            {
                                success && <p className="success-msg">A reset link was sent to the email associated with this account - Use the link to reset your email, and return to <a href="javascript:;" onClick={()=>navigate('/app/login')}>Login</a></p>
                            }
                            </form>
                        </Box>
                    </CardContent>
                </Card>
            </div>
        </div>
        // </div>
        );
}



