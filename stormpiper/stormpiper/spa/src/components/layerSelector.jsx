import { Checkbox, Box, Typography } from "@mui/material";

function LayerSelector(props) {
  return (
    <>
      {props.displayStatus && (
        <Box sx={{ overflow: "scroll" }}>
          <Box
            sx={{
              mb: 1,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid grey",
            }}
          >
            <Typography variant="h4">Layers</Typography>
            <Box sx={{ cursor: "pointer" }} onClick={props.displayController}>
              <Typography variant="h6">&#10005;</Typography>
            </Box>
          </Box>
          {_renderCategories(
            props.layerDict,
            props._onToggleLayer,
            props.activeLayers,
            "mainLayer"
          )}
        </Box>
      )}
    </>
  );
}

function _renderCategories(layerDict, _onToggleLayer, activeLayers) {
  return Object.keys(layerDict).map((layerCategory) => {
    const layers = layerDict[layerCategory];
    if (!layers.length) {
      return (
        <Box
          key={layerCategory}
          sx={{
            borderBottom: "0.5px solid grey",
            mb: "1rem",
            "&:last-child": { borderBottom: "none" },
          }}
        >
          <Typography variant="h6">{layerCategory}</Typography>
          {_renderCategories(
            layers,
            _onToggleLayer,
            activeLayers,
            "nestedLayer"
          )}
        </Box>
      );
    } else {
      return (
        <Box key={layerCategory}>
          <Typography variant="subtitle1">
            <strong>{layerCategory}</strong>
          </Typography>

          {Object.values(layers).map((layer) => {
            return (
              <Box key={layer.props.id} id={layer.props.id}>
                <LayerToggler
                  layerID={layer.props.id}
                  layerLabel={layer.props.label}
                  activeLayers={activeLayers}
                  _toggleLayer={_onToggleLayer}
                ></LayerToggler>
              </Box>
            );
          })}
        </Box>
      );
    }
  });
}

function LayerToggler(props) {
  return (
    <Box>
      <Box>
        <Checkbox
          id={props.layerID}
          checked={props.activeLayers[props.layerID]}
          onChange={() => props._toggleLayer(props.layerID)}
          color="primary"
        />
        <label htmlFor={props.layerLabel}>
          <span>{props.layerLabel}</span>
        </label>
      </Box>
    </Box>
  );
}

export default LayerSelector;
