import { useState } from "react";
import { layerDict } from "./assets/geojson/coreLayers";
import LayerSelector from "./components/layerSelector";
import DeckGLMap from "./components/map";
import ProminentAppBar from "./components/topMenu";
import BMPStatWindow from "./components/bmpStatWindow";
import "./App.css";

function App() {
  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed
  const [prjStatDisplayState, setprjStatDisplayState] = useState(false); // when true, project stats panel is displayed
  const [focusFeature, setFocusFeature] = useState(null);
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

            res[layerID] = false;
          }
          return false;
        });
      } else {
        for (const layer in layerGroup) {
          const layerID = layerGroup[layer].props?.id;
          res[layerID] = false;
        }
      }
      return false;
    });
    return res;
  });

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

          if (visState[props.id]) {
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
    if(prjStatDisplayState){ //note that state will not be updated immediately after setting it
      console.log('Clearing Focused Feature')
      setFocusFeature(null)
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
      setFocusFeature(objInfo);
    }
  }

  function _injectLayerAccessors(props){
      props.getFillColor = (d)=>{
        return d.id===focusFeature?.object?.id? [52,222,235]:[160, 160, 180, 200]
      }
      props.updateTriggers = {
        getFillColor:[focusFeature?focusFeature.object.id:null]
      }
    return props
  }

  return (
    <div className="App">
      <ProminentAppBar></ProminentAppBar>
      <div>
        <DeckGLMap
          layers={_renderLayers(layerDict, activeLayers)}
          onClick={_lyrClickHandlers.bind(this)}
        ></DeckGLMap>
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
        <div style={{ textAlign: "left", padding: "5px 0 5px" }}>
          <BMPStatWindow
            displayStatus={prjStatDisplayState}
            displayController={_toggleprjStatDisplayState}
            feature={focusFeature}
          ></BMPStatWindow>
        </div>
      </div>
    </div>
  );
}

export default App;
