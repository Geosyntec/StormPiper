import { Checkbox, Box, Typography } from "@mui/material";
import LayersRoundedIcon from "@mui/icons-material/LayersRounded";

function LayerSelector(props) {
  return (
    <Box>
      {props.displayStatus ? (
        <Box sx={{ mb: "1rem", display: "flex", alignItems: "center" }}>
          <Typography variant="h4">Layers</Typography>
          <Box
            sx={{ position: "absolute", right: "12%", cursor: "pointer" }}
            onClick={props.displayController}
          >
            <Typography>&#10005;</Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 1 }}>
          <LayersRoundedIcon onClick={props.displayController} />
        </Box>
      )}

      {_renderCategories(
        props.layerDict,
        props._onToggleLayer,
        props.activeLayers,
        "mainLayer"
      )}
    </Box>
  );
}

function _renderCategories(
  layerDict,
  _onToggleLayer,
  activeLayers,
  layerLevel
) {
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
          <Typography variant="subtitle1">{layerCategory}</Typography>

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
