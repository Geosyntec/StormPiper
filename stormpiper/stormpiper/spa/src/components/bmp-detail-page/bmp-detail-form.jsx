import React, { useEffect, useState } from "react";
import { api_fetch } from "../../utils/utils";
import { BMPForm } from "../bmpForm";
import { useParams } from "react-router-dom";

export function BMPDetailForm() {
  const params = useParams();
  const [specs, setSpecs] = useState({
    context: {},
    facilitySpec: {},
  });
  const [facilityType, setFacilityType] = useState("");
  const [loadingState, setLoadingState] = useState(true);
  const [TMNTAttrs, setTMNTAttrs] = useState({});

  useEffect(() => {
    if (!params.id) return;

    // OpenAPI spec holds the base facility types used by nereid
    // Context endpoint holds mapping between project-specific names and base types
    let resources = [
      "/openapi.json",
      "/api/rest/reference/context",
      "/api/rest/tmnt_facility/" + params.id,
    ];

    setLoadingState(true);

    Promise.all(
      resources.map((url) => api_fetch(url).then((res) => res.json()))
    )
      .then((resArray) => {
        setSpecs({
          facilitySpec: resArray[0].components.schemas,
          context: resArray[1].api_recognize.treatment_facility.facility_type,
        });
        setFacilityType(resArray[2].facility_type);
        setTMNTAttrs(resArray[2]);
      })
      .then(() => {
        console.log("tmnt: ", TMNTAttrs);
        setLoadingState(false);
      });
  }, []);

  function renderForm() {
    if (loadingState) {
      return <p>loading...</p>;
    } else {
      let fType = facilityType;
      let fTypeRoot = fType.replace("_simple", "");

      let simpleBaseType;
      if (fType === "no_treatment") {
        simpleBaseType = specs.context[fTypeRoot].validator; //no_treatment has no simple equivalent
      } else {
        simpleBaseType = specs.context[fTypeRoot + "_simple"].validator;
      }
      let baseType = specs.context[fTypeRoot].validator;

      let facilityFields = specs.facilitySpec[baseType];
      let simpleFacilityFields = specs.facilitySpec[simpleBaseType];
      return (
        <BMPForm
          allFields={facilityFields}
          simpleFields={simpleFacilityFields}
          values={TMNTAttrs}
          allFacilities={specs.context}
          currentFacility={facilityType}
          facilityChangeHandler={setFacilityType}
        ></BMPForm>
      );
    }
  }

  return (
    <>
      {/* {_renderUpdateBox()} */}
      {!loadingState && renderForm()}
    </>
  );
}
