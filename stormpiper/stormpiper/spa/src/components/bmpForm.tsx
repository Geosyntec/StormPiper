import React from "react";
import { useForm } from "react-hook-form";

type formProps={
    fields:tmntAttrs
}

interface tmntAttrs{
    [x: string]: string | number | undefined;
    treatment_strategy?: string
    facility_type?: string
    hsg?: string
    design_storm_depth_inches?: number
    tributary_area_tc_min?: number
    total_volume_cuft?: number
    area_sqft?: number
    inf_rate_inhr?: number
    retention_volume_cuft?: number
    media_filtration_rate_inhr?: number
    minimum_retention_pct_override?: number
    treatment_rate_cfs?: number
    depth_ft?: number
}

const fieldDict:{[key:string]:string[]}={
    default:[
        "design_storm_depth_inches",
        "total_volume_cuft",
        "retention_volume_cuft",
        "area_sqft",
        "hsg",
        "tributary_area_tc_min"
    ]
}

const fieldTypes:{[key:string]:string}={
    treatment_strategy:"text",
    hsg:"text",
    facility_type:"text",
    design_storm_depth_inches:"number",
    tributary_area_tc_min:"number",
    total_volume_cuft:"number",
    area_sqft:"number",
    inf_rate_inhr:"number",
    retention_volume_cuft:"number",
    media_filtration_rate_inhr:"number",
    minimum_retention_pct_override:"number",
    treatment_rate_cfs:"number",
    depth_ft:"number",
}

export function BMPForm(props:formProps){
    const {register,handleSubmit} = useForm()

    function _renderFormFields(){
        console.log("Rendering form fields: ",props.fields)
        if(props.fields){
            let fields = fieldDict[props.fields.facility_type||"default"]
            let fieldDiv = fields.map((field:string,index:number)=>{
                return (
                    <div className="form-row">
                        <label htmlFor={field}>{field}</label>
                        <input {...register(field)} type = {fieldTypes[field]||"number"} value={props.fields[field]}/>
                    </div>
                )
            })
            return(
                <div className="form-body">
                     {fieldDiv}
                    <input type="submit"/>
                </div>
            )
        }else{
            return(<div></div>)
        }
    }
    return(
        <form onSubmit={handleSubmit((data)=>console.log(data))}>
            {_renderFormFields()}
        </form>
    )
}
