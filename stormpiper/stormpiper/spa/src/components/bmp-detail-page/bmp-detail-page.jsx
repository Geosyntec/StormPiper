import { Box, Card, Button, Snackbar } from "@mui/material";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

import { BMPDetailResults } from "./bmp-results";
import { TwoColGrid, FullSpan, HalfSpan } from "../base/two-col-grid";
import BMPDetailMap from "./bmp-detail-map";
import { BMPDetailForm } from "./bmp-detail-form";
import { api_fetch } from "../../utils/utils";
import { zoomToFeature } from "../../utils/map_utils";
import ResultRefreshBox from "../resultRefreshBox";

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
        </HalfSpan>
        <HalfSpan>
          <Box
            sx={{
              pb: 3,
            }}
          >
            <Card sx={{ padding: 2 }}>
              <ResultRefreshBox
                refreshHandler={getResultsDataByID}
                sx={{ alignItems: "start" }}
              />
            </Card>
          </Box>
        </HalfSpan>
        <FullSpan>
          <BMPDetailResults data={bmpResults} />
        </FullSpan>
      </TwoColGrid>
    </>
  );
}
