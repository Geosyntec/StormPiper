import React, {Suspense, useEffect, useState, useRef } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { layerDict } from "../assets/geojson/subbasinLayer";
import LayerSelector from "./layerSelector";
import { Card, CardActions, CardContent, Typography, Button,Box,makeStyles} from "@material-ui/core";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import "./Prioritization.css";

const DeckGLMap = React.lazy(()=>import("./map"))

const useStyles = makeStyles((theme) => ({
    mainButton: {
      margin:"1rem",
    },
  }));

function Prioritization() {
  let firstRender = useRef(true)
  const classes = useStyles()
  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed
  const [subbasinScores,setSubbasinScores] = useState({})
  let params = useParams();
  let navigate = useNavigate()
  const [focusFeature, setFocusFeature] = useState(params?.id || null);
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





  function _injectLayerAccessors(props){
      props.getFillColor = (d)=>{
        return d.properties.altid===focusFeature? props.highlightColor||[52,222,235]:props.defaultFillColor||[70, 170, 21, 200]
      }
      props.updateTriggers = {
        getFillColor:[focusFeature||null]
      }

    return props
  }

  async function _handleSubmit(data){
    if(isSimple && !data['facility_type'].match('_simple')){
      console.log("Appending simple")
      data['facility_type'] = data['facility_type']+'_simple'
    }

    console.log("Submitting Patch Request: ",data)
    const response = await fetch('/api/rest/tmnt_attr/'+props.values.node_id, {
        credentials: "same-origin",
        headers:{
            "accept":"application/json",
            "Content-type":"application/json"
        },
        method: "PATCH",
        body: JSON.stringify(data),
      })
      .then(resp=>{
        if(resp.status===200){
          setResultSuccess(true)
        }else if(resp.status===422){
          setResultError(true)
        }
        return resp.json()
      })
      .then((r)=>{
        //assume that only error responses have a detail object
        if(r.detail){
          setErrorMsg(r.detail)
        }
      }).catch(err=>{
        console.log("Error patching tmnt:")
        console.log(err)
      })
    return response
}



  return (
      <div className="prioritization">
        <div>
          <Suspense fallback={<div>Loading Map...</div>}>
            <DeckGLMap
              id="main-map"
              layers={_renderLayers(layerDict,activeLayers,firstRender)}
              baseLayer={baseLayer}
              currentFeature={focusFeature}
              style={{
                top:"12%",
                left:"50%",
                width:"35%",
                height:"50%",
                border: "2 px solid grey",
              }}
            ></DeckGLMap>
          </Suspense>
        </div>

        <Card
          id={"priority-info"}
        >
          <CardContent className={lyrSelectDisplayState ? "" : "zero-padding"}>
            <Box>Stuff</Box>
            <Button className={classes.mainButton} color="primary" variant="contained" type = "submit">Submit</Button>
          </CardContent>
        </Card>

        <Box id="base-layer-control-panel">
          <Tabs value={baseLayer} onChange={(e,n)=>{setBaseLayer(n)}} indicatorColor="primary" textColor="primary">
            <Tab className="base-layer-tab" label="Streets" />
            <Tab className="base-layer-tab" label="Satellite"/>
          </Tabs>
        </Box>

      </div>
  );
}

export default Prioritization;
