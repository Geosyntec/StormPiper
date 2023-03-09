import DeckGL from "@deck.gl/react";
import {FlyToInterpolator} from "@deck.gl/core"
import StaticMap from "react-map-gl";
import getTooltipContents from "./tooltip.jsx";
import { useLocation } from "react-router-dom";
import { useState,useEffect } from "react";
import { useCallback } from "react";
import debounce from "lodash.debounce"

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
  const baseLayerStyles = [
    {
      styleURL:"mapbox://styles/mapbox/streets-v12"
    },
    {
      styleURL:"mapbox://styles/mapbox/satellite-streets-v12"
    }
  ]
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
          if (zoomFeature && zoomFeature.length > 0) {
            setViewState({
              ...viewState,
              longitude: zoomFeature[0].geometry.coordinates[0],
              latitude: zoomFeature[0].geometry.coordinates[1],
              zoom: currentZoom,
              transitionDuration:1000,
              transitionInterpolator: new FlyToInterpolator()
            });
          }
        }, 500);
    }
  }

  const debouncedSetZoom = useCallback(
    debounce((state)=>setCurrentZoom(state.viewState.zoom), 300)
  , []);


  return (
    <DeckGL
      initialViewState={viewState}
      controller={true}
      layers={props.layers}
      onClick={props.onClick}
      onViewStateChange={(state)=>{
        debouncedSetZoom(state)
      }}
      getTooltip={(object) => {
        let width = 0
        let height = 0
        if(object.viewport){
          ({width, height} = object.viewport)
        }
        let closeToEdge = object.y > height *0.8 || object.x > width*0.85
        if(object?.object){console.log('Selected Object',object)}
        return object.object && !closeToEdge && {
          html: getTooltipContents(object.object, object?.layer?.id,object?.layer?.props?.label),
          style:{
            borderRadius:'6px',
            maxWidth:'175px'
          }
        };
      }}
      style={props.style}
    >
      <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} mapStyle={baseLayerStyles[props.baseLayer].styleURL} />
    </DeckGL>
  );
}



export default DeckGLMap;
