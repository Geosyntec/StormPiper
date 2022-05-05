import DeckGL from "@deck.gl/react";
import StaticMap from "react-map-gl";
import getTooltipContents from "./tooltip.js";

// Viewport settings
const INITIAL_VIEW_STATE = {
  longitude: -122.4,
  latitude: 47.2494237,
  zoom: 11,
  pitch: 0,
  bearing: 0,
};

const MAPBOX_ACCESS_TOKEN =
  "pk.eyJ1IjoiYWNhbmctZ3MiLCJhIjoiY2tzcnp3eHozMGV1ODJxbGJ6aDlsa3lneCJ9.1j73ov85i7lJOy9pdDTY-A";

// DeckGL react component
function DeckGLMap(props) {
  return (
    <DeckGL
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      layers={props.layers}
      getTooltip={(object) => {
        // if(object?.object){console.log('Selected Object',object)}
        return object.object && {
          html: getTooltipContents(object.object, object?.layer?.id),
        };
      }}
    >
      <StaticMap mapboxApiAccessToken={MAPBOX_ACCESS_TOKEN} />
    </DeckGL>
  );
}

export default DeckGLMap;
