import React, { useState } from "react";
import { useNavigate,useSearchParams } from "react-router-dom"
import { useForm } from "react-hook-form";
// import "./reset.css"
import { Typography,TextField } from "@material-ui/core";

export default function Reset(){
    const navigate = useNavigate()
    const {register,handleSubmit,formState: { errors },getValues} = useForm()
    const [error,setError] = useState(false)
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
      display?: boolean;
    }[] = [
      // {
      //   name: "username",
      //   label: "username",
      //   type: "email",
      //   required: true,
      //   defaultValue: "",
      //   display:true,
      // },
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
        <div className="auth-container">
          <div className="auth-form flex">
            <div className="auth-form-body flex">
              <Typography variant="subtitle1"> Welcome to the Tacoma Watershed Insights Tool</Typography>
              <Typography variant="subtitle2"> reset or <a href="javascript:;" onClick={()=>navigate('/app/register')}>Register</a> to get Started</Typography>
              <form className = "flex" onSubmit={handleSubmit(_handleSubmit)}>
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
