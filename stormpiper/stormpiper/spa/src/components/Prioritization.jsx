import { Suspense, useState, useRef, useEffect, lazy } from "react";
import { useForm } from "react-hook-form";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import { interpolateViridis } from "d3-scale-chromatic";
import { DataGrid } from "@mui/x-data-grid";

import { layerDict } from "../assets/geojson/subbasinLayer";
import ColorRampLegend from "./colorRampLegend";
import { api_fetch } from "../utils/utils";
import { HalfSpan, TwoColGrid } from "./base/two-col-grid";

const DeckGLMap = lazy(() => import("./map"));

function Prioritization({ setDrawerButtonList }) {
  let firstRender = useRef(true);
  const {
    register,
    unregister,
    handleSubmit,
    setValue,
    reset,
    getValues,
    formState: { errors },
  } = useForm();
  const [priorityWorkflowState, setPriorityWorkflowState] = useState("scoring");
  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed
  const [subbasinScores, setSubbasinScores] = useState({});
  let params = useParams();
  let navigate = useNavigate();
  const [focusFeature, setFocusFeature] = useState(params?.id || null);
  const [baseLayer, setBaseLayer] = useState(0);
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

            res[layerID] = layerGroup[layer].props?.onByDefault || false;
          }
          return false;
        });
      } else {
        for (const layer in layerGroup) {
          const layerID = layerGroup[layer].props?.id;
          res[layerID] = layerGroup[layer].props?.onByDefault || false;
        }
      }
      return false;
    });
    return res;
  });

  const buttonList = [
    {
      label: "About Prioritization",
      icon: <InfoRoundedIcon />,
      clickHandler: () => setPriorityWorkflowState("info"),
    },
    {
      label: "Define Criteria Weights",
      icon: <GridOnRoundedIcon />,
      clickHandler: () => setPriorityWorkflowState("scoring"),
    },
  ];

  useEffect(() => {
    setDrawerButtonList(buttonList);
  }, []);

  const formFields = [
    {
      label: "Equity",
      fieldID: "equity",
      description:
        "Prioritize areas based on equity-based economic, environmental, and livability attributes",
      fieldGroup: [
        "access",
        "economic_value",
        "environmental_value",
        "livability_value",
        "opportunity_value",
      ],
    },
    {
      label: "Pollutant Concentrations",
      fieldID: "loads",
      description:
        "Prioritize areas with high pollutant concentrations and runoff volumes",
      fieldGroup: ["TP_conc_mg/l", "TSS_conc_mg/l", "TN_conc_mg/l"],
    },
    {
      label: "Pollutant Yields",
      fieldID: "yields",
      description:
        "Prioritize areas with high pollutant yields (e.g. high loads and large areas)",
      fieldGroup: [
        "TP_yield_lbs_per_acre",
        "TSS_yield_lbs_per_acre",
        "TN_yield_lbs_per_acre",
        "runoff_depth_inches",
      ],
    },
  ];

  function _renderLayers(
    layerDict,
    visState,
    isFirstRender,
    layersToRender = []
  ) {
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if (layerGroup.length) {
        Object.keys(layerGroup).map((id) => {
          let { layer: Layer, props, getData } = layerGroup[id];
          if (getData && !props.data) {
            props.data = getData();
          }

          if (
            visState[props.id] ||
            (firstRender.current && props.onByDefault)
          ) {
            props = _injectLayerAccessors(props);
            layersToRender.push(new Layer(props));
          }
          return false;
        });
      } else {
        layersToRender = _renderLayers(
          layerGroup,
          visState,
          isFirstRender,
          layersToRender
        );
      }
      return false;
    });
    // console.log('Layers to Render:',layersToRender)
    firstRender.current = false;
    return layersToRender;
  }

  function hexToRgbA(hex) {
    var c;
    if (/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      c = hex.substring(1).split("");
      if (c.length == 3) {
        c = [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c = "0x" + c.join("");
      return [(c >> 16) & 255, (c >> 8) & 255, c & 255];
    }
    throw new Error("Bad Hex");
  }

  function _injectLayerAccessors(props) {
    props.getFillColor = (d) => {
      if (subbasinScores.length > 0) {
        console.log("Setting score for : ", d.properties.subbasin);
        let score = subbasinScores.filter((s) => {
          return (
            s.subbasin.replace(" ", "") ===
            d.properties.subbasin.replace(" ", "")
          );
        })[0].score;
        console.log("score found: ", score);
        console.log("color: ", hexToRgbA(interpolateViridis(score / 100)));
        return hexToRgbA(interpolateViridis(score / 100));
        // return [score/100*25,score/100*122,score/100*99]
      } else {
        return props.defaultFillColor || [70, 170, 21, 200];
        // return interpolateViridis(0.1)
      }
    };
    props.updateTriggers = {
      getFillColor: [subbasinScores],
    };

    return props;
  }

  function formatFormData(data) {
    console.log("Trying to submit form: ", data);
    let res = {
      wq_type: "",
      criteria: [],
    };

    Object.keys(data).map((k) => {
      if (k == "wq_type") {
        res[k] = data[k];
      } else {
        formFields
          .filter((field) => field["fieldID"] === k)[0]
          ["fieldGroup"].map((criteria) => {
            res.criteria.push({
              criteria: criteria,
              weight: data[k],
            });
          });
      }
    });

    return res;
  }

  async function _handleSubmit(data) {
    let baseURL;
    if (process.env.NODE_ENV === "development") {
      baseURL = "http://localhost:8080/";
    } else {
      baseURL = "/";
    }

    const parsedFormData = formatFormData(data);
    console.log("Submitting Patch Request: ", parsedFormData);
    const response = await api_fetch(
      "/api/rpc/calculate_subbasin_promethee_prioritization",
      {
        credentials: "same-origin",
        headers: {
          accept: "application/json",
          "Content-type": "application/json",
        },
        method: "POST",
        body: JSON.stringify(parsedFormData),
      }
    )
      .then((resp) => {
        // if(resp.status===200){
        //   setResultSuccess(true)
        // }else if(resp.status===422){
        //   setResultError(true)
        // }
        return resp.json();
      })
      .then((resp) => {
        setSubbasinScores(resp["result"]);
      })
      .catch((err) => {
        console.log("Error:");
        console.log(err);
      });
    return response;
  }
  function _renderFormFields() {
    if (formFields) {
      console.log("With fields:", formFields);
      let fieldDiv = Object.values(formFields).map((formField) => {
        return (
          <Box
            key={formField.fieldID}
            sx={{
              display: "flex",
              flexDirection: "column",
              borderBottom: "0.5px solid grey",
              mb: "1rem",
            }}
          >
            <TextField
              variant="outlined"
              margin="dense"
              {...register(formField.fieldID, {
                min: { value: 0, message: "Must be greater than 0" },
              })}
              type="number"
              defaultValue={0}
              required={true}
              label={formField.label}
              inputProps={{ step: 0.1 }}
            />
            <Typography variant="caption">{formField.description}</Typography>
            {errors[formField.fieldID] && (
              <Typography variant="caption">
                {errors[formField.fieldID].message}
              </Typography>
            )}
          </Box>
        );
      });
      return (
        <Box>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(1,1r)",
              padding: "0px 10px",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                borderBottom: "0.5px solid grey",
                mb: "1rem",
              }}
            >
              <Typography variant="body1">Set a project type</Typography>
              <Typography variant="caption">
                Are you prioritizing preservation projects or retrofit projects?
              </Typography>
              <FormControl>
                <Select {...register("wq_type")} defaultValue="retrofit">
                  <MenuItem value="preservation">Preservation</MenuItem>
                  <MenuItem value="retrofit">Retrofit</MenuItem>
                </Select>
              </FormControl>
            </Box>
            <Typography variant="body1">Set Priority Weights</Typography>
            {fieldDiv}
          </Box>
          <Box>
            <Button variant="contained" type="submit">
              Submit
            </Button>
          </Box>
        </Box>
      );
    } else {
      return <Box></Box>;
    }
  }

  function convertToCSV(objArray, headers) {
    var array = typeof objArray != "object" ? JSON.parse(objArray) : objArray;
    var str = "";

    let headersFormatted = {};

    if (headers) {
      headers.map((k) => {
        headersFormatted[k] = k;
      });
      array.unshift(headersFormatted);
    }
    console.log("Trying to convert to CSV: ", array);

    for (var i = 0; i < array.length; i++) {
      var line = "";
      for (var index in array[i]) {
        if (line != "") line += ",";

        line += array[i][index];
      }

      str += line + "\r\n";
    }

    return str;
  }

  function exportCSVFile(csv, fileTitle) {
    var exportedFilename = fileTitle + ".csv" || "export.csv";

    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    // if (navigator.msSaveBlob) { // IE 10+
    //     navigator.msSaveBlob(blob, exportedFilename);
    // } else {
    var link = document.createElement("a");
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", exportedFilename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // }
  }

  async function exportScoringResults() {
    //Fetch subbasin properties to join with scores
    const subbasinAttributes = await api_fetch(
      "/api/rest/subbasin/?f=geojson&limit=100000&offset=0&epoch=1980s",
      {
        credentials: "same-origin",
        headers: {
          accept: "application/json",
          "Content-type": "application/json",
        },
        method: "GET",
      }
    )
      .then((resp) => {
        return resp.json();
      })
      .catch((err) => {
        console.log("Error:");
        console.log(err);
      });
    let basinFields = [];
    formFields.map((f) => {
      f.fieldGroup.map((field) => basinFields.push(field));
    });
    //TODO: Sort by scores, descending
    let joinedScores = subbasinAttributes.features.map((subbasin) => {
      let r = {};
      r["subbasin"] = subbasin.properties.subbasin;
      basinFields.map((attr) => {
        r[attr] = subbasin.properties[attr];
      });
      r["score"] = subbasinScores.filter(
        (sb) => sb["subbasin"] === subbasin.properties.subbasin
      )[0].score;
      return r;
    });

    const buffer = "////////////////////////////////////////\r\n";
    const formattedData = formatFormData(getValues());
    let scoreCSV = convertToCSV(joinedScores, [
      "subbasin",
      ...basinFields,
      "score",
    ]);
    let scenarioCSV = convertToCSV(formattedData.criteria, [
      "Criteria",
      "Weight",
    ]);
    let wqTypeCSV = convertToCSV(
      [{ wq_type: formattedData.wq_type }],
      ["WQ Project Type"]
    );
    exportCSVFile(
      [wqTypeCSV, scenarioCSV, scoreCSV].join(buffer),
      "testScoringOutput"
    );
  }

  return (
    <TwoColGrid>
      <HalfSpan md={4}>
        <Card sx={{ p: 2 }}>
          {priorityWorkflowState == "scoring" ? (
            <form onSubmit={handleSubmit((data) => _handleSubmit(data))}>
              {_renderFormFields()}
            </form>
          ) : (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(1,1r)",
                padding: "0px 10px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottom: "0.5px solid grey",
                  mb: "1rem",
                }}
              >
                <Typography variant="body1">
                  About Subbasin Prioritization
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  borderBottom: "0.5px solid grey",
                  mb: "1rem",
                }}
              >
                <Typography variant="caption">
                  Use this tool to identify regions of the City of Tacoma
                  Watershed that are most in need of stormwater retrofit or
                  preservation projects
                </Typography>
              </Box>
            </Box>
          )}
        </Card>
      </HalfSpan>
      <HalfSpan
        md={8}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Suspense
          fallback={
            <Box
              sx={{
                width: "100%",
                height: "500px",
                position: "relative",
                overflowY: "hidden",
              }}
            >
              Loading Map...
            </Box>
          }
        >
          <Card
            sx={{
              width: "100%",
              height: "500px",
              position: "relative",
            }}
          >
            <DeckGLMap
              id="main-map"
              context="prioritization"
              layers={_renderLayers(layerDict, activeLayers, firstRender)}
              baseLayer={baseLayer}
              currentFeature={focusFeature}
              sx={{
                position: "absolute",
              }}
            />
            {subbasinScores.length > 0 && (
              <ColorRampLegend
                sx={{
                  position: "absolute",
                  bottom: "25px",
                  right: "15px",
                  width: "200px",
                  height: "30px",
                  px: 2,
                  py: 1,
                  background: "rgba(255, 255, 255, 0.8)",
                  borderRadius: 1,
                }}
              ></ColorRampLegend>
            )}
          </Card>
        </Suspense>
        <Box sx={{ pt: 2 }}>
          <Card>
            <CardContent>
              {subbasinScores.length > 0 ? (
                <Box sx={{ maxWidth: "300px" }}>
                  <Button
                    sx={{ mb: 2 }}
                    variant="contained"
                    onClick={() => exportScoringResults()}
                  >
                    Download Results
                  </Button>
                  <DataGrid
                    autoHeight
                    disableColumnMenu
                    disableMultipleRowSelection={true}
                    disableRowSelectionOnClick={true}
                    rowSelection={false}
                    initialState={{
                      sorting: {
                        sortModel: [{ field: "score", sort: "desc" }],
                      },
                      pagination: { paginationModel: { pageSize: 25 } },
                    }}
                    rows={subbasinScores}
                    columns={[
                      {
                        field: "subbasin",
                        headerName: "Subbasin ID",
                        width: 150,
                      },
                      {
                        field: "score",
                        headerName: "Priority",
                        width: 150,
                      },
                    ]}
                    rowsPerPageOptions={[5, 25, 100]}
                    disableSelectionOnClick
                    getRowId={(row) => row["subbasin"]}
                    density={"compact"}
                  />
                </Box>
              ) : (
                <Box>
                  <Typography variant="body1" align="center">
                    Submit a set of priority weights to view and download the
                    relative scores of each subbasin
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </HalfSpan>
    </TwoColGrid>
  );
}

export default Prioritization;
