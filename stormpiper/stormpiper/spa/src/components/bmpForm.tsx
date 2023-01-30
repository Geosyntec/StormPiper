import { Button, Dialog,DialogActions,FormControlLabel,MenuItem,Switch,TextField } from "@material-ui/core";
import React from "react";
import { useState, useEffect,useRef } from "react";
import { useForm } from "react-hook-form";
import "./bmpForm.css";


const hiddenFields:string[]=['ref_data_key','design_storm_depth_inches','eliminate_all_dry_weather_flow_override','is_online']

type bmpFields = {
  title: string;
  required: string[];
  type: string;
  properties: {
    [x: string]: {[x: string]: string | number | boolean};
  };
};

type formProps = {
  allFields: bmpFields;
  simpleFields: bmpFields;
  values: {
    [x: string]: string | number;
  };
  currentFacility: string;
  facilityChangeHandler: Function;
  allFacilities: {
    [x: string]: {[x: string]: string;};
  };
};


export function BMPForm(props:formProps){
    const firstRender = useRef(true)
    const {register,unregister,handleSubmit,setValue,reset, getValues} = useForm()
    const [isSimple,setIsSimple] = useState(()=>{
        if(typeof props.values.facility_type === 'string' ){
            if(props.values.facility_type.match('_simple')){
                return true
            }else{
              return false
            }
        }
    })
    const [fields,setFields] = useState(()=>{
        let emptyFields:bmpFields = {
            title:'',
            required:[],
            type:'',
            properties:{}
        }
        return emptyFields
    })
    const [formFields,setFormFields] = useState(()=>{
      return _buildFields()
    })
    const [resultSuccess,setResultSuccess] = useState(false)
    const [resultError,setResultError] = useState(false)
    const [errorMsg,setErrorMsg] = useState("error!")

    useEffect(()=>{
      console.log("is this the first render: ",firstRender.current)
        if(!firstRender.current){ //Don't do this on first render to avoid set value before field is registered
          _clearForm(isSimple)
          reset(_createDefaults(isSimple))
        }
        isSimple
            ? setFields(props.simpleFields)
            : setFields(props.allFields)
        firstRender.current = false
    },[isSimple,props.currentFacility])

    useEffect(()=>{
      console.log("Current allFields: ",props.allFields)
      setFormFields(_buildFields())
    },[isSimple,fields])

    useEffect(()=>{
      console.log("Current Form Values: ",getValues())
    },[getValues()])

    function _buildFields():{fieldID:string,label:string,type:string,required:boolean,value:string|number}[]{
        let res:{fieldID:string,label:string,type:string,required:boolean,value:string|number}[] = []
        Object.keys(fields.properties).map((k:string)=>{
            let v:any = fields.properties[k]
            if(!hiddenFields.includes(k)){
              res.push({
                fieldID: k,
                label: v.title,
                type: v.type,
                required: fields.required.includes(k),
                value: props.values[k] && (props.values.facility_type===props.currentFacility)
                  ? props.values[k]
                  : v.default
                    ? v.default
                    // : undefined
                    : v.type==='string'
                      ?""
                      :0,
              });
            }
        })
        setValue('node_id',props.values.node_id)
        setValue('facility_type',props.currentFacility.replace('_simple',''))

        console.log("Finished Building Fields:",res)
        return res
    }

    function _createDefaults(simpleStatus: boolean | undefined) {
      let fieldSet: bmpFields;
      let defaultValues: { [x: string]: string | number | boolean | undefined } = {};
      simpleStatus
        ? (fieldSet = props.simpleFields)
        : (fieldSet = props.allFields);
      Object.keys(fieldSet.properties).map((k) => {
        if (!hiddenFields.includes(k) && !['node_id','facility_type'].includes(k)) {
          defaultValues[k] = props.values[k]
                              ? props.values[k]
                              : fieldSet.properties[k].default
                              ? fieldSet.properties[k].default
                              : fieldSet.properties[k].type==='string'
                                ?""
                                :0
        }else if(k==='node_id'){
          defaultValues[k] = props.values[k]
        }else if(k==='facility_type'){
          defaultValues[k] = props.currentFacility
        }
      });
      console.log("reseting form: ", defaultValues);
      return defaultValues;
    }

    function _clearForm(simpleStatus: boolean | undefined) {
      let fieldSet: bmpFields;
      let defaultValues: { [x: string]: string | number | boolean | undefined } = {};
      simpleStatus
        ? (fieldSet = props.simpleFields)
        : (fieldSet = props.allFields);
      Object.keys(fieldSet.properties).map((k) => {
        if (!hiddenFields.includes(k) || !['node_id','facility_type'].includes(k)) {
          unregister(k,{keepValue:false})
        }
      });
      console.log("Form should be clear: ", getValues());
    }
    async function _handleSubmit(data:any){
        if(isSimple && !data['facility_type'].match('_simple')){
          console.log("Appending simple")
          data['facility_type'] = data['facility_type']+'_simple'
        }

        console.log("Submitting Patch Request: ",data)
        const response = await fetch('/api/rest/tmnt_attr/'+props.values.node_id, {
            credentials: "same-origin",
            headers:{
                "accept":"application/json",
                "Content-type":"application/json"
            },
            method: "PATCH",
            body: JSON.stringify(data),
          })
          .then(resp=>{
            if(resp.status===200){
              setResultSuccess(true)
            }else if(resp.status===422){
              setResultError(true)
            }
            return resp.json()
          })
          .then((r)=>{
            //assume that only error responses have a detail object
            if(r.detail){
              setErrorMsg(r.detail)
            }
          }).catch(err=>{
            console.log("Error patching tmnt:")
            console.log(err)
          })
        return response
    }

    function _handleRecalculate(){
      fetch('/api/rpc/solve_watershed')
        .then(resp=>{
          setResultSuccess(false)
          console.log("Recalculation started: ",resp)
        })
        .catch(err=>{
          console.log("Recalculate Failed: ",err)
        })
    }

    function _renderErrorHeader(msg:string){
      let beginningText:RegExp = /[0-9]*\svalidation (error[s]*)/g
      let header= msg.match(beginningText)
      if(header){
        return header[0]
      }else{
        return header
      }
    }

    function _getErrorList(msg: string): string[] {
      let errorList: string[] = [];

      //Find the number of errors so that we know
      let errorNum = 0;
      let nums = msg.match(/[0-9]*/g);
      if (nums) {
        errorNum = parseInt(nums[0]);
      }

      //Isolate just the list of errors
      let beginningText: RegExp = /[0-9]*\svalidation (error[s]*\sfor\s\w*\s)/g;
      msg = msg.replaceAll(beginningText, "");

      let err = msg.match(/([\w\s.;=_]*)\([\w.=;\s]+\)/g);
      console.log("Found errors:", err);
      if (err) {
        err.map((e) => {
          errorList.push(e.replace(/\([\w.=;\s]+\)/g,''));//remove the error type in parantheses
        });
      }
      return errorList;
    }

    function _renderFormFields(){
        let simpleCheckDiv
        if(formFields){
            console.log("Rendering Form for: ",props.currentFacility+(isSimple?'_simple':''))
            console.log("With fields:",formFields)
            let fieldDiv = Object.values(formFields).map((formField:{fieldID:string,label:string,type:string,required:boolean,value:string|number})=>{
                return (
                    <div className="form-row">
                        {
                          formField.fieldID==='facility_type'
                            ?<TextField
                              id="simple-select"
                              variant="outlined"
                              margin="dense"
                              label={formField.label}
                              select
                              value={props.currentFacility.replace("_simple","")}
                              onChange={(e)=>{
                                  reset(_createDefaults(isSimple))
                                  props.facilityChangeHandler(e.target.value+(isSimple?'_simple':''))
                                  }}

                             >
                              {Object.keys(props.allFacilities).map((fType:string)=>{
                                if(!fType.match('_simple')){
                                  return(<MenuItem value={fType}>{props.allFacilities[fType].label}</MenuItem>)
                                }
                              })}
                            </TextField>
                            :<TextField variant="outlined" margin="dense" {...register(formField.fieldID)} type = {formField.type} defaultValue={formField.value} required={formField.required} label={formField.label} inputProps={{step:formField.type==='number'?0.01:null}} disabled={formField.label==='Node Id'}/>
                          }
                    </div>
                )
            })
            if (props.simpleFields) {
              simpleCheckDiv = (
                <div className="simple-checkbox">
                  <FormControlLabel control={<Switch checked={isSimple} onChange={() => setIsSimple(!isSimple)} color="primary"/>} label="Simple Facility?"/>
                </div>
              );
            } else {
              simpleCheckDiv = <div></div>;
            }
            console.log("Form Values after building fields: ",getValues())
            return (
              <div className="bmp-form">
                {simpleCheckDiv}
                <div className="form-body">{fieldDiv}</div>
                <div className="button-bar">
                  <Button variant="contained" type = "submit">Submit</Button>
                </div>
              </div>
            );
        }else{
            return(<div></div>)
        }
    }
    return(
        <React.Fragment>
        <form onSubmit={handleSubmit((data)=>_handleSubmit(data))}>
            {_renderFormFields()}
        </form>
        <Dialog open={resultSuccess} onClose={()=>setResultSuccess(false)}>
          <h4 className="result-header">Facility Details Submitted</h4>
          <DialogActions>
            <Button onClick={_handleRecalculate}>Recalculate WQ Results</Button>
            <Button onClick={()=>setResultSuccess(false)}>Continue</Button>
          </DialogActions>
        </Dialog>
        <Dialog open={resultError} onClose={()=>setResultError(false)}>
          <h4 className="result-header">Submission Error</h4>
          <p className="err-list-header">{_renderErrorHeader(errorMsg)}</p>
          <ul>
            {_getErrorList(errorMsg).map(msg=>{
              return(<li>{msg}</li>)
            })}
          </ul>
        </Dialog>
        </React.Fragment>
    )
}
