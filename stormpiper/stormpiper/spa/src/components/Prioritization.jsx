import React, {Suspense, useEffect, useState, useRef } from "react";
import { useParams,useNavigate } from "react-router-dom";
import { layerDict } from "../assets/geojson/subbasinLayer";
// import LayerSelector from "./layerSelector";
import { Card, CardActions, CardContent, Typography, Button,Box,makeStyles,TextField,Select,MenuItem, FormControlLabel} from "@material-ui/core";
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import { interpolateViridis } from "d3-scale-chromatic";
import { DataGrid } from '@mui/x-data-grid';

import { useForm } from "react-hook-form";

import "./Prioritization.css";
import ColorRampLegend from "./colorRampLegend";

const DeckGLMap = React.lazy(()=>import("./map"))

const useStyles = makeStyles((theme) => ({
    mainButton: {
      margin:"1rem",
    },
  }));



function Prioritization(props) {
  let firstRender = useRef(true)
  const {register,unregister,handleSubmit,setValue,reset, getValues, formState:{errors}} = useForm()
  console.log('errors: ',errors)
  // const {errors} = useFormState({control})
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


  const formFields=[
    {
      fieldID:'access',
      label:'Access',
    },
    {
      fieldID:'economic_value',
      label:'Economic Value'
    },
    {
      fieldID:'environmental_value',
      label:'Environmental Value'
    },
    {
      fieldID:'livability_value',
      label:'Livability Value'
    },
    {
      fieldID:'opportunity_value',
      label:'Opportunity Value'
    },
    {
      fieldID:'TSS_conc_mg/l',
      label:'TSS Concentration'
    },
    {
      fieldID:'TSS_yield_lbs_per_acre',
      label:'TSS Yield'
    }
  ]




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

  function hexToRgbA(hex){
    var c;
    if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
        c= hex.substring(1).split('');
        if(c.length== 3){
            c= [c[0], c[0], c[1], c[1], c[2], c[2]];
        }
        c= '0x'+c.join('');
        return [(c>>16)&255, (c>>8)&255, c&255];
    }
    throw new Error('Bad Hex');
}

  function _injectLayerAccessors(props){
      console.log("Starting color: ",hexToRgbA(interpolateViridis(0)))
      console.log("Ending color: ",hexToRgbA(interpolateViridis(1)))
      props.getFillColor = (d)=>{
        if (subbasinScores.length>0){
          console.log("Setting score for : ",d.properties.subbasin)
          let score = subbasinScores.filter(s=>{
            return s.subbasin.replace(' ','')===d.properties.subbasin.replace(' ','')
          })[0].score
          console.log('score found: ',score)
          console.log('color: ',hexToRgbA(interpolateViridis(score/100)))
          return hexToRgbA(interpolateViridis(score/100))
          // return [score/100*25,score/100*122,score/100*99]
        }else{
          return props.defaultFillColor||[70, 170, 21, 200]
          // return interpolateViridis(0.1)
        }
      }
      props.updateTriggers = {
        getFillColor:[subbasinScores]
      }

    return props
  }

  function formatFormData(data){
    console.log("Trying to submit form: ",data)
    let res = {
      wq_type:'',
      criteria:[]
    }

    Object.keys(data).map(k=>{
      if(k=='wq_type'){
        res[k]=data[k]
      }else{
        res.criteria.push({
          criteria:k,
          weight:data[k]
        })
      }
    })

    return res
  }

  async function _handleSubmit(data){

    const parsedFormData = formatFormData(data)
    console.log("Submitting Patch Request: ",parsedFormData)
    const response = await fetch('/api/rpc/calculate_subbasin_promethee_prioritization', {
        credentials: "same-origin",
        headers:{
            "accept":"application/json",
            "Content-type":"application/json"
        },
        method: "POST",
        body: JSON.stringify(parsedFormData),
      })
      .then(resp=>{
        // if(resp.status===200){
        //   setResultSuccess(true)
        // }else if(resp.status===422){
        //   setResultError(true)
        // }
        return resp.json()
      })
      .then(resp=>{
        setSubbasinScores(resp['result'])
      })
      .catch(err=>{
        console.log("Error:")
        console.log(err)
      })
    return response
}
function _renderFormFields(){
  if(formFields){
      console.log("With fields:",formFields)
      let fieldDiv = Object.values(formFields).map((formField)=>{
          return (
              <Box className="form-row">
                <TextField variant="outlined" margin="dense" {...register(formField.fieldID,{min:{value:0,message:'Must be greater than 0'}})} type = 'number' defaultValue = {0} required={true} label={formField.label} inputProps={{step:1}}/>
                {errors[formField.fieldID] && <Typography variant="subtitle1">{errors[formField.fieldID].message}</Typography>}
              </Box>
          )
      })
      return (
        <Box className="scoring-form">
          <Select {...register('wq_type')} defaultValue='restoration' onChange={()=>{console.log(getValues())}}>
            <MenuItem value='restoration'>Restoration</MenuItem>
            <MenuItem value = 'retrofit'>Retrofit</MenuItem>
          </Select>
          <Box className="form-body">{fieldDiv}</Box>
          <Box className="button-bar">
            <Button variant="contained" type = "submit">Submit</Button>
          </Box>
        </Box>
      );
  }else{
      return(<Box></Box>)
  }
}

function convertToCSV(objArray,headers) {
  var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
  var str = '';

  let headersFormatted= {}

  if(headers){
    headers.map(k=>{
        headersFormatted[k] = k
    })
    array.unshift(headersFormatted);
  }
  console.log("Trying to convert to CSV: ",array)

  for (var i = 0; i < array.length; i++) {
      var line = '';
      for (var index in array[i]) {
          if (line != '') line += ','

          line += array[i][index];
      }

      str += line + '\r\n';
  }

  return str;
}

function exportCSVFile(csv, fileTitle) {


  var exportedFilename = fileTitle + '.csv' || 'export.csv';

  var blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  // if (navigator.msSaveBlob) { // IE 10+
  //     navigator.msSaveBlob(blob, exportedFilename);
  // } else {
      var link = document.createElement("a");
      if (link.download !== undefined) { // feature detection
          // Browsers that support HTML5 download attribute
          var url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", exportedFilename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  // }
}

function exportScoringResults(){
  const buffer='////////////////////////////////////////\r\n'
  const formattedData = formatFormData(getValues())
  let scoreCSV = convertToCSV(subbasinScores,['subbasin','score'])
  let scenarioCSV = convertToCSV(formattedData.criteria,['Criteria','Weight'])
  let wqTypeCSV = convertToCSV([{wq_type:formattedData.wq_type}],['WQ Project Type'])
  exportCSVFile([wqTypeCSV,scenarioCSV,scoreCSV].join(buffer),'testScoringOutput')
}



  return (
    <Box className="prioritization">
      <Box className="inner-prioritization">
        <Suspense fallback={<Box>Loading Map...</Box>}>
          <DeckGLMap
            id="main-map"
            context="prioritization"
            layers={_renderLayers(layerDict, activeLayers, firstRender)}
            baseLayer={baseLayer}
            currentFeature={focusFeature}
            style={{
              top: "12%",
              left: "40%",
              width: "35%",
              height: "50%",
              border: "2 px solid grey",
              overflowY:"hidden"
            }}
          ></DeckGLMap>
          {/* {subbasinScores.length>0 && <ColorRampLegend
              style={{
                position:"absolute",
                top: "55%",
                left: "60%",
                width: "15%",
                height: "10%",
                border: "1 px solid black",
                background:"white",
                overflow:"hidden"
              }}
            ></ColorRampLegend>} */}
        </Suspense>
        <Box id='priority-score-table'>
        {subbasinScores.length>0 &&
          <React.Fragment>

            <Button onClick={()=>exportScoringResults()}>Download Results</Button>
            <DataGrid
              sx={{
                overflowX: "scroll",
                "& .MuiDataGrid-virtualScroller": {
                  overflowX: "scroll",
                },
              }}
              autoHeight
              pageSize={10}
              initialState={{
                sorting: {
                  sortModel: [{ field: 'score', sort: 'desc' }],
                },
              }}
              rows={subbasinScores}
              columns={[
                {
                  field:'subbasin',
                  headerName:'Subbasin ID'
                },
                {
                  field:'score',
                  headerName:'Priority'
                }
              ]}
              rowsPerPageOptions={[5, 25, 100]}
              // disableSelectionOnClick
              getRowId={(row) => row['subbasin']}
              density={"compact"}
            />
          </React.Fragment>}

        </Box>
      </Box>

      <Card id={"priority-info"}>
        <CardContent className={lyrSelectDisplayState ? "" : "zero-padding"}>
          <Box>
            <form onSubmit={handleSubmit((data) => _handleSubmit(data))}>
              {_renderFormFields()}
            </form>
          </Box>
          {/* <Button className={classes.mainButton} color="primary" variant="contained" type = "submit">Submit</Button> */}
        </CardContent>
      </Card>

      <Box id="base-layer-control-panel">
        <Tabs
          value={baseLayer}
          onChange={(e, n) => {
            setBaseLayer(n);
          }}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab className="base-layer-tab" label="Streets" />
          <Tab className="base-layer-tab" label="Satellite" />
        </Tabs>
      </Box>


    </Box>
  );
}

export default Prioritization;
