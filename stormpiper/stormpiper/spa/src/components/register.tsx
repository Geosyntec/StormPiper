import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form";
import "./register.css"
import { Typography } from "@material-ui/core";
import { TextField,Button } from '@material-ui/core'



export default function Register(){
    const navigate = useNavigate()
    const {register,handleSubmit,formState: { errors },getValues} = useForm()
    const [error,setError] = useState(false)
    const [success,setSuccess] = useState(false)
    const [displayVerify,setDisplayVerify] = useState(false)

    const fields:{name:string,label:string,type:string,required?:boolean,defaultValue:string|number, minLength?:{value:number,message:string},maxLength?:{value:number,message:string},validate?:(val:any)=>boolean|string}[] = [
      {
        name:'email',
        label:'Email',
        type:'email',
        required:true,
        defaultValue:''
      },
      {
        name:'first_name',
        label:'First Name',
        type:'text',
        defaultValue:''
      },
      {
        name:'last_name',
        label:'Last Name',
        type:'text',
        defaultValue:''
      },
      {
        name:'password',
        label:'Password',
        type:'password',
        required:true,
        defaultValue:'',
        minLength:{
            value:8,
            message:'Password must be longer than 8 characters'
        }
      },
      {
        name:'confirm_password',
        label:'Confirm Password',
        type:'password',
        required:true,
        defaultValue:'',
        validate:val=>val===getValues('password')||"Passwords don't match"
      },
    ]

    function _renderFormFields(){
        let fieldDiv = Object.values(fields).map((formField:{name:string,label:string,type:string,required?:boolean,defaultValue:string|number})=>{
          return (
                <div className="login-form-row flex-column">
                    {
                        <TextField  {...register(formField.name,{...formField})} label = {formField.label} type = {formField.type} required={formField.required}/>
                    }
                    {/* <input className="form-input" {...register(formField.name,{...formField})} type={formField.type}/> */}
                    {errors[formField.name] && <p className="form-label error-msg">{errors[formField.name]?.message}</p>}
                </div>
            )
        })
        return fieldDiv;

  }

    async function _handleSubmit(data:any,e:any){
        delete data.confirm_password
        console.log("Event: ",e)
        console.log("Data:",data)
        const formData = new FormData(e.target);
        const response = await fetch('/auth/register', {
            credentials: "same-origin",
            method: "POST",
            headers:{
                "Content-Type":"application/json"
            },
            body: JSON.stringify(Object.fromEntries(formData.entries())),
          }).then((resp) => {
            if (resp.status > 200 && resp.status <300) {
              console.log("success", resp);
              //   window.location.href = '/app';
              setSuccess(true);
              setError(false);
            } else {
              console.warn("register failure", resp);
              setError(true);
            }
          });
        return response
    }




    return (
      <div className="login-container">
        <div className="login-form">
          <div className="login-form-body flex-column">
            <Typography className="login-header" variant="subtitle1"> Enter Your New Account Information</Typography>
            <form className="flex-column" onSubmit={handleSubmit(_handleSubmit)}>
              {_renderFormFields()}
              {/* <div className="button-bar">
                <input className="submit-btn" type="submit" />
              </div> */}
              <div className="login-button-bar">
                <Button variant="contained" type = "submit">Submit</Button>
              </div>
              {
                error && <p className="err-msg">User already exists</p>
              }
              {
                success && <p className="success-msg">Successfully registered - Check your email for a confirmation link, and return to <a href="javascript:;" onClick={()=>navigate('/app/login')}>Login</a></p>
              }
            </form>
          </div>
        </div>
      </div>
    );
}
