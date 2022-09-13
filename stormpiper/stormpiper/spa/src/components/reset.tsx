import React, { useState } from "react";
import { useNavigate,useParams } from "react-router-dom"
import { useForm } from "react-hook-form";
// import "./reset.css"
import { Typography } from "@material-ui/core";

export default function Reset(){
    const navigate = useNavigate()
    const {register,handleSubmit,formState: { errors },getValues} = useForm()
    const [error,setError] = useState(false)
    const params = useParams()

    const fields: {
      name: string;
      label: string;
      type: string;
      required?: boolean;
      defaultValue: string | number | undefined;
      minLength?: { value: number; message: string };
      maxLength?: { value: number; message: string };
      validate?: (val: any) => boolean | string;
      display?: boolean;
    }[] = [
      {
        name: "username",
        label: "username",
        type: "email",
        required: true,
        defaultValue: "",
      },
      {
        name: "password",
        label: "password",
        type: "password",
        defaultValue: "",
        minLength: {
          value: 8,
          message: "Password must be longer than 8 characters",
        },
        required: true,
      },
      {
        name: "confirm_password",
        label: "Confirm Password",
        type: "password",
        required: true,
        defaultValue: "",
        validate: (val) =>
          val === getValues("password") || "Passwords don't match",
      },
      {
        name: "token",
        label: "Reset token",
        type: "string",
        required: true,
        defaultValue: params.token,
        display:false,
      }
    ];
  
      function _renderFormFields(){
        let fieldDiv = Object.values(fields).map((formField:{name:string,label:string,type:string,required?:boolean,defaultValue:string|number|undefined})=>{
            return (
                  <div className="login-form-row">
                      {formField.required
                        ?<label className="form-label required" htmlFor={formField.name}>{formField.label}</label>
                        :<label className="form-label" htmlFor={formField.name}>{formField.label}</label>
                      }
                      <input className="form-input" {...register(formField.name,{...formField})} type={formField.type}/>
                      {errors[formField.name] && <p className="form-label error-msg">{errors[formField.name]?.message}</p>}
                  </div>
              )
          })
          return fieldDiv;
        
    }

    async function _handleSubmit(data:any,e:any){
        console.log("Event: ",e)
          const formData = new FormData(e.target);
          const response = await fetch('/auth/reset-password', {
              credentials: "same-origin",
              method: "POST",
              headers:{
                "Content-Type":"application/json"
              },
              body: formData,
            }).then((resp) => {
              if (resp.status == 200) {
                console.log("redirect on success");
                window.location.href = '/app/login';
                setError(false)
              } else {
                console.warn("reset failure", resp);
                setError(true)
              }
            });
          return response
      }
  
  

    return (
        <div className="reset-container">
          <div className="reset-form">
            <div className="reset-form-body">
              <Typography className="reset-header" variant="subtitle1"> Welcome to the Tacoma Watershed Insights Tool</Typography>
              <Typography className="reset-sub-header" variant="subtitle2"> reset or <a href="javascript:;" onClick={()=>navigate('/app/register')}>Register</a> to get Started</Typography>
              <form onSubmit={handleSubmit(_handleSubmit)}>
                {_renderFormFields()}
                <div className="button-bar">
                  <input className="submit-btn" type="submit" />
                </div>
                {
                  error
                    ?<p className="err-msg">Something went wrong - please try again</p>
                    :<p></p>
                }
              </form>
            </div>
          </div>
        </div>
      );
}
