import { Checkbox, Box, Typography } from "@mui/material";

function LayerSelector(props) {
  return (
    <>
      {props.displayStatus && (
        <Box>
          <Box
            sx={{
              mb: 1,
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          ></Box>
          {_renderCategories(
            props.layerDict,
            props._onToggleLayer,
            props.activeLayers,
            props.displayController
          )}
        </Box>
      )}
    </>
  );
}

function _renderCategories(
  layerDict,
  _onToggleLayer,
  activeLayers,
  displayController
) {
  return Object.keys(layerDict).map((layerCategory, idx) => {
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
          {idx === 0 && (
            <Box
              sx={{ cursor: "pointer", float: "right" }}
              onClick={displayController}
            >
              <Typography variant="h6">&#10005;</Typography>
            </Box>
          )}
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
    <Box sx={{ display: "flex" }}>
      <Box>
        <Checkbox
          id={props.layerID}
          checked={props.activeLayers[props.layerID]}
          onChange={() => props._toggleLayer(props.layerID)}
          color="primary"
          sx={{ pt: 0 }}
        />
      </Box>
      <Box sx={{ alignSelf: "start" }}>
        <label htmlFor={props.layerLabel}>
          <span>{props.layerLabel}</span>
        </label>
      </Box>
    </Box>
  );
}

export default LayerSelector;
