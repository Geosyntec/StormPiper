import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import LayersRoundedIcon from "@material-ui/icons/LayersRounded"
import { useState } from "react";
import "./layerSelector.css"


const useStyles = makeStyles((theme) => ({

  layerTogglerTitle:{
    textAlign: "center",
  },

  nestedLayer: {
    padding:"2px",
    marginLeft: "20px",
  },

  nestedLayerTitle: {
    padding:"2px",
    marginLeft: "20px",
    textDecoration: "underline",
  },
  mainLayerTitle: {
    padding:"5px",
    marginLeft: "5px",
  },
  mainLayer: {
    padding:"5px",
    marginLeft: "5px",
  },

  testButtonClicked:{
    transitionProperty:"width",
    transitionDuration:"2s",
    color:"red",
    width: "100px",
  },

  testButtonUnClicked:{
    transitionProperty:"width",
    transitionDuration:"2s",
    color:"black",
    width:"50px",
  },

  controlPanel:{
    position: "fixed",
    zIndex:"9",
    top: "20%",
    right:"0%",
    overflowX:"hidden",
    overflowY:"auto",
    height:"75%",
    width:"100%",
    background:"rgba(255,255,255,0.8)"
  }
}));

function LayerSelector(props) {
  const classes = useStyles()

  return (
    <div className="layer-selector">
      {
        props.displayStatus
          ?<div id = "layer-toggler-title">
            <Typography variant = "h4"  className = {classes.layerTogglerTitle}>Layers</Typography>
            <div className="cancel-container">
              <h4 id="cancel-icon" onClick={props.displayController}>
                &#10005;
              </h4>
            </div>
           </div>

          :<div id = "layer-toggler-title-hidden" ><LayersRoundedIcon onClick = {props.displayController}/></div>
      }

      {_renderCategories(
        props.layerDict,
        props._onToggleLayer,
        props.activeLayers,
        "mainLayer"
      )}
    </div>
  );
}

function _renderCategories(
  layerDict,
  _onToggleLayer,
  activeLayers,
  layerLevel
) {
  const classes = useStyles();

  return Object.keys(layerDict).map((layerCategory) => {
    const layers = layerDict[layerCategory];
    if (!layers.length) {
      return (
        <div>
          <Typography variant="h6" className={classes.mainLayerTitle}>
            {layerCategory}
          </Typography>
          {/* <h4 className = {classes[layerLevel]}>{layerCategory}</h4> */}
          {_renderCategories(
            layers,
            _onToggleLayer,
            activeLayers,
            "nestedLayer"
          )}
        </div>
      );
    } else {
      return (
        <div>
          <Typography variant="subtitle1" className={classes.nestedLayerTitle}>
            {layerCategory}
          </Typography>

          {/* <h5 className={classes[layerLevel]}>{layerCategory}</h5> */}
          {Object.values(layers).map((layer) => {
            // console.log("Rendering ", layer.props)
            return (
              <div id={layer.props.id}>
                <LayerToggler
                  layerID={layer.props.id}
                  layerLabel={layer.props.label}
                  activeLayers={activeLayers}
                  _toggleLayer={_onToggleLayer}
                  className={layerLevel}
                ></LayerToggler>
              </div>
            );
          })}
        </div>
      );
    }
  });
}

function LayerToggler(props) {
  const classes = useStyles();

  return (
    <div className={classes[props.className]}>
      <div className="checkbox">
        <input
          type="checkbox"
          id={props.layerID}
          checked={props.activeLayers[props.layerID]}
          onChange={() => props._toggleLayer(props.layerID)}
        />
        <label htmlFor={props.layerLabel}>
          <span>{props.layerLabel}</span>
        </label>
      </div>
    </div>
  );
}



export default LayerSelector;
