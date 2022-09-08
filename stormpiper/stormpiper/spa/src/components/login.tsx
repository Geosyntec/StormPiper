import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form";
import "./login.css"
import { Typography } from "@material-ui/core";


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
                <div className="login-form-row">
                    {formField.required
                      ?<label className="form-label required" htmlFor={formField.fieldID}>{formField.label}</label>
                      :<label className="form-label" htmlFor={formField.fieldID}>{formField.label}</label>
                    }
                    {
                        <input className="form-input" {...register(formField.fieldID)} type = {formField.type} defaultValue={formField.value} required={formField.required}/>
                    }
                </div>
            )
        })
        return fieldDiv;
      
  }

    async function _handleSubmit(data:any,e:any){
      console.log("Event: ",e)
        const formData = new FormData(e.target);
        const response = await fetch('/login', {
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
        <div className="login-form">
          <div className="login-form-body">
            <Typography className="login-header" variant="subtitle1"> Welcome to the Tacoma Watershed Insights Tool</Typography>
            <Typography className="login-sub-header" variant="subtitle2"> Login or <a href="javascript:;" onClick={()=>navigate('/app/register')}>Register</a> to get Started</Typography>
            <form onSubmit={handleSubmit(_handleSubmit)}>
              {_renderFormFields()}
              <div className="button-bar">
                <input className="submit-btn" type="submit" />
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
