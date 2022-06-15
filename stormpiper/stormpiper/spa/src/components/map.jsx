import DeckGL from "@deck.gl/react";
import StaticMap from "react-map-gl";
import getTooltipContents from "./tooltip.jsx";
import { useLocation } from "react-router-dom";
import { useState } from "react";


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

  console.log("Rendering map; current path: ",loc)
  console.log("Current Feature: ",props.currentFeature)

  function checkFeature(){
    if(props.currentFeature){
      // let baseURL = import.meta.env.BASE_URL.toString().split("/");
      // baseURL.pop();
      // baseURL.pop();
      // console.log("Base URL popped: ", baseURL);
      // const revisedURL = baseURL.length > 1 ? baseURL.join("/") : "/";
  
      // fetch(
      //   revisedURL + "api/rest/tmnt_facility/" + props.currentFeature + "?f='geojson'"
      // )
      //   .then((res) => res.json())
      //   .then((result) => {
      //     console.log("Geojson Fetch Results: ", result);
      //     console.log("Layers: ", props.layers)
      //   })
      //   .catch((err) => {
      //     console.log("TMNT fetch failed: ", err);
      //   });
      setTimeout(()=>{
        let zoomFeature
        props.layers?.filter(layer=>{
          if(layer.id==="activeSWFacility" && layer.state){
            // console.log("BMP Layer Found")
            // Object.keys(layer).map(val=>{
    
            //   console.log("Field Found: ",val,"-",layer[val])
            // })
            const feats = layer.state.layerProps.points.data
            zoomFeature=feats.filter(feat=>{
              const ID=feat.__source.object.properties.altid
              return ID===props.currentFeature
            })
            console.log("Target Feature Found: ",zoomFeature)
          }
        })
        if(zoomFeature){
          setViewState({
            ...viewState,
            longitude:zoomFeature[0].geometry.coordinates[0],
            latitude:zoomFeature[0].geometry.coordinates[1],
            zoom:14
          })
        }
      },500)
    }
  }

  return (
    <DeckGL
      initialViewState={viewState}
      controller={true}
      layers={props.layers}
      onClick={props.onClick}
      onLoad={()=>checkFeature(props)}
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
