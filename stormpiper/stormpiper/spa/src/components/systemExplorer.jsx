import { Suspense, useEffect, useState, useRef, lazy } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, Box, Tabs, Tab } from "@mui/material";
import GridOnRoundedIcon from "@mui/icons-material/GridOnRounded";
import ScatterPlotRoundedIcon from "@mui/icons-material/ScatterPlotRounded";

import { layerDict } from "../assets/geojson/coreLayers";
import LayerSelector from "./layerSelector";
import BMPStatWindow from "./bmpStatWindow";
import { api_fetch } from "../utils/utils";

const DeckGLMap = lazy(() => import("./map"));
const ResultsTable = lazy(() => import("./resultsTable"));

const panelStyles = {
  prjStatPanel: {
    position: "fixed",
    zIndex: 9,
    top: "11%",
    left: "55%",
    overflowX: "hidden",
    overflowY: "auto",
    height: "auto",
    width: "40%",
    textAlign: "center",
  },
  prjStatPanelHidden: {
    position: "fixed",
    zIndex: 9,
    top: "75",
    left: "90%",
    overflowX: "hidden",
    overflowY: "hidden",
    height: "40px",
    width: "40px",
    textAlign: "center",
    "&:hover": {
      cursor: "pointer",
    },
  },
  layerPanel: {
    position: "relative",
    zIndex: 9,
    top: "2%",
    left: "2%",
    overflowX: "hidden",
    overflowY: "auto",
    height: "75%",
    width: "25%",
  },
  layerPanelHidden: {
    position: "relative",
    zIndex: 9,
    top: "2%",
    left: "2%",
    overflowX: "hidden",
    overflowY: "hidden",
    height: "40px",
    width: "40px",
    textAlign: "center",
    "&:hover": {
      cursor: "pointer",
    },
  },
  baseLayerPanel: {
    position: "absolute",
    zIndex: 9,
    top: "80%",
    left: "2%",
    height: "auto",
    width: "auto",
    borderRadius: "2px",
    background: "rgba(255, 255, 255, 1)",
  },
  verificationPanel: {
    position: "fixed",
    zIndex: 9,
    top: "30%",
    left: "25%",
    height: "auto",
    width: "50%",
    borderRadius: "2px",
    background: "rgba(255, 255, 255, 1)",
  },
  verificationPanelHidden: {
    position: "fixed",
    zIndex: 9,
    top: "30%",
    left: "-50%",
    height: "auto",
    width: "50%",
    borderRadius: "2px",
    background: "rgba(255, 255, 255, 1)",
  },
  resultsPanel: {
    transitionProperty: "top",
    transitionTimingFunction: "linear",
    transitionDuration: "500ms",
    position: "relative",
    zIndex: 9,
    top: "100%",
    left: "0%",
    overflowX: "hidden",
    overflowY: "auto",
    height: "91vh",
    width: "100%",
    textAlign: "center",
  },

  resultsPanelHidden: {
    transitionProperty: "top",
    transitionTimingFunction: "linear",
    transitionDuration: "500ms",
    position: "relative",
    zIndex: 9,
    top: "150%",
    left: "-100%",
    overflowX: "hidden",
    overflowY: "auto",
    height: "91%",
    width: "94%",
    textAlign: "center",
  },
};

function SystemExplorer({ setDrawerButtonList, userProfile }) {
  const classes = panelStyles;
  let params = useParams();
  let navigate = useNavigate();
  let location = useLocation();

  let firstRender = useRef(true);

  const [lyrSelectDisplayState, setlyrSelectDisplayState] = useState(false); // when true, control panel is displayed
  const [prjStatDisplayState, setprjStatDisplayState] = useState(
    params?.id ? true : false
  ); // when true, project stats panel is displayed
  const [focusFeatureID, setFocusFeatureID] = useState(params?.id || null);
  const [isDirty, setIsDirty] = useState({
    is_dirty: false,
    last_updated: Date.now(),
  });
  const [layers, setLayers] = useState(false);
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

  useEffect(async () => {
    setFocusFeatureID(params?.id);
  }, [location, params?.id]);

  useEffect(async () => {
    setLayers(_renderLayers(layerDict, activeLayers));
  }, [focusFeatureID, activeLayers]);

  function _fetchIsDirty() {
    if (userProfile?.is_verified) {
      api_fetch("/api/rest/results/is_dirty")
        .then((res) => {
          return res.json();
        })
        .then((res) => {
          setIsDirty(res || null);
        });
    }
  }

  useEffect(() => {
    //Only perform these operations on initial render

    //Set up is_dirty polling request to check when new results need to be calculated
    _fetchIsDirty();
    const poll = setInterval(_fetchIsDirty, 10000);
    return () => clearInterval(poll);
  }, []);

  const [resultsDisplayState, setResultsDisplayState] = useState(false); //when true, results table is displayed

  function _toggleSetResultsDisplayState() {
    setResultsDisplayState(!resultsDisplayState);
  }

  const buttonList = [
    {
      label: "Evaluate Project",
      icon: <GridOnRoundedIcon />,
      clickHandler: _toggleSetResultsDisplayState,
    },
  ];

  useEffect(() => {
    setTimeout(() => {
      setDrawerButtonList(buttonList);
    }, 50);
  }, [location]);

  function _toggleLayer(layerName, updateFunction = setActiveLayers) {
    var currentActiveLayers = { ...activeLayers };
    currentActiveLayers[layerName] = !currentActiveLayers[layerName];
    console.log("Current Active Layers:", currentActiveLayers);
    updateFunction(currentActiveLayers);
  }

  function _renderLayers(layerDict, visState, layersToRender = []) {
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
            props = _injectLayerAccessors(props, focusFeatureID);
            layersToRender.push(new Layer(props));
          }
          return false;
        });
      } else {
        layersToRender = _renderLayers(layerGroup, visState, layersToRender);
      }
      return false;
    });
    firstRender.current = false;
    return layersToRender;
  }

  function _togglelyrSelectDisplayState() {
    setlyrSelectDisplayState(!lyrSelectDisplayState);
  }

  function _toggleprjStatDisplayState() {
    if (prjStatDisplayState) {
      console.log("Clearing Focused Feature");
      setFocusFeatureID(null);
      navigate("/app/map");
    }
    setprjStatDisplayState(!prjStatDisplayState);
  }

  function _lyrClickHandlers(objInfo) {
    console.log("Top level map click: ", objInfo);
    if (objInfo?.layer?.id === "activeSWFacility") {
      if (!prjStatDisplayState) {
        //users can click on another facility without hiding the panel
        _toggleprjStatDisplayState();
      }
      setFocusFeatureID(objInfo.object.properties.node_id);
      navigate("/app/map/tmnt/" + objInfo.object.properties.node_id);
    }
  }

  function _injectLayerAccessors(props, focusFeatureID) {
    props.getFillColor = (d) => {
      return d.properties.altid === focusFeatureID
        ? props.highlightColor || [52, 222, 235]
        : props.defaultFillColor || [70, 170, 21, 200];
    };
    props.getIconColor = (d) => {
      return d.properties.altid === focusFeatureID
        ? props.highlightColor || [52, 222, 235]
        : props.defaultFillColor || [70, 170, 21, 200];
    };
    props.updateTriggers = {
      getFillColor: [focusFeatureID || null],
      getIconColor: [focusFeatureID || null],
    };
    return props;
  }

  return (
    <Box>
      <Box
        sx={{
          position: "absolute",
          height: "calc(100vh - 66px)",
          left: (theme) => theme.spacing(7),
          width: (theme) => `calc(100% - ${theme.spacing(7)})`,
        }}
      >
        <Suspense fallback={<Box>Loading Map...</Box>}>
          <DeckGLMap
            id="main-map"
            layers={layers}
            baseLayer={baseLayer}
            onClick={_lyrClickHandlers.bind(this)}
            zoomID={{
              layerID: "activeSWFacility",
              featureID: focusFeatureID,
              featureIDField: "node_id",
            }}
          ></DeckGLMap>
        </Suspense>
        <Box sx={classes.baseLayerPanel}>
          <Tabs
            value={baseLayer}
            onChange={(e, n) => {
              setBaseLayer(n);
            }}
            indicatorColor="primary"
            textColor="primary"
          >
            <Tab label="Streets" />
            <Tab label="Satellite" />
          </Tabs>
        </Box>
        <Card
          sx={
            lyrSelectDisplayState
              ? classes.layerPanel
              : classes.layerPanelHidden
          }
        >
          <CardContent sx={{ p: lyrSelectDisplayState ? 2 : 0 }}>
            <LayerSelector
              layerDict={layerDict}
              activeLayers={activeLayers}
              _onToggleLayer={_toggleLayer}
              displayStatus={lyrSelectDisplayState}
              displayController={_togglelyrSelectDisplayState}
            ></LayerSelector>
          </CardContent>
        </Card>

        <Card
          sx={
            prjStatDisplayState
              ? classes.prjStatPanel
              : classes.prjStatPanelHidden
          }
        >
          <CardContent sx={{ p: prjStatDisplayState ? 2 : 0 }}>
            <BMPStatWindow
              displayStatus={prjStatDisplayState}
              displayController={_toggleprjStatDisplayState}
              feature={focusFeatureID}
              isDirty={isDirty}
            ></BMPStatWindow>
          </CardContent>
        </Card>
      </Box>
      <Card
        sx={
          resultsDisplayState
            ? classes.resultsPanel
            : classes.resultsPanelHidden
        }
      >
        <CardContent className={resultsDisplayState ? "" : "zero-padding"}>
          <Suspense fallback={<Box>Loading Table...</Box>}>
            <ResultsTable
              nodes="all"
              currentNode={focusFeatureID}
              displayController={_toggleSetResultsDisplayState}
              displayState={resultsDisplayState}
            ></ResultsTable>
          </Suspense>
        </CardContent>
      </Card>
    </Box>
  );
}

export default SystemExplorer;
