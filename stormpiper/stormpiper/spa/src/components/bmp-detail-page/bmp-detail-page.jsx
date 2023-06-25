import { Box, Card, Button } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { BMPDetailResults } from "./bmp-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import BMPDetailMap from "./bmp-detail-map";
import { BMPDetailForm } from "./bmp-detail-form";
import {
  api_fetch,
  exportCSVFile,
  convertToCSV,
  transposeObject,
  sortResultsArray,
} from "../../utils/utils";
import { zoomToFeature } from "../../utils/map_utils";
import ResultRefreshBox from "../resultRefreshBox";
import { all_cols as volumeCols } from "./bmp-results-volume";
import { all_cols as concCols } from "./bmp-results-conc";
import { all_cols as loadCols } from "./bmp-results-load";

async function getFacility(id) {
  console.log("Looking for: ", id);
  const response = await api_fetch(
    `/api/rest/tmnt_facility/?f=geojson&node_id=${id}`
  );
  const data = await response.json();
  const facility = data?.features?.find((feature) => {
    return feature.properties.altid === id;
  });
  return facility;
}
async function getDelineation(id) {
  console.log("Looking for delineation: ", id);
  const response = await api_fetch(
    `/api/rest/tmnt_delineation?f=geojson&relid=${id}`
  );
  const data = await response.json();
  const delineation = data?.features?.find((feature) => {
    return feature.properties.relid === id;
  });
  console.log("Found delineation: ", delineation, data, delineation?.bbox);

  return delineation;
}

export default function BMPDetailPage() {
  const params = useParams();
  const [zoomFeature, setZoomFeature] = useState(null);
  const [facility, setFacility] = useState(null);
  const [bmpResults, setBMPResults] = useState(null);
  const [delineation, setDelineation] = useState(null);
  const [viewState, setViewState] = useState(null);

  async function getResultsDataByID() {
    const res_response = await api_fetch(
      `/api/rest/results/${params.id}?epoch=all`
    );
    if (res_response.status <= 400) {
      const res = await res_response.json();
      setBMPResults(res);
    }
  }

  useEffect(async () => {
    getResultsDataByID();
    setTimeout(async () => {
      const facility_res = await getFacility(params.id);
      facility_res && setFacility(facility_res);

      const delin_res = await getDelineation(params.id);
      delin_res && setDelineation(delin_res);

      const _zoomFeature = delin_res || facility_res || null;
      setZoomFeature(_zoomFeature);
      setViewState(
        zoomToFeature({
          feature: _zoomFeature,
          transitionInterpolator: null,
          transitionDuration: 0,
        })
      );
    }, 200);
  }, [params.id]);

  function createResultsCSV() {
    if (!bmpResults) {
      return "Not Available\r\n";
    }
    let sortedFields = Array.from(
      new Set([...volumeCols, ...concCols, ...loadCols]).values()
    );

    const sortedResults = convertToCSV(
      sortResultsArray(
        bmpResults,
        new Set([...volumeCols, ...concCols, ...loadCols])
      ),
      sortedFields
    );

    return sortedResults;
  }
  function createTmntCSV() {
    if (!facility.properties) {
      return "Not Available\r\n";
    }

    let tmntProperties = { ...facility.properties };
    delete tmntProperties["present_value_cost_table"]; //remove nested objects
    delete tmntProperties["present_value_chart_table"];

    let sortedTmntFields = Array.from(
      new Set([
        "node_id",
        "facilitytype",
        ...Object.keys(tmntProperties),
      ]).values()
    );

    const sortedResults = convertToCSV(
      transposeObject(sortResultsArray(tmntProperties, sortedTmntFields)[0]),
      ["BMP Attribute", "Value"]
    );

    return sortedResults;
  }

  function createCostSummaryCSV() {
    if (!facility.properties) {
      return "Not Available\r\n";
    }
    if (!facility.properties["present_value_cost_table"]) {
      return "Not Available\r\n";
    }

    const costTable = facility.properties["present_value_cost_table"];

    return convertToCSV(costTable, Object.keys(costTable[0]));
  }

  function exportBMPDetails() {
    const date = new Date().toLocaleString("en-US", {
      dateStyle: "short",
    });
    const header = `BMP Detailed Report for ${params.id}\r\nExported ${date}\r\n`;
    const buffer = "////////////////////////////////////////\r\n";
    const finalCSV = [
      header,
      "BMP WQ and Cost Details\r\n",
      createTmntCSV(),
      "BMP Present Value Cost Summary\r\n",
      createCostSummaryCSV(),
      "BMP WQ Results by Climate Epoch\r\n",
      createResultsCSV(),
    ].join(buffer);
    exportCSVFile(finalCSV, `${params.id}_bmp_details_${date}`);
  }

  return (
    <>
      <TwoColGrid>
        <HalfSpan>
          <Card sx={{ display: "flex", p: 3, height: "100%" }}>
            <Box sx={{ width: "100%" }}>
              <BMPDetailForm />
            </Box>
          </Card>
        </HalfSpan>
        <HalfSpan>
          <Card
            sx={{
              display: "flex",
              minHeight: 500,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <BMPDetailMap
              facility={facility}
              delineation={delineation}
              viewState={viewState}
            />
          </Card>
          <Card sx={{ p: 2, my: 2 }}>
            <ResultRefreshBox
              refreshHandler={getResultsDataByID}
              sx={{ alignItems: "start" }}
            />
            <Button
              variant="contained"
              onClick={() => exportBMPDetails()}
              sx={{ width: "100%" }}
            >
              Export Results
            </Button>
          </Card>
        </HalfSpan>
        <FullSpan>
          <BMPDetailResults data={bmpResults} />
        </FullSpan>
      </TwoColGrid>
    </>
  );
}
