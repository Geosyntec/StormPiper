import React, {Suspense, useEffect, useState, useRef } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { layerDict } from "./assets/geojson/coreLayers";
import LayerSelector from "./components/layerSelector";
// import DeckGLMap from "./components/map";
import ProminentAppBar from "./components/topMenu";
import BMPStatWindow from "./components/bmpStatWindow";
import AuthProvider from "./components/authProvider"
import { Card, CardActions, CardContent, Typography, Button,Box} from "@material-ui/core";
import HomeRoundedIcon from "@material-ui/icons/HomeRounded"
import InfoRoundedIcon from "@material-ui/icons/InfoRounded"
import GridOnRoundedIcon from "@material-ui/icons/GridOnRounded"
import ScatterPlotRoundedIcon from "@material-ui/icons/ScatterPlotRounded"
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import "./App.css";

const DeckGLMap = React.lazy(()=>import("./components/map"))
const ResultsTable = React.lazy(()=>import("./components/resultsTable"))

function App() {
  let firstRender = useRef(true)
  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed
  let params = useParams();
  let navigate = useNavigate()
  const [userEmail,setUserEmail] = useState(null)
  const [prjStatDisplayState, setprjStatDisplayState] = useState(params?.id?true:false); // when true, project stats panel is displayed
  const [resultsDisplayState,setResultsDisplayState] = useState(false) //when true, results table is displayed
  const [verificationDisplayState,setVerificationDisplayState] = useState(false)//when true, tell the user that they need to verify their email
  const [focusFeature, setFocusFeature] = useState(params?.id || null);
  const [isDirty,setIsDirty] = useState({is_dirty:false,last_updated:Date.now()})
  const [baseLayer,setBaseLayer] = useState(0)
  const [activeLayers, setActiveLayers] = useState(() => {
    var res = {};
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if (!layerGroup.length) {
        const nestedLayerGroup = layerDict[category];
        Object.keys(nestedLayerGroup).map((nestedCategory) => {
          const layerGroup = nestedLayerGroup[nestedCategory];
          for (const layer in layerGroup) {
            const layerID = layerGroup[layer].props?.id;

            res[layerID] = layerGroup[layer].props?.onByDefault||false;
          }
          return false;
        });
      } else {
        for (const layer in layerGroup) {
          const layerID = layerGroup[layer].props?.id;
          res[layerID] = layerGroup[layer].props?.onByDefault||false;
        }
      }
      return false;
    });
    return res;
  });


  function _fetchIsDirty(){
    // console.log("Checking isDirty")
    fetch("/api/rest/results/is_dirty")
    .then((res) => {
      return res.json();
    })
    .then((res) => {
      console.log("Parsed is_dirty results: ",res)
      setIsDirty(res||null)
      // setDBLastUpdated(res.last_updated||null)
    })
  };

  useEffect(()=>{
    //Only perform these operations on initial render
    //Notify user if they haven't verified email
    fetch("/api/rest/users/me")
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        setUserEmail(res.email)
        if(!res['is_verified']){
          setVerificationDisplayState(true)
        }
      });
      //Set up is_dirty polling request to check when new results need to be calculated
      _fetchIsDirty()
      setInterval(_fetchIsDirty,10000)
  },[])

  const topMenuButtons={
    // home:{
    //   label:"Home",
    //   icon:<HomeRoundedIcon/>,
    //   clickHandler:null
    // },
    project:{
      label:"Evaluate Project",
      icon:<GridOnRoundedIcon/>,
      clickHandler:_toggleSetResultsDisplayState
    },
    // watershed:{
    //   label:"Evaluate Watershed",
    //   icon:<GridOnRoundedIcon/>,
    //   clickHandler:null
    // },
    // about:{
    //   label:"About",
    //   icon:<InfoRoundedIcon/>,
    //   clickHandler:null
    // }
  }


  // if(focusFeature!=params?.id){
  //   setFocusFeature(params.id)
  // }


  function _toggleLayer(layerName, updateFunction = setActiveLayers) {
    var currentActiveLayers = { ...activeLayers };
    currentActiveLayers[layerName] = !currentActiveLayers[layerName];
    console.log('Current Active Layers:',currentActiveLayers)
    updateFunction(currentActiveLayers);
  }

  function _renderLayers(layerDict, visState, isFirstRender,layersToRender = []) {
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if (layerGroup.length) {
        Object.keys(layerGroup).map((id) => {
          let { layer: Layer, props, getData } = layerGroup[id];
          if (getData && !props.data) {
            props.data = getData();
          }

          if (visState[props.id]||(firstRender.current && props.onByDefault)) {
            props = _injectLayerAccessors(props)
            layersToRender.push(new Layer(props));
          }
          return false;
        });
      } else {
        layersToRender = _renderLayers(layerGroup, visState, isFirstRender,layersToRender);
      }
      return false;
    });
    // console.log('Layers to Render:',layersToRender)
    firstRender.current = false
    return layersToRender;
  }

  function _togglelyrSelectDisplayState() {
    setlyrSelectDisplayState(!lyrSelectDisplayState);
  }
  function _toggleSetResultsDisplayState() {
    setResultsDisplayState(!resultsDisplayState);
  }
  function _getResultsDisplayState() {return resultsDisplayState};
  function _toggleprjStatDisplayState() {
    if(prjStatDisplayState){
      console.log('Clearing Focused Feature')
      setFocusFeature(null)
      navigate("/app/map")
    }
    setprjStatDisplayState(!prjStatDisplayState);
  }

  function _lyrClickHandlers(objInfo) {
    console.log("Top level map click: ",objInfo)
    if (objInfo?.layer?.id === "activeSWFacility") {
      if (!prjStatDisplayState) {
        //users can click on another facility without hiding the panel
        _toggleprjStatDisplayState();
      }
      setFocusFeature(objInfo.object.properties.altid);
      navigate("/app/map/tmnt/"+objInfo.object.properties.altid)
    }
  }

  function _injectLayerAccessors(props){
      props.getFillColor = (d)=>{
        return d.properties.altid===focusFeature? props.highlightColor||[52,222,235]:props.defaultFillColor||[70, 170, 21, 200]
      }
      props.updateTriggers = {
        getFillColor:[focusFeature||null]
      }
    return props
  }

  function _sendVerificationEmail(){
    fetch("/auth/request-verify-token",{
      method:"POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body:JSON.stringify({"email":userEmail})
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        console.log("Resend request result: ",res)
        setVerificationDisplayState(false)
      });
  }
  return (
    <AuthProvider>
      <div className="App">
        <ProminentAppBar buttons={topMenuButtons}></ProminentAppBar>
        <div>
          <Suspense fallback={<div>Loading Map...</div>}>
            <DeckGLMap
              id="main-map"
              layers={_renderLayers(layerDict,activeLayers,firstRender)}
              baseLayer={baseLayer}
              onClick={_lyrClickHandlers.bind(this)}
              currentFeature={focusFeature}
            ></DeckGLMap>
          </Suspense>
        </div>
        <Card
          id={lyrSelectDisplayState ? "control-panel" : "control-panel-hidden"}
        >
          <CardContent className={lyrSelectDisplayState ? "" : "zero-padding"}>
            <LayerSelector
              layerDict={layerDict}
              activeLayers={activeLayers}
              _onToggleLayer={_toggleLayer}
              displayStatus={lyrSelectDisplayState}
              displayController={_togglelyrSelectDisplayState}
            ></LayerSelector>

          </CardContent>
        </Card>
        <Box id="base-layer-control-panel">
          <Tabs value={baseLayer} onChange={(e,n)=>{setBaseLayer(n)}} indicatorColor="primary" textColor="primary">
            <Tab className="base-layer-tab" label="Streets" />
            <Tab className="base-layer-tab" label="Satellite"/>
          </Tabs>
        </Box>
        <Card
          id={prjStatDisplayState ? "prj-stat-panel" : "prj-stat-panel-hidden"}
        >
          <CardContent className={prjStatDisplayState ? "" : "zero-padding"}>
            <BMPStatWindow
              displayStatus={prjStatDisplayState}
              displayController={_toggleprjStatDisplayState}
              feature={focusFeature}
              isDirty = {isDirty}
            ></BMPStatWindow>
          </CardContent>
        </Card>
        <Card
          id={verificationDisplayState ? "verification-panel" : "verification-panel-hidden"}
          >
          <CardContent className={verificationDisplayState ? "" : "zero-padding"}>
            <Typography variant="subtitle1">
                Your email has not been verified
            </Typography>
            <Typography variant="subtitle2">
                If you have recently registered, please check your email for your verification link
            </Typography>
            <Typography variant="subtitle2">
                If not, click <a href="javascript:;" onClick={_sendVerificationEmail}>here </a> to resend the verification email
            </Typography>
            <CardActions>
              <Button onClick={()=>setVerificationDisplayState(false)}>Close</Button>
            </CardActions>
          </CardContent>
        </Card>
        <Card
          id={resultsDisplayState ? "results-panel" : "results-panel-hidden"}
        >
          <CardContent className={resultsDisplayState ? "" : "zero-padding"}>
            <Suspense fallback={<div>Loading Table...</div>}>
              <ResultsTable
                nodes="all"
                currentNode={focusFeature}
                displayController={_toggleSetResultsDisplayState}
                displayState={_getResultsDisplayState()}
              ></ResultsTable>
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </AuthProvider>
  );
}

export default App;
