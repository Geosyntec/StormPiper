import React from "react";
import { useEffect, useState } from "react";
import { Typography } from "@material-ui/core";
import { BMPForm } from "./bmpForm";
import { ListAltRounded, LocalDiningOutlined } from "@material-ui/icons";
import "./bmpStatWindow.css";

// TODO: Make Facility Type editable (for now, only allow user to toggle between simple and not simple). Look for endpoint that can retrieve all facility types, and their respective data models

const statsDict={
  overview:{
    label:"Overview",
    fields:["altid","facilitytype"]
  },
  designParameters:{
    label:"Design Parameters",
    fields:["design_storm_depth_inches","total_volume_cuft","retention_volume_cuft"],
  },
  tributaryArea:{
    label:"Tributary Area",
    fields:["tributary_area_tc_min"],
  },
  lifeCycleCosts:{
    label:"Life-Cycle Costs",
    fields:[],
  },
  performanceSummary:{
    label:"Performance Summary",
    fields:[],
  },
}

const fieldLabelDict:{[key:string]:string} = {
  altid: "ID",
  facilitytype: "Facility Type",
  design_storm_depth_inches: "Design Storm Depth (in)",
  tributary_area_tc_min: "Tributary Area Tc (min)",
  total_volume_cuft: "Total Volume (cubic ft)",
  retention_volume_cuft: "Retention Volume (cubic ft)",
};



type statWindowProps={
  displayStatus:boolean,
  displayController:()=>void,
  feature:string
}

type bmpPanelState={
  header:string,
  stats:string[],
  error:boolean,
  isLoaded:boolean,
  items:any,
}

type specState={
  context:any,
  facilitySpec:any
}




function BMPStatWindow(props:statWindowProps) {
  let baseURL = (import.meta.env.BASE_URL).toString().split("/")
  baseURL.pop()
  baseURL.pop()
  console.log("Base URL popped: ",baseURL)
  const revisedURL = baseURL.length > 1 ? baseURL.join("/") : "/";




  const [state,setState] = useState<bmpPanelState>({
    header:"Overview",
    stats:[],
    error:false,
    isLoaded:false,
    items:[],
  })

  const [facilityType,setFacilityType] = useState("")

  const [specs,setSpecs] = useState<specState>({
    context:{},
    facilitySpec:{}
  })

  const [loadingState,setLoadingState] = useState<boolean>(false)

  useEffect(()=>{
    // OpenAPI spec holds the base facility types used by nereid
    // Context endpoint holds mapping between project-specific names and base types
    let resources = [revisedURL+"openapi.json",revisedURL+"api/rest/reference/context"]

    Promise.all(resources.map(url=>fetch(url).then(res=>res.json())))
      .then(resArray=>{
        setSpecs({
          facilitySpec:resArray[0].components.schemas,
          context:resArray[1].api_recognize.treatment_facility.facility_type
        })
      })
    
    
  },[])

  useEffect(()=>{
    console.log("New Loading State: ",loadingState)
  },[loadingState])
  useEffect(()=>{
    console.log("New State: ",state)
  },[state])

  useEffect(() => {
    setLoadingState(false)
    if(props.feature){
      fetch(revisedURL+"api/rest/tmnt_facility/"+props.feature)
        .then(res=>res.json())
        .then(result=>{
          setState({
            ...state,
            error:false,
            header:"Overview",
            items:{...result},
            stats:statsDict.overview.fields
          })
          setFacilityType(result.facility_type)
          setLoadingState(true)
        })
        .catch(err=>{
          console.log("TMNT fetch failed: ",err)
          setState({
            ...state,
            error:true
          })
        })
    }
  }, [props?.feature]);

  function ActiveHeader(props:{label:string,clickHandler:Function}){
    return(
    <p key={props.label} onClick={()=>{props.clickHandler(props.label)}} className={props.label===state.header?"active":undefined}>{props.label}</p>
    )
  }

  function switchStats(headerName:string){
    setState(()=>{
      let stats:any[] = []
      const fields:string[]|undefined = Object.values(statsDict)
        .filter((group) => group.label === headerName)
        .map((f) => f.fields)[0];
      if(state.items && fields){
        stats =  Object.keys(state.items).filter((item:string)=>{
          return fields.includes(item)
        })
        console.log("Displaying stats: ",stats)
      }
      return {
        ...state,
        header:headerName,
        stats
      }
    })
  }
  
  function _renderStats() {
    if(!props.feature){
      return <div>Select a BMP Feature</div>
    }
    if(state.error){
      return <div>Something went wrong on our end.</div>
    }else if(!loadingState){
      console.log("Displaying Loading Screen, loadingState = ",loadingState)
      return <div>Loading...</div>
    }else{
      let statsList = Object.values(state.stats).map((stat:string)=>{
        if(stat){
          return (
            <div className="stat">
              <p><strong>{fieldLabelDict[stat]}:&#8195;</strong></p>
              <p>{state.items[stat]}</p>
            </div>
          );
        }
      })
      return (
          <div>
            {statsList}
          </div>
      );
    }

    
  }

  function _renderBMPForm(facilityType:string) {
    if(state.error){
      return <div>Something went wrong on our end.</div>
    }else if(!loadingState){
      return <div>Loading...</div>
    }else{
      let fType:string = facilityType
      let fTypeRoot = fType.replace("_simple","")
      
      console.log("Attempting to render form for ",facilityType)

      let simpleBaseType
      if(fType==='no_treatment'){
        simpleBaseType=specs.context[fTypeRoot].validator //no_treatment has no simple equivalent
      }else{
        simpleBaseType=specs.context[fTypeRoot+'_simple'].validator
      }
      let baseType=specs.context[fTypeRoot].validator

      let facilityFields = specs.facilitySpec[baseType]
      let simpleFacilityFields = specs.facilitySpec[simpleBaseType]
      console.log('Fields found:',facilityFields)
      return (
          <BMPForm allFields={facilityFields} simpleFields={simpleFacilityFields} values={state.items} allFacilities={specs.context} currentFacility={facilityType} facilityChangeHandler={setFacilityType}></BMPForm>
      );
    }

    
  }

  function _renderHeaderList(){
    let headerList = Object.values(statsDict).map((category,index) => {
      return (
        <ActiveHeader
          key={index}
          label={category.label}
          clickHandler={() => switchStats(category.label)}
        ></ActiveHeader>
      );
    });
    return headerList
  }

  return (
    props.displayStatus
      ?<div>
      <div className="panel-header">
        <div className="title-container">
          <h4 id="panel-title">BMP Stat Table</h4>
        </div>
        <div className="cancel-container">
          <h4 id="cancel-icon" onClick={props.displayController}>
            &#10005;
          </h4>
        </div>
      </div>
      <div>
        <h5>{props.feature}</h5>
      </div>
      <div className="stats-table">
        <div className="table-header">{_renderHeaderList()}</div>
        {props
          ? state.header != "Design Parameters"
            ? _renderStats()
            : _renderBMPForm(facilityType)
          : null}
      </div>
    </div>
    :<div id="bmp-panel-icon">
      <ListAltRounded onClick={props.displayController}/>
    </div>
  );
}



export default BMPStatWindow;
