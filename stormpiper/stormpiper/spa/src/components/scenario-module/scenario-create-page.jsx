import { Card, Button, Typography } from "@mui/material";

import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import ScenarioCreateMap from "./scenario-create-map";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import DashboardIcon from "@mui/icons-material/Dashboard";
import { DrawPolygonMode, DrawPointMode, ViewMode } from "nebula.gl";
import { useEffect, useState, useRef } from "react";
import { ScenarioBMPForm } from "./scenario-bmp-detail-form";
import { ScenarioDelineationForm } from "./scenario-create-delineation-form";
import { ScenarioInfoForm } from "./scenario-create-info-form";
import { ScenarioCreateStepper } from "./scenario-create-stepper";
import { useNavigate } from "react-router-dom";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { api_fetch } from "../../utils/utils";

export default function ScenarioCreatePage({ setDrawerButtonList }) {
  const childRef = useRef(null);

  const navigate = useNavigate();
  const buttonList = [
    // {
    //   label: "Create a BMP",
    //   icon: <RadioButtonCheckedIcon />,
    //   clickHandler: toggleFacilityEditMode,
    // },
    // {
    //   label: "Create a Delineation",
    //   icon: <DashboardIcon />,
    //   clickHandler: toggleDelineationEditMode,
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

  function toggleViewMode() {
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleFacilityEditMode() {
    console.log("Toggling facility edit mode");
    setFacilityEditMode(() => DrawPointMode);
    setDelineationEditMode(() => ViewMode);
  }
  function toggleDelineationEditMode() {
    console.log("Toggling delineation edit mode");
    setFacilityEditMode(() => ViewMode);
    setDelineationEditMode(() => DrawPolygonMode);
  }

  function updateFacility(facility) {
    console.log("Trying to update facility: ", facility);
    let delineationToUpdate = null;
    if (facility.features[0]) {
      if (delineation?.features.length > 0) {
        delineationToUpdate = { ...delineation };
        delineation.features[0].properties["relid"] =
          facility.features[0].properties["node_id"];
      }
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
            delineationEditToggler={toggleDelineationEditMode}
            facility={facility}
            facilitySetter={updateFacility}
            facilityEditToggler={toggleFacilityEditMode}
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
            delineation={delineation}
            delineationSetter={updateDelineation}
          />
        </Card>
      </HalfSpan>
      {/* <HalfSpan>
        <Card
          sx={{
            display: "flex",
            height: "100%",
            minHeight: "200px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {facility?.features?.length > 0 ? (
            <ScenarioBMPForm
              facility={facility}
              facilityPropSetter={updateFacility}
            />
          ) : (
            <Typography variant="body1">Place a facility on the map</Typography>
          )}
        </Card>
      </HalfSpan>
      <HalfSpan>
        <Card
          sx={{
            display: "flex",
            height: "100%",
            minHeight: "200px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {delineation?.features?.length > 0 ? (
            <ScenarioDelineationForm
              delineationPropSetter={updateDelineation}
              delineation={delineation}
            />
          ) : (
            <Typography variant="body1">
              Place a delineation on the map
            </Typography>
          )}
        </Card>
      </HalfSpan> */}
    </TwoColGrid>
  );
}
