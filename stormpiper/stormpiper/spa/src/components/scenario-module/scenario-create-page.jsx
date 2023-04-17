import { Card, Button, Typography } from "@mui/material";

import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import ScenarioCreateMap from "./scenario-create-map";
import {
  DrawPolygonMode,
  DrawPointMode,
  ViewMode,
  ModifyMode,
  TranslateMode,
  Editor,
} from "nebula.gl";
import { useEffect, useState, useRef } from "react";
import { ScenarioCreateStepper } from "./scenario-create-stepper";
import { useNavigate } from "react-router-dom";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { api_fetch } from "../../utils/utils";

export default function ScenarioCreatePage({ setDrawerButtonList }) {
  const navigate = useNavigate();
  const buttonList = [
    // {
    //   label: "Create a BMP",
    //   icon: <RadioButtonCheckedIcon />,
    //   clickHandler: toggleFacilityDrawMode,
    // },
    // {
    //   label: "Create a Delineation",
    //   icon: <DashboardIcon />,
    //   clickHandler: toggleDelineationDrawMode,
    // },
    {
      label: "View All Scenarios",
      icon: <ListAltIcon />,
      clickHandler: () => navigate("/app/scenario"),
    },
  ];

  useEffect(() => {
    setDrawerButtonList(buttonList);
  }, []);

  const [facilityEditMode, setFacilityEditMode] = useState(() => ViewMode);
  const [delineationEditMode, setDelineationEditMode] = useState(
    () => ViewMode
  );

  const [facility, setFacility] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [delineation, setDelineation] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [scenarioObject, setScenarioObject] = useState({
    name: "",
    info: {
      description: null,
      purpose: null,
    },
    input: {
      delineation_collection: null,
      tmnt_facility_collection: null,
    },
  });

  console.log("Current Scenario: ", scenarioObject);

  function toggleViewMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleFacilityDrawMode() {
    console.log("Toggling facility edit mode");
    setFacilityEditMode(() => DrawPointMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleDelineationDrawMode() {
    console.log("Toggling delineation draw mode");
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => DrawPolygonMode);
  }
  function toggleDelineationEditMode() {
    console.log("Toggling delineation edit mode");

    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ModifyMode);
  }
  function toggleFacilityEditMode() {
    setFacilityEditMode(() => new ModifyMode());
    setDelineationEditMode(() => ViewMode);
  }

  function updateFacility(facility) {
    console.log("Trying to update facility: ", facility);
    let delineationToUpdate = { ...delineation };
    if (facility.features[0] && delineation?.features.length > 0) {
      delineation.features[0].properties["relid"] =
        facility.features[0].properties["node_id"];
    }
    setFacility(facility);
    setScenarioObject({
      ...scenarioObject,
      input: {
        delineation_collection: delineationToUpdate,
        tmnt_facility_collection: facility,
      },
    });
  }
  function updateDelineation(delineation) {
    console.log("Updating delineation:", delineation);
    setDelineation(delineation);
    setScenarioObject({
      ...scenarioObject,
      input: {
        ...scenarioObject.input,
        delineation_collection: delineation,
      },
    });
  }

  function updateScenario(field, value) {
    let scenarioToUpdate = { ...scenarioObject };
    switch (field) {
      case "purpose":
      case "description":
        scenarioToUpdate.info[field] = value;
        break;
      default:
        scenarioToUpdate[field] = value;
        break;
    }
    setScenarioObject(scenarioToUpdate);
  }

  async function _handleSubmit() {
    const formData = {
      ...scenarioObject,
    };
    console.log("Submitting scenario: ", formData);
    const response = await api_fetch("/api/rest/scenario", {
      credentials: "same-origin",
      headers: {
        accept: "application/json",
        "Content-type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(formData),
    })
      .then((resp) => resp.json())
      .then((resp) => {
        console.log("response body: ", resp);
        if (resp.id) {
          navigate(`/app/scenario/${resp.id}`);
        } else {
          console.warn("submission failure", resp);
        }
      });

    return response;
  }

  return (
    <TwoColGrid>
      <HalfSpan>
        <Card
          sx={{
            display: "flex",
            height: "85vh",
            alignItems: "start",
            justifyContent: "center",
          }}
        >
          <ScenarioCreateStepper
            scenarioObject={scenarioObject}
            scenarioSetter={updateScenario}
            delineation={delineation}
            delineationSetter={updateDelineation}
            delineationDrawToggler={toggleDelineationDrawMode}
            facility={facility}
            facilitySetter={updateFacility}
            facilityDrawToggler={toggleFacilityDrawMode}
            viewModeToggler={toggleViewMode}
            handleSubmit={_handleSubmit}
          />
        </Card>
      </HalfSpan>
      <HalfSpan>
        <Card
          sx={{
            display: "flex",
            height: "85vh",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ScenarioCreateMap
            facilityEditMode={facilityEditMode}
            delineationEditMode={delineationEditMode}
            facility={facility}
            facilitySetter={updateFacility}
            facilityEditToggler={toggleFacilityEditMode}
            delineation={delineation}
            delineationSetter={updateDelineation}
            delineationEditToggler={toggleDelineationEditMode}
            delineationDrawToggler={toggleDelineationDrawMode}
          />
        </Card>
      </HalfSpan>
    </TwoColGrid>
  );
}
