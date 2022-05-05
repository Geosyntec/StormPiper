import { useState } from "react";
import { layerDict } from "./assets/geojson/coreLayers";
import LayerSelector from "./components/layerSelector"
import DeckGLMap from "./components/map";
import ProminentAppBar from "./components/topMenu";
import "./App.css";

function App() {

  const [activeLayers, setActiveLayers] = useState(()=>{
    var res = {}  
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if(!layerGroup.length){
        const nestedLayerGroup = layerDict[category]
        Object.keys(nestedLayerGroup).map((nestedCategory)=>{
          const layerGroup = nestedLayerGroup[nestedCategory];
          for(const layer in layerGroup){
            const layerID = layerGroup[layer].props?.id

            res[layerID] = false
          }
          return false
        })
      }else{
        for(const layer in layerGroup){
          const layerID = layerGroup[layer].props?.id
          res[layerID] = false
        }
      }
      return false;
    });
    return res
  });

  function _toggleLayer(layerName, updateFunction = setActiveLayers) {
    var currentActiveLayers = { ...activeLayers };
    currentActiveLayers[layerName] = !currentActiveLayers[layerName];
    console.log('Current Active Layers:',currentActiveLayers)
    updateFunction(currentActiveLayers);
  }

  function _renderLayers(layerDict, visState,layersToRender = []) {
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if(layerGroup.length){
        Object.keys(layerGroup).map((id) => {
          const { layer: Layer, props, getData } = layerGroup[id];
          if (getData && !props.data) {
            props.data = getData();
          }
  
          if (visState[props.id]) {
            layersToRender.push(new Layer(props));
          }
          return false;
        });
      }else{
        layersToRender = _renderLayers(layerGroup,visState,layersToRender)
      }
      return false;
    });
    console.log('Layers to Render:',layersToRender)
    return layersToRender;
  }

  const [displayState,setDisplayState] = useState(false) // when true, control panel is displayed

  function _toggleDisplayState(){
    setDisplayState(!displayState)
  }

  return (
    <div className="App">
      <ProminentAppBar></ProminentAppBar>
      <div>
        <DeckGLMap layers={_renderLayers(layerDict, activeLayers)}>
        </DeckGLMap>
      </div>
      <div id={displayState ? "control-panel" : "control-panel-hidden"}>
        <div style={{ textAlign: "left", padding: "5px 0 5px" }}>
          <LayerSelector
            layerDict = {layerDict}
            activeLayers = {activeLayers}
            _onToggleLayer = {_toggleLayer}
            displayStatus = {displayState}
            displayController = {_toggleDisplayState}
          ></LayerSelector>
        </div>
      </div>
    </div>
  );
}

export default App;
