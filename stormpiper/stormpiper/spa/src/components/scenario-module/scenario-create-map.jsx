import DeckGLMap from "../map";
import { EditableGeoJsonLayer } from "nebula.gl";
import { Box } from "@mui/material";
import {
  activeLocalSWFacility as tmnt,
  delineations,
} from "../../assets/geojson/coreLayers";

export default function ScenarioCreateMap({
  facilityEditMode,
  delineationEditMode,
  facility,
  facilitySetter,
  delineation,
  delineationSetter,
}) {
  console.log("Rendering facility layer: ", facility);
  console.log("Rendering delineation layer: ", delineation);
  const facilityLayer = new EditableGeoJsonLayer({
    ...tmnt.props,
    id: "userPoints",
    label: "User Points",
    data: facility,
    selectedFeatureIndexes: [],
    mode: facilityEditMode,
    onEdit: ({ updatedData, editType }) => {
      console.log("update: ", updatedData);
      if (editType === "addFeature" && updatedData.features.length > 1) {
        facilitySetter({
          type: "FeatureCollection",
          features: [
            {
              ...updatedData.features[0],
              geometry: updatedData.features[1].geometry,
            },
          ],
        });
      } else {
        facilitySetter(updatedData);
      }
    },
  });

  const delineationLayer = new EditableGeoJsonLayer({
    ...delineations.props,
    id: "userDelineations",
    label: "User Delineations",
    data: delineation,
    selectedFeatureIndexes: [],
    mode: delineationEditMode,
    onEdit: ({ updatedData, editType }) => {
      if (editType === "addFeature") {
        //When there are no existing features, simply update
        //When there is an existing feature, that must mean that the user entered a delineation name,
        //  so we need to merge that with the new feature's geometry
        if (delineation.features.length === 0) {
          delineationSetter(updatedData);
        } else {
          delineationSetter({
            type: "FeatureCollection",
            features: [
              {
                geometry: { ...updatedData.features[1].geometry },
                properties: { ...updatedData.features[0].properties },
              },
            ],
          });
        }
      } else {
        console.log("hello: ", delineation);
        delineationSetter({
          type: "FeatureCollection",
          // features: [],
          features: [
            {
              properties: { ...delineation.features[0].properties },
              geometry: {},
            },
          ],
        });
      }
    },
  });

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflowY: "hidden",
      }}
    >
      <DeckGLMap
        id="scenario-map"
        context="default"
        layers={[facilityLayer, delineationLayer]}
      ></DeckGLMap>
    </Box>
  );
}
