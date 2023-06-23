import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@mui/material";
import ListAltIcon from "@mui/icons-material/ListAlt";
import { TwoColGrid, HalfSpan } from "../base/two-col-grid";
import ScenarioCreateMap from "./scenario-create-map";
import { ScenarioCreateStepper } from "./scenario-create-stepper";
import { api_fetch } from "../../utils/utils";

export default function ScenarioCreatePage({ setDrawerButtonList }) {
  const navigate = useNavigate();
  const buttonList = [
    {
      label: "View All Scenarios",
      icon: <ListAltIcon />,
      link: "/app/scenario",
    },
  ];

  const [showFacilityEditTabs, setShowFacilityEditTabs] = useState(false);
  const [showdelineationEditTabs, setShowDelineationEditTabs] = useState(false);

  const [facility, setFacility] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [delineation, setDelineation] = useState({
    type: "FeatureCollection",
    features: [],
  });
  const [mapMode, setMapMode] = useState("default");
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

  useEffect(() => {
    setDrawerButtonList(buttonList);
  }, []);

  function updateFacility(facility) {
    console.log("Trying to update facility: ", facility);
    let delineationToUpdate = delineation ? { ...delineation } : null;
    if (facility?.features[0] && delineation?.features.length > 0) {
      delineation.features[0].properties["relid"] =
        facility?.features[0].properties["node_id"];
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
    // Check if there is a facility, and then add relid
    if (facility?.features[0] && delineation?.features.length > 0) {
      delineation.features[0].properties["relid"] =
        facility?.features[0].properties["node_id"];
    }
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
    const formData = { ...scenarioObject };
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
            height: "100%",
            alignItems: "start",
            justifyContent: "center",
            p: 3,
          }}
        >
          <ScenarioCreateStepper
            scenarioObject={scenarioObject}
            scenarioSetter={updateScenario}
            delineation={delineation}
            delineationSetter={updateDelineation}
            delineationDrawToggler={() => {
              console.log("inside delin draw toggler");
              setMapMode("drawDelineation");
              setShowDelineationEditTabs(true);
              setShowFacilityEditTabs(false);
            }}
            facility={facility}
            facilitySetter={updateFacility}
            facilityDrawToggler={() => {
              console.log("inside facility draw toggler");
              setMapMode("drawFacility");
              setShowDelineationEditTabs(false);
              setShowFacilityEditTabs(true);
            }}
            viewModeToggler={() => setMapMode("default")}
            handleSubmit={_handleSubmit}
          />
        </Card>
      </HalfSpan>
      <HalfSpan>
        <Card
          sx={{
            display: "flex",
            height: { xs: 500, md: "calc(100vh - 150px)" },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <ScenarioCreateMap
            mapMode={mapMode}
            setMapMode={setMapMode}
            facility={facility}
            facilitySetter={updateFacility}
            delineation={delineation}
            delineationSetter={updateDelineation}
            showDelinEditTabs={showdelineationEditTabs}
            showFacilityEditTabs={showFacilityEditTabs}
            editorMode={false}
          />
        </Card>
      </HalfSpan>
    </TwoColGrid>
  );
}
