import React from "react";
import { useEffect, useState } from "react";
import { makeStyles } from '@material-ui/core/styles';
import { Typography,Paper } from "@material-ui/core";
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
  // tributaryArea:{
  //   label:"Tributary Area",
  //   fields:["tributary_area_tc_min"],
  // },
  // lifeCycleCosts:{
  //   label:"Life-Cycle Costs",
  //   fields:[],
  // },
  performanceSummary:{
    label:"Performance Summary",
    fields:["runoff_volume_cuft_inflow","runoff_volume_cuft_treated","runoff_volume_cuft_retained","runoff_volume_cuft_captured","runoff_volume_cuft_bypassed"],
  },
}

const fieldLabelDict:{[key:string]:string} = {
  altid: "ID",
  facilitytype: "Facility Type",
  design_storm_depth_inches: "Design Storm Depth (in)",
  tributary_area_tc_min: "Tributary Area Tc (min)",
  total_volume_cuft: "Total Volume (cubic ft)",
  retention_volume_cuft: "Retention Volume (cubic ft)",
  runoff_volume_cuft_inflow:"Inflow Runoff (cubic ft)",
  runoff_volume_cuft_retained:"Retained Runoff (cubic ft)",
  runoff_volume_cuft_treated:"Treated Runoff (cubic ft)",
  runoff_volume_cuft_captured:"Captured Runoff (cubic ft)",
  runoff_volume_cuft_bypassed:"Bypassed Runoff (cubic ft)"
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
  results:{[k:string]:string|number|undefined}[]
}

type specState={
  context:any,
  facilitySpec:any
}

const useStyles = makeStyles((theme) => ({
  panelTitle:{
    color:"white",
  },
  formHeader:{
    background:theme.palette.primary.main,
    margin:"0px",
    justifyContent:"center",
    display:"flex",
    borderRadius:"5px"
  },
  activeHeader:{
    fontWeight:"bold",
    padding:"10px 5px",
    margin:"0",
    background:theme.palette.grey[400],
    borderRadius:"5px"
  }
}));




function BMPStatWindow(props:statWindowProps) {

  const classes = useStyles()

  const [state,setState] = useState<bmpPanelState>({
    header:"Overview",
    stats:[],
    error:false,
    isLoaded:false,
    items:[],
    results:[]
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
    let resources = ["/openapi.json","/api/rest/reference/context"]

    Promise.all(resources.map(url=>fetch(url).then(res=>res.json())))
      .then(resArray=>{
        setSpecs({
          facilitySpec:resArray[0].components.schemas,
          context:resArray[1].api_recognize.treatment_facility.facility_type
        })
      })


  },[])

  // useEffect(()=>{
  //   console.log("New Loading State: ",loadingState)
  // },[loadingState])
  // useEffect(()=>{
  //   console.log("New State: ",state)
  // },[state])

  useEffect(() => {

    if (!props?.feature) return

    let tmnt_results = ["/api/rest/results/"+props.feature,"/api/rest/tmnt_facility/"+props.feature]

    setLoadingState(false)
    Promise.all(tmnt_results.map(url=>fetch(url).then(res=>res.json())))
    .then(resArray=>{
      console.log("Fetched all resources; ",resArray)
      setState({
        ...state,
        error:false,
        header:"Overview",
        items:{
          ...resArray[1] //response from api/rest/tmnt_facility
        },
        results:{
          ...resArray[0][1]//response from api/rest/results
        },
        stats:statsDict.overview.fields,
      })
      setFacilityType(resArray[1].facility_type)
      setLoadingState(true)
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
    <p key={props.label} onClick={()=>{props.clickHandler(props.label)}} className={props.label===state.header?classes.activeHeader:undefined}>{props.label}</p>
    )
  }

  function switchStats(headerName:string){
    setState(()=>{
      let stats:any[] = []
      let results:any[] = []

      // if(headerName!="Performance Summary"){
        const fields:string[]|undefined = Object.values(statsDict)
          .filter((group) => group.label === headerName)
          .map((f) => f.fields)[0];
        if(state.items && fields){
          stats =  Object.keys(state.items).filter((item:string)=>{
            return fields.includes(item)
          })
          results = Object.keys(state.results).filter((item:string)=>{
            return fields.includes(item)
          })
          stats.push(...results)
          console.log("Displaying stats: ",stats)
        }
      // }
      // else{
      //   stats = state.results[1] || {}
      // }
      return {
        ...state,
        header:headerName,
        stats:stats
      }
    })
  }

  function _renderStats() {
    if(!props.feature){
      return <Paper>Select a BMP Feature</Paper>
    }
    if(state.error){
      return <div>Something went wrong on our end.</div>
    }else if(!loadingState){
      console.log("Displaying Loading Screen, loadingState = ",loadingState)
      return <div>Loading...</div>
    }else{
      let statsList = Object.values(state.stats).map((stat:string)=>{
        if(stat){
          let renderedStat = state.items[stat] || state.results[stat]
          if (typeof renderedStat ==='number'){
            renderedStat = new Intl.NumberFormat('en-US',{maximumSignificantDigits:6}).format(renderedStat)
          }
          return (
            <div className="stat">
              <p><strong>{fieldLabelDict[stat]}:&#8195;</strong></p>
              <p>{renderedStat}</p>
            </div>
          );
        }
      })
      console.log("Stats list: ",statsList)
      return (
          <div>
            {statsList.length>0?statsList:(<p><strong>Data Unavailable</strong></p>)}
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
      console.log('Loading form with fetched values:',state.items)
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

  return props.displayStatus ? (
    <div>
      <div className={classes.formHeader}>
        <div className="title-container">
          <h4 className={classes.panelTitle}>{props.feature} Facility Details</h4>
        </div>
        <div className="cancel-container">
          <h4 id="cancel-icon" onClick={props.displayController}>
            &#10005;
          </h4>
        </div>
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
  ) : (
    <div id="bmp-panel-icon">
      <ListAltRounded onClick={props.displayController} />
    </div>
  );
}



export default BMPStatWindow;
