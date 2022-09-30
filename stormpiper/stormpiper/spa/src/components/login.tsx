import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form";
import "./login.css"
import { Typography } from "@material-ui/core";
import { TextField,Input,Button } from '@material-ui/core'

export default function Login(){
    const navigate = useNavigate()
    const {register,handleSubmit} = useForm()
    const [error,setError] = useState(false)

    const fields:{fieldID:string,label:string,type:string,required:boolean,value:string|number}[] = [
      {
        fieldID:'username',
        label:'username',
        type:'email',
        required:true,
        value:''
      },
      {
        fieldID:'password',
        label:'password',
        type:'password',
        required:true,
        value:''
      },
    ]

    function _renderFormFields(){
        let fieldDiv = Object.values(fields).map((formField:{fieldID:string,label:string,type:string,required:boolean,value:string|number})=>{
          return (
                <div className="flex login-form-row">
                    {/* {formField.required
                      ?<InputLabel className="form-label required" htmlFor={formField.fieldID}>{formField.label}</InputLabel>
                      :<InputLabel className="form-label" htmlFor={formField.fieldID}>{formField.label}</InputLabel>
                    } */}
                    {
                        <TextField  {...register(formField.fieldID)} label = {formField.label} type = {formField.type} defaultValue={formField.value} required={formField.required}/>
                    }
                </div>
            )
        })
        return fieldDiv;

  }

    async function _handleSubmit(data:any,e:any){
      console.log("Event: ",e)
        const formData = new FormData(e.target);
        const response = await fetch('/auth/jwt-cookie/login', {
            credentials: "same-origin",
            method: "POST",
            body: formData,
          }).then((resp) => {
            if (resp.status == 200) {
              console.log("redirect on success");
              window.location.href = '/app';
              setError(false)
            } else {
              console.warn("login failure", resp);
              setError(true)
            }
          });
        return response
    }




    return (
      <div className="login-container">
        <div className="login-form flex">
          <div className="login-form-body flex">
            <div className="flex">
            <Typography className="login-header" variant="subtitle1"> Welcome to the Tacoma Watershed Insights Tool</Typography>
            <Typography className="login-sub-header" variant="subtitle2"> Login or <a href="javascript:;" onClick={()=>navigate('/app/register')}>Register</a> to get Started</Typography>
            </div>
            <form className="flex" onSubmit={handleSubmit(_handleSubmit)}>
              {_renderFormFields()}
              {/* <div className="reset-container">
                <a className="form-label" href="javascript:;" onClick={()=>navigate('/app/reset')}>Forgot your password?</a>
              </div> */}
              <div className="login-button-bar">
                <Button variant="contained" type = "submit">Submit</Button>
              </div>
              {
                error
                  ?<p className="err-msg">Incorrect username/password - please try again</p>
                  :<p></p>
              }
            </form>
          </div>
        </div>
      </div>
    );
}