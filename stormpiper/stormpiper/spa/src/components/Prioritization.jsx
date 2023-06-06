import { Suspense, useState, useRef, useEffect, lazy } from "react";
import { useForm } from "react-hook-form";
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
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarExport,
} from "@mui/x-data-grid";
import SaveAltIcon from "@mui/icons-material/SaveAlt";

import { layerDict } from "../assets/geojson/subbasinLayer";
import ColorRampLegend from "./colorRampLegend";
import { api_fetch, colorToList } from "../utils/utils";
import { HalfSpan, TwoColGrid } from "./base/two-col-grid";
import { csv } from "d3-fetch";

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
  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed
  const [subbasinScores, setSubbasinScores] = useState({});
  const [baseLayer, setBaseLayer] = useState(0);
  const [criteriaDirection, setCriteriaDirection] = useState("retro");
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
  const [goalGroups, setGoalGroups] = useState([]);
  const [goalFields, setGoalFields] = useState([]);

  useEffect(() => {
    setDrawerButtonList([]);
  }, []);

  useEffect(() => {
    csv("../../assets/data/goals.csv").then((res) => setGoalGroups(res));
    csv("../../assets/data/field_manifest.csv").then((res) =>
      setGoalFields(res.filter((field) => field.priority_subgoal != ""))
    );
  }, []);

  const formFields = goalGroups.map((group) => {
    return {
      groupType: group.subgoal === "0" ? "main" : "sub",
      label: group.display_name,
      fieldID: group.subgoal,
      description: "",
      fieldGroup: goalFields
        .filter((field) => {
          return field.priority_subgoal === group.subgoal;
        })
        .map((obj) => obj.field),
    };
  });

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
    firstRender.current = false;
    return layersToRender;
  }

  function _injectLayerAccessors(props) {
    props.getFillColor = (d) => {
      if (subbasinScores.length > 0) {
        let score = subbasinScores.filter((s) => {
          return (
            s.subbasin.replace(" ", "") ===
            d.properties.subbasin.replace(" ", "")
          );
        })[0].score;

        return colorToList(interpolateViridis(score / 100));
      } else {
        return props.defaultFillColor || [70, 170, 21, 200];
      }
    };
    props.updateTriggers = {
      getFillColor: [subbasinScores],
    };

    return props;
  }

  async function formatFormData(data) {
    const subbasinAttributes = await api_fetch(
      "/api/rest/subbasin/?f=geojson&offset=0&epoch=1980s",
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
      .then((resp) => {
        return Object.keys(resp.features[0].properties);
      })
      .catch((err) => {
        console.log("Error:", err);
      });

    let res = {
      criteria: [],
    };

    Object.keys(data).map((k) => {
      if (k != "wq_type") {
        formFields
          .filter((field) => field["fieldID"] === k)[0]
          ["fieldGroup"].map((criteria) => {
            if (subbasinAttributes.includes(criteria)) {
              res.criteria.push({
                subgoal: k,
                criteria: criteria,
                weight: data[k],
                direction: parseInt(
                  goalFields.filter((field) => field.field === criteria)[0][
                    data.wq_type
                  ]
                ),
              });
            }
          });
      }
    });

    return res;
  }

  async function _handleSubmit(data) {
    const parsedFormData = await formatFormData(data);

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
        return resp.json();
      })
      .then((resp) => {
        setSubbasinScores(resp["result"]);
      })
      .catch((err) => {
        console.log("Error:", err);
      });
    return response;
  }
  function _renderFormFields() {
    if (formFields) {
      let fieldDiv = Object.values(formFields).map((formField) => {
        if (formField.groupType === "sub") {
          return (
            <Box
              key={formField.fieldID}
              sx={{
                display: "flex",
                flexDirection: "column",
                mb: "1rem",
              }}
            >
              <Typography variant="caption">{formField.label}</Typography>
              <TextField
                variant="outlined"
                margin="dense"
                {...register(formField.fieldID, {
                  min: { value: 0, message: "Must be greater than 0" },
                })}
                type="number"
                defaultValue={0}
                required={true}
                inputProps={{ step: 0.1 }}
              />
              <Typography variant="caption">{formField.description}</Typography>
              {errors[formField.fieldID] && (
                <Typography
                  variant="caption"
                  sx={{ color: (theme) => theme.palette.warning.main }}
                >
                  {errors[formField.fieldID].message}
                </Typography>
              )}
            </Box>
          );
        } else {
          return (
            <Box
              key={formField.fieldID}
              sx={{
                display: "flex",
                flexDirection: "column",
                mb: "1rem",
              }}
            >
              <Typography variant="body2">{formField.label}</Typography>
            </Box>
          );
        }
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
                mb: "1rem",
              }}
            >
              <Typography variant="body1">
                <strong>Set a project type</strong>
              </Typography>
              <Box sx={{ mt: 1, mb: 0.5 }}>
                <Typography variant="caption">
                  Are you prioritizing preservation projects or retrofit
                  projects?
                </Typography>
                <FormControl sx={{ width: "100%", mt: 1 }}>
                  <Select
                    {...register("wq_type")}
                    defaultValue="retrofit_direction"
                  >
                    <MenuItem value="preservation_direction">
                      Preservation
                    </MenuItem>
                    <MenuItem value="retrofit_direction">Retrofit</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>
            <Typography variant="body1">
              <strong>Set Priority Weights</strong>
            </Typography>
            {fieldDiv}
          </Box>
          <Box sx={{ px: 1 }}>
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
  }

  async function exportScoringResults() {
    //Fetch subbasin properties to join with scores
    const subbasinAttributes = await api_fetch(
      "/api/rest/subbasin/?f=geojson&offset=0&epoch=1980s",
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
        console.log("Error:", err);
      });
    let basinFields = [];
    formFields.map((f) => {
      f.fieldGroup.map((field) => basinFields.push(field));
    });

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

    let sortedScores = joinedScores.sort((a, b) => b.score - a.score);

    const buffer = "////////////////////////////////////////\r\n";
    const formattedData = await formatFormData(getValues());
    let scoreCSV = convertToCSV(sortedScores, [
      "subbasin",
      ...basinFields,
      "score",
    ]);
    let scenarioCSV = convertToCSV(formattedData.criteria, [
      "Subgoal",
      "Criteria",
      "Weight",
      "Direction",
    ]);
    let wqTypeCSV = convertToCSV(
      [{ wq_type: getValues("wq_type") }],
      ["WQ Project Type"]
    );
    exportCSVFile(
      [wqTypeCSV, scenarioCSV, scoreCSV].join(buffer),
      "Tacoma_Watersheds_Prioritization_Results_" +
        new Date().toLocaleString("en-US", {
          dateStyle: "short",
        })
    );
  }

  function CustomToolBar() {
    return (
      <GridToolbarContainer>
        {/* <GridToolbarExport
          sx={{ mx: 2 }}
          onClick={exportScoringResults}
          printOptions={{ disableToolbarButton: true }}
          csvOptions={{ disableToolbarButton: false }}
        /> */}
        <Button startIcon={<SaveAltIcon />} onClick={exportScoringResults}>
          EXPORT
        </Button>
      </GridToolbarContainer>
    );
  }

  return (
    <TwoColGrid>
      <HalfSpan md={5}>
        <Card sx={{ p: 2 }}>
          <Box>
            <Box
              sx={{
                margin: 1,
                pb: 2,
                borderBottom: "1px solid grey",
              }}
            >
              <Typography variant="h6">
                <strong>About Subbasin Prioritization</strong>
              </Typography>
              <Typography variant="caption">
                Use this tool to identify regions of the City of Tacoma
                Watershed that are most in need of stormwater retrofit or
                preservation projects
              </Typography>
            </Box>
            <form onSubmit={handleSubmit((data) => _handleSubmit(data))}>
              {_renderFormFields()}
            </form>
          </Box>
        </Card>
      </HalfSpan>
      <HalfSpan
        md={7}
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <Suspense fallback={<></>}>
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
              initialViewState={{
                zoom: 10,
              }}
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
                label="Subbasin Priority Score"
              ></ColorRampLegend>
            )}
          </Card>
        </Suspense>
        <Box sx={{ pt: 2, width: "100%" }}>
          <Card>
            <CardContent>
              {subbasinScores.length > 0 ? (
                <Box>
                  <Box sx={{ my: 1 }}>
                    <Typography variant="body1">
                      <strong>Subbasin Prioritization Results</strong>
                    </Typography>
                    <Typography variant="body2">
                      Higher priority scores indicate subbasins more favorable
                      for new projects <br />
                      To view the specific subbasin attributes that determine
                      scores, export the results below
                    </Typography>
                  </Box>
                  <Box sx={{ maxWidth: "400px" }}>
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
                        pagination: { paginationModel: { pageSize: 10 } },
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
                          headerName: "Priority Score",
                          width: 150,
                        },
                      ]}
                      rowsPerPageOptions={[5, 25, 100]}
                      disableSelectionOnClick
                      getRowId={(row) => row["subbasin"]}
                      density={"compact"}
                      slots={{ toolbar: CustomToolBar }}
                    />
                  </Box>
                </Box>
              ) : (
                <Box sx={{ width: "100%" }}>
                  <Typography variant="body1" align="center">
                    Submit a set of priorities to view and download results
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
