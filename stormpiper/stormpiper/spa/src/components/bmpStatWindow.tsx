import React from "react";
import { useEffect, useState } from "react";
import { BMPForm } from "./bmpForm";
import "./bmpStatWindow.css";



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
  items:any
}




function BMPStatWindow(props:statWindowProps) {
  let baseURL = (import.meta.env.BASE_URL).toString().split("/")
  baseURL.pop()
  baseURL.pop()
  console.log("Base URL popped: ",baseURL)
  const revisedURL = baseURL.length > 1 ? baseURL.join("/") : "/";


  console.log("Altered Base URL: ",revisedURL)


  const [state,setState] = useState<bmpPanelState>({
    header:"Overview",
    stats:[],
    error:false,
    isLoaded:false,
    items:[]
  })

  useEffect(() => {
    setState({
      ...state,
      isLoaded:false
    })
    fetch(revisedURL+"api/rest/tmnt_facility/"+props.feature)
      .then(res=>res.json())
      .then(result=>{
        console.log("Fetch Results: ",result)
        setState({
          ...state,
          isLoaded:true,
          error:false,
          header:"Overview",
          items:{...result},
          stats:statsDict.overview.fields
        })
      })
      .catch(err=>{
        console.log("TMNT fetch failed: ",err)
        setState({
          ...state,
          error:true
        })
      })
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
    if(state.error){
      return <div>Something went wrong on our end.</div>
    }else if(!state.isLoaded){
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

  function _renderBMPForm() {
    if(state.error){
      return <div>Something went wrong on our end.</div>
    }else if(!state.isLoaded){
      return <div>Loading...</div>
    }else{
      return (
          <BMPForm fields={state.items}></BMPForm>
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
    <div>
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
            : _renderBMPForm()
          : null}
      </div>
    </div>
  );
}



export default BMPStatWindow;
