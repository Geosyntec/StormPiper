import React, {Suspense, useEffect, useState, useRef } from "react";
// import DeckGLMap from "./components/map";
import ProminentAppBar from "./components/topMenu";
import { useNavigate } from "react-router-dom";
import AuthProvider from "./components/authProvider"
import HomeRoundedIcon from "@material-ui/icons/HomeRounded"
import InfoRoundedIcon from "@material-ui/icons/InfoRounded"
import GridOnRoundedIcon from "@material-ui/icons/GridOnRounded"
import ScatterPlotRoundedIcon from "@material-ui/icons/ScatterPlotRounded"
import SystemExplorer from "./components/systemExplorer"
import Prioritization from "./components/Prioritization";
import Landing from "./components/Landing"

import "./App.css";


function App(props) {
  let navigate = useNavigate()

  const [resultsDisplayState,setResultsDisplayState] = useState(false) //when true, results table is displayed

  function _toggleSetResultsDisplayState() {
    setResultsDisplayState(!resultsDisplayState);
  }


  function _getViewComponent(){
    switch(props.viewComponent){
      case 'systemExplorer':
        return <SystemExplorer resultsDisplayState = {resultsDisplayState} resultsDisplayController={_toggleSetResultsDisplayState}/>
      case 'prioritization':
        return <Prioritization/>
      default:
        return <Landing/>
    }
  }

  const topMenuButtons={
    landing:{},
    systemExplorer:{
      home:{
        label:"Home",
        icon:<HomeRoundedIcon/>,
        clickHandler:()=>navigate('/app')
      },
      project:{
        label:"Evaluate Project",
        icon:<GridOnRoundedIcon/>,
        clickHandler:_toggleSetResultsDisplayState
      },
      watershed:{
        label:"Prioritize Watersheds",
        icon:<ScatterPlotRoundedIcon/>,
        clickHandler:()=>navigate('/app/prioritization')
      },
    },
    prioritization:{
      home:{
        label:"Home",
        icon:<HomeRoundedIcon/>,
        clickHandler:()=>navigate('/app')
      },
      about:{
          label:"About Prioritization",
          icon:<InfoRoundedIcon/>,
          clickHandler:null
        },

      project:{
        label:"Define Criteria Weights",
        icon:<GridOnRoundedIcon/>,
        clickHandler:null
      },
    }
  }

  return (
    <AuthProvider>
      <div className="App">
        <ProminentAppBar buttons={topMenuButtons[props.viewComponent]}></ProminentAppBar>
        {props && _getViewComponent()}
      </div>
    </AuthProvider>
  );
}

export default App;
