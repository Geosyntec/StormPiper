import { useEffect, useState } from "react";
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

const fieldLabelDict = {
  altid: "ID",
  facilitytype: "Facility Type",
  design_storm_depth_inches: "Design Storm Depth (in)",
  tributary_area_tc_min: "Tributary Area Tc (min)",
  total_volume_cuft: "Total Volume (cubic ft)",
  retention_volume_cuft: "Retention Volume (cubic ft)",
};



function BMPStatWindow(props) {

  const [state,setState] = useState({
    header:"Overview",
    stats:[],
    error:null,
    isLoaded:false,
    items:[]
  })

  useEffect(() => {
    setState({
      ...state,
      isLoaded:false
    })
    setTimeout(() => {
      let mockItems = {
        altid: props?.feature,
        facilitytype: "Swale",
        design_storm_depth_inches: 2,
        tributary_area_tc_min: 10,
        total_volume_cuft: 500,
        retention_volume_cuft: 500,
      }
      setState({
        ...state,
        isLoaded:true,
        header:"Overview",
        items:mockItems,
        stats:statsDict.overview.fields
      })
    }, 1000);
  }, [props?.feature]);
    // Note: the empty deps array [] means
    // this useEffect will run once
    // similar to componentDidMount()
    // useEffect(() => {
    //   fetch("https://api.example.com/items")
    //     .then((res) => res.json())
    //     .then(
    //       (result) => {
    //         setIsLoaded(true);
    //         setItems(result);
    //       },
    //       // Note: it's important to handle errors here
    //       // instead of a catch() block so that we don't swallow
    //       // exceptions from actual bugs in components.
    //       (error) => {
    //         setIsLoaded(true);
    //         setError(error);
    //       }
    //     );
    // }, []);

  function ActiveHeader(props){
    return(
    <p key={props.label} onClick={()=>{props.clickHandler(props.label)}} className={props.label===state.header?"active":null}>{props.label}</p>
    )
  }

  function switchStats(headerName){
    setState(()=>{
      let stats = []
      const fields = Object.values(statsDict)
        .filter((group) => group.label === headerName)
        .map((f) => f.fields)[0];
      if(state.items && fields){
        stats =  Object.keys(state.items).filter(item=>{
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
      let headerList = Object.values(statsDict).map((category,index) => {
        return (
          <ActiveHeader
            key={index}
            label={category.label}
            clickHandler={() => switchStats(category.label)}
          ></ActiveHeader>
        );
      });
      console.log("Current Stats are: ",state.stats)
      console.log("Current Items area: ", state.items)
      let statsList = Object.values(state.stats).map((stat)=>{
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
        <div className="stats-table">
          <div className="table-header">
            {headerList}
          </div>
          <div>
            {statsList}
          </div>
        </div>
      );
    }

    
  }

  return (
    <div>
      <div className="panel-header">
        <div className="title-container">
          <h4 id="panel-title">BMP Stat Table</h4>
        </div>
        <div className="cancel-container">
          <h4 id="cancel-icon" onClick={props.displayController}>&#10005;</h4>
        </div>
      </div>
      {props?_renderStats():null}
    </div>
  );
}



export default BMPStatWindow;
