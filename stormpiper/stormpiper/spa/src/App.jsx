import React, {Suspense, useState } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { layerDict } from "./assets/geojson/coreLayers";
import LayerSelector from "./components/layerSelector";
// import DeckGLMap from "./components/map";
import ProminentAppBar from "./components/topMenu";
import BMPStatWindow from "./components/bmpStatWindow";
import AuthProvider from "./components/authProvider"
import "./App.css";

const DeckGLMap = React.lazy(()=>import("./components/map"))

function App() {
  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed
  let params = useParams();
  let navigate = useNavigate()
  const [prjStatDisplayState, setprjStatDisplayState] = useState(params?.id?true:false); // when true, project stats panel is displayed
  const [focusFeature, setFocusFeature] = useState(params?.id || null);
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


  if(focusFeature!=params?.id){
    setFocusFeature(params.id)
  }


  function _toggleLayer(layerName, updateFunction = setActiveLayers) {
    var currentActiveLayers = { ...activeLayers };
    currentActiveLayers[layerName] = !currentActiveLayers[layerName];
    // console.log('Current Active Layers:',currentActiveLayers)
    updateFunction(currentActiveLayers);
  }

  function _renderLayers(layerDict, visState, layersToRender = []) {
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if (layerGroup.length) {
        Object.keys(layerGroup).map((id) => {
          let { layer: Layer, props, getData } = layerGroup[id];
          if (getData && !props.data) {
            props.data = getData();
          }

          if (visState[props.id]||props.onByDefault) {
            props = _injectLayerAccessors(props)
            layersToRender.push(new Layer(props));
          }
          return false;
        });
      } else {
        layersToRender = _renderLayers(layerGroup, visState, layersToRender);
      }
      return false;
    });
    // console.log('Layers to Render:',layersToRender)
    return layersToRender;
  }

  function _togglelyrSelectDisplayState() {
    setlyrSelectDisplayState(!lyrSelectDisplayState);
  }
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
        // console.log("checking feature: ",d)
        return d.properties.altid===focusFeature? [52,222,235]:[160, 160, 180, 200]
      }
      props.updateTriggers = {
        getFillColor:[focusFeature||null]
      }
    return props
  }

  return (
    <AuthProvider>
      <div className="App">
        <ProminentAppBar></ProminentAppBar>
        <div>
          <Suspense fallback={<div>Loading Map...</div>}>
            <DeckGLMap
              id="main-map"
              layers={_renderLayers(layerDict, activeLayers)}
              onClick={_lyrClickHandlers.bind(this)}
              currentFeature={focusFeature}
            ></DeckGLMap>
          </Suspense>
        </div>
        <div
          id={lyrSelectDisplayState ? "control-panel" : "control-panel-hidden"}
        >
          <div style={{ textAlign: "left", padding: "5px 0 5px" }}>
            <LayerSelector
              layerDict={layerDict}
              activeLayers={activeLayers}
              _onToggleLayer={_toggleLayer}
              displayStatus={lyrSelectDisplayState}
              displayController={_togglelyrSelectDisplayState}
            ></LayerSelector>
          </div>
        </div>
        <div
          id={prjStatDisplayState ? "prj-stat-panel" : "prj-stat-panel-hidden"}
        >
          <BMPStatWindow
            displayStatus={prjStatDisplayState}
            displayController={_toggleprjStatDisplayState}
            feature={focusFeature}
          ></BMPStatWindow>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
