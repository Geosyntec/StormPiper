import { Suspense, useEffect, useState, useRef, lazy, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, Box, Tabs, Tab } from "@mui/material";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";
import SearchIcon from "@mui/icons-material/Search";
import { UserProfileContext } from "./authProvider";

import { layerDict } from "../assets/geojson/coreLayers";
import LayerSelector from "./layerSelector";
import BMPInfoWindow from "./bmpInfoWindow";
import { api_fetch } from "../utils/utils";
import { ExplorerSearch } from "./search/explorer-search-bar";

const DeckGLMap = lazy(() => import("./map"));

const panelStyles = {
  prjStatPanel: {
    zIndex: 9,
    width: "400px",
    alignSelf: "flex-start",
  },
  layerPanel: {
    zIndex: 9,
    width: "400px",
    overflowY: "scroll",
  },
  panelHidden: {
    pointerEvents: "none",
    opacity: 0,
    width: "1%",
  },

  baseLayerPanel: {
    position: "absolute",
    zIndex: 9,
    bottom: "45px",
    right: "10px",
    height: "auto",
    width: "auto",
    borderRadius: "2px",
    background: "rgba(255, 255, 255, 1)",
  },
  legendCard: {
    position: "absolute",
    zIndex: 9,
    bottom: "100px",
    right: "10px",
    height: "auto",
    width: "auto",
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

function SystemExplorer({ setDrawerButtonList }) {
  const classes = panelStyles;
  const userProfile = useContext(UserProfileContext);

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
  const [overlayLayers, setOverlayLayers] = useState([]);
  const [legendImg, setLegendImg] = useState(null);
  const [baseLayer, setBaseLayer] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(11);
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
    const baseLayers = _renderLayers(layerDict, activeLayers, zoomLevel);
    setLayers([...baseLayers, ...overlayLayers]);
  }, [focusFeatureID, activeLayers, overlayLayers, zoomLevel]);

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

  const [searchDisplayState, setSearchDisplayState] = useState(false); //when true, results table is displayed

  function _toggleSetSearchDisplayState() {
    searchDisplayState && _clearSearch();
    setSearchDisplayState(!searchDisplayState);
  }

  const buttonList = [
    {
      label: "Show/Hide Layers",
      icon: <LayersRoundedIcon />,
      clickHandler: _togglelyrSelectDisplayState,
    },
    {
      label: "Search for BMP",
      icon: <SearchIcon />,
      clickHandler: _toggleSetSearchDisplayState,
    },
  ];

  useEffect(() => {
    setDrawerButtonList(buttonList);
  }, [searchDisplayState, resultsDisplayState, lyrSelectDisplayState]);

  function _toggleLayer(layerName, updateFunction = setActiveLayers) {
    var currentActiveLayers = { ...activeLayers };

    //Ensure that only one raster layer is displayed at time to avoid z-index issues
    if (layerName.toLowerCase().match("raster")) {
      Object.keys(currentActiveLayers).map((k) => {
        if (k.toLowerCase().match("raster") && k != layerName) {
          currentActiveLayers[k] = false;
        }
        if (currentActiveLayers[layerName]) {
          setLegendImg(null);
        }
      });
    }
    currentActiveLayers[layerName] = !currentActiveLayers[layerName];
    updateFunction(currentActiveLayers);
  }

  function _renderLayers(layerDict, visState, zoomLevel, layersToRender = []) {
    Object.keys(layerDict).map((category) => {
      const layerGroup = layerDict[category];
      if (layerGroup.length) {
        Object.keys(layerGroup).map((id) => {
          let { layer: Layer, props, getData } = layerGroup[id];
          if (getData && !props.data) {
            props.data = getData();
          }
          if (
            (visState[props.id] ||
              (firstRender.current && props.onByDefault)) &&
            zoomLevel > props.minZoom
          ) {
            props = _injectLayerAccessors(props, focusFeatureID);
            layersToRender.push(new Layer(props));
            if (props.id.toLowerCase().match("raster")) {
              import(`../assets/img/${props.legendImg?.src}.png`)
                .then((res) => {
                  setLegendImg({ ...props.legendImg, src: res.default });
                })
                .catch((err) => {
                  setLegendImg(null);
                });
            }
          }
          return false;
        });
      } else {
        layersToRender = _renderLayers(
          layerGroup,
          visState,
          zoomLevel,
          layersToRender
        );
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
      setFocusFeatureID(null);
      navigate("/app/map");
    }
    setprjStatDisplayState(!prjStatDisplayState);
  }

  function _lyrClickHandlers(objInfo) {
    if (objInfo?.layer?.id === "activeSWFacility") {
      _clearSearch();
      if (!prjStatDisplayState) {
        //users can click on another facility without hiding the panel
        _toggleprjStatDisplayState();
      }
      setFocusFeatureID(objInfo.object.properties.node_id);
      navigate("/app/map/tmnt/" + objInfo.object.properties.node_id);
    }
  }

  function _injectLayerAccessors(props, focusFeatureID) {
    const pkField = props.featurePKField;
    props.getFillColor = (d) => {
      return d.properties[pkField] && d.properties[pkField] === focusFeatureID
        ? props.highlightColor || [52, 222, 235]
        : props.defaultFillColor || [70, 170, 21, 200];
    };
    props.getIconColor = (d) => {
      return d.properties[pkField] && d.properties[pkField] === focusFeatureID
        ? props.highlightColor || [52, 222, 235]
        : props.defaultFillColor || [70, 170, 21, 200];
    };
    props.updateTriggers = {
      getFillColor: [focusFeatureID || null],
      getIconColor: [focusFeatureID || null],
    };
    return props;
  }

  function _addSearchLayer(layer) {
    const ol = overlayLayers.filter((x) => x.id !== "facilitiesFound");
    setOverlayLayers([...ol, layer]);
  }

  function _removeSearchLayer() {
    const ol = overlayLayers.filter((x) => x.id !== "facilitiesFound");
    setOverlayLayers([...ol]);
  }

  function _clearSearch() {
    _removeSearchLayer();
    setSearchDisplayState(false);
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
        {searchDisplayState && (
          <Box
            sx={{
              zIndex: 1000,
              position: "relative",
              m: 2,
            }}
          >
            <Card sx={{ p: 2 }}>
              <ExplorerSearch setLayers={_addSearchLayer} />
            </Card>
          </Box>
        )}
        <Suspense fallback={<></>}>
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
            setZoomLevel={setZoomLevel}
            showTooltip={true}
          ></DeckGLMap>
        </Suspense>
        {legendImg && (
          <Card sx={classes.legendCard}>
            <CardContent
              sx={{ padding: 0, "&:last-child": { paddingBottom: 0 } }}
            >
              <img
                src={legendImg?.src}
                height={legendImg.height || "200px"}
                aspect-ratio={legendImg.aspectRatio || "4/3"}
                // width={legendImg.width || "286px"}
              />
            </CardContent>
          </Card>
        )}
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
        <Box
          display="flex"
          sx={{
            p: 2,
            justifyContent: "space-between",
            height: "100%",
          }}
        >
          <Card
            sx={
              lyrSelectDisplayState ? classes.layerPanel : classes.panelHidden
            }
          >
            <CardContent sx={{ p: 2 }}>
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
              prjStatDisplayState ? classes.prjStatPanel : classes.panelHidden
            }
          >
            <CardContent>
              <BMPInfoWindow
                displayStatus={prjStatDisplayState}
                displayController={_toggleprjStatDisplayState}
                feature={focusFeatureID}
                isDirty={isDirty}
              ></BMPInfoWindow>
            </CardContent>
          </Card>
        </Box>
      </Box>
      <Card
        sx={
          resultsDisplayState
            ? classes.resultsPanel
            : classes.resultsPanelHidden
        }
      ></Card>
    </Box>
  );
}

export default SystemExplorer;
