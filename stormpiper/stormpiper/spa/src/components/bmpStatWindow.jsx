import { useState } from "react";
import "./bmpStatWindow.css";

const fieldDict = {
  activeSWMain: ["ALTID", "DIAMETER", "INSTALLDATE"],
  activeSWFacility: ["ALTID", "SUBBASIN", "FACILITYDETAIL", "MEDIATYPE"],
  default: ["OBJECTID"],
};



function BMPStatWindow(props) {
  const [currentHeader,setCurrentHeader] = useState(null)

  function ActiveHeader(props){
    return(
    <p onClick={props.styleController(props.label)} className={props.label===currentHeader?"active":null}>{props.label}</p>
    )
  }
  
  function _renderStats(props) {
    console.log("Rendering Stats:", props?.object);
    return (
      <div className = "stats-table">
        <div className = "table-header">
          {/* TODO: Abstract these headers into their own component */}
          <p onClick={()=>setCurrentHeader("Overview")} className={currentHeader==="Overview"?"active":null}>Overview</p>
          <p onClick={()=>setCurrentHeader("Design Parameters")} className={currentHeader==="Design Parameters"?"active":null}>Design Parameters</p>
          <p onClick={()=>setCurrentHeader("Tributary Area")} className={currentHeader==="Tributary Area"?"active":null}>Tributary Area</p>
          <p onClick={()=>setCurrentHeader("Life-Cycle Costs")} className={currentHeader==="Life-Cycle Costs"?"active":null}>Life-Cycle Costs</p>
          <p onClick={()=>setCurrentHeader("Performance Summary")} className={currentHeader==="Performance Summary"?"active":null}>Performance Summary</p>
          {/* <p onClick={setCurrentHeader("Design Parameters")} >Design Parameters</p>
          <p onClick={setCurrentHeader("Tributary Area")} >Tributary Area</p>
          <p onClick={setCurrentHeader("Life-Cycle Costs")} >Life-Cycle Costs</p>
          <p onClick={setCurrentHeader("Performance Summary")} >Performance Summary</p> */}
          {/* <ActiveHeader label="Overview" styleController={setCurrentHeader}></ActiveHeader>
          <ActiveHeader label="Design Parameters" styleController={setCurrentHeader}></ActiveHeader>
          <ActiveHeader label="Tributary Area" styleController={setCurrentHeader}></ActiveHeader>
          <ActiveHeader label="Life-Cycle Costs" styleController={setCurrentHeader}></ActiveHeader>
          <ActiveHeader label="Performance Summary" styleController={setCurrentHeader}></ActiveHeader> */}
        </div>
        <p>ID: {props?.object?.properties?.ALTID}</p>
        <p>Subbasin: {props?.object?.properties?.SUBBASIN}</p>
      </div>
    );
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
      {props?_renderStats(props?.feature):null}
    </div>
  );
}



export default BMPStatWindow;
