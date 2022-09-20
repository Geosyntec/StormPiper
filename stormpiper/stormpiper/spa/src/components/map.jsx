import DeckGL from "@deck.gl/react";
import {FlyToInterpolator} from "deck.gl"
import StaticMap from "react-map-gl";
// import getTooltipContents from "./tooltip.jsx";
import { useLocation } from "react-router-dom";
import { useState,useEffect } from "react";


// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 47.2494237,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};



const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYWNhbmctZ3MiLCJhIjoiY2w0NGl1YWwyMDE0YzNpb2hhbzN3dzcxdiJ9.3V1BdATyCSerixms7Er3Rw";


// DeckGL react component
function DeckGLMap(props) {
  const loc = useLocation()
  const [viewState,setViewState] = useState(INITIAL_VIEW_STATE)
  const [currentZoom,setCurrentZoom] = useState(11)
  console.log("Current Feature: ",props.currentFeature)

  useEffect(()=>{
    zoomToCurrentFeature()
  },[loc])

  function zoomToCurrentFeature(){
    if(props.currentFeature){
        setTimeout(() => {
          let zoomFeature;

          props.layers?.filter((layer) => {
            if (layer.id === "activeSWFacility" && layer.state) {
              const feats = layer.state.layerProps.points.data;
              zoomFeature = feats.filter((feat) => {
                const ID = feat.__source.object.properties.altid;
                return ID === props.currentFeature;
              });
              console.log("Target Feature Found: ", zoomFeature);
            }
          });
          if (zoomFeature.length > 0) {
            setViewState({
              ...viewState,
              longitude: zoomFeature[0].geometry.coordinates[0],
              latitude: zoomFeature[0].geometry.coordinates[1],
              zoom: Math.max(currentZoom,14),
              transitionDuration:1500,
              transitionInterpolator: new FlyToInterpolator()
            });
          }
        }, 500);
    }
  }

  return (
    <DeckGL
      initialViewState={viewState}
      controller={true}
      layers={props.layers}
      onClick={props.onClick}
      // onViewStateChange={(state)=>{
      //   console.log("Viewstate:",state)
      //   setCurrentZoom(state.viewState.zoom)
      // }}
      // onload={()=>checkFeature(props)}
      // getTooltip={(object) => {
      //   // if(object?.object){console.log('Selected Object',object)}
      //   return object.object && {
      //     html: getTooltipContents(object.object, object?.layer?.id,object?.layer?.props?.label),
      //   };
      // }}
    >
      <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  );
}



export default DeckGLMap;
