import React, { useState } from "react";
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form";
// import "./login.css"
import { Box, Card, CardContent, makeStyles, Typography } from "@material-ui/core";
import { TextField,Input,Button } from '@material-ui/core'

const useStyles = makeStyles((theme)=>({
  errorMsg:{
    color:theme.palette.warning.main,
    margin:'5px 20px'
  }
}))

export default function Login(){
    const navigate = useNavigate()
    const {register,handleSubmit, getValues} = useForm()
    const [error,setError] = useState(false)
    const classes = useStyles()
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
                <div className="flex auth-form-row">
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
      <div className="flex-row">
        <div className="flex lg-margin">
          <Card>
            <CardContent>
              <Typography variant="subtitle1" align="center"> Welcome to the Tacoma Watershed Insights Tool</Typography>
              <Typography variant="subtitle2" align="center"> Login or <a href="javascript:;" onClick={()=>navigate('/app/register')}>Register</a> to get Started</Typography>
              <Box sx={{margin:'1em'}}>
                <form className="flex" onSubmit={handleSubmit(_handleSubmit)}>
                  {_renderFormFields()}
                  <div className="flex auth-form-row">
                    <a className="form-label" href="javascript:;" onClick={()=>{navigate("/app/forgot-password")}}>Forgot your password?</a>
                  </div>
                  <div className="auth-button-bar">
                    <Button variant="contained" type = "submit">Submit</Button>
                  </div>
                  {
                    error && <Typography variant='caption' className={classes.errorMsg} align='center'>Incorrect username/password - please try again</Typography>
                  }
                </form>
              </Box>
            </CardContent>
          </Card>
        </div>
      </div>
    );
}
