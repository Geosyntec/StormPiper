import { useState, useEffect } from "react";

import { Box, TextField, MenuItem, Button } from "@mui/material";
import { GeoJsonLayer } from "@deck.gl/layers";

import SearchBar from "./search-bar";
import { activeLocalSWFacility as tmnt } from "../../assets/geojson/coreLayers";
import { api_fetch, colorToList } from "../../utils/utils";

export function ExplorerSearch({ setLayers, ...props }) {
  const searchFieldOptions = [
    { name: "altid", label: "altid/node_id" },
    { name: "facilitytype", label: "Facility Type" },
    { name: "facility_type", label: "Facility Type (WQ Modeling)" },
  ];

  const [searchField, setSearchField] = useState(searchFieldOptions[0].name);
  const [tmntFacilityData, setTmntFacilityData] = useState([]);
  const [tmntFacilityGeojson, setTmntFacilityGeojson] = useState(null);
  const [searchResults, setSearchResults] = useState([]);

  async function _fetch_tmnt_facility_data() {
    const response = await api_fetch("/api/rest/tmnt_facility?f=geojson");
    if (response.status < 400) {
      const geojson = await response.json();
      console.log(geojson);
      setTmntFacilityData(geojson.features.map((f) => f.properties));
      setTmntFacilityGeojson(geojson);
    } else {
      response.status >= 400 &&
        console.warning("unable to fetch", await response.content());
    }
  }

  useEffect(() => {
    _fetch_tmnt_facility_data();
  }, []);

  function _handleSearchResults(data) {
    console.log("found some data", data);
    setSearchResults(data);
  }

  function filterFacilitiesGeojson() {
    if (tmntFacilityGeojson == null) return;

    const matchedValues = searchResults.map((k) =>
      `${k?.[searchField]}`.toLowerCase()
    );

    const features = tmntFacilityGeojson.features.filter((f) =>
      matchedValues.includes(`${f.properties?.[searchField]}`.toLowerCase())
    );

    return {
      bbox: tmntFacilityGeojson?.bbox,
      features,
      type: "FeatureCollection",
    };
  }
  function _renderFoundLayer() {
    const facilityLayerFound = new GeoJsonLayer({
      ...tmnt.props,
      id: "facilitiesFound",
      label: "Facilities Found",
      data: filterFacilitiesGeojson(),
      getIconColor: colorToList("yellow"),
      getIconSize: 30,
      pickable: false,
    });
    setLayers([facilityLayerFound]);
  }

  useEffect(() => {
    _renderFoundLayer();
  }, [searchField, searchResults]);

  const handleInputChange = (e) => {
    setSearchResults([]);
    const { name, value } = e.target;
    setSearchField(value);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
      }}
      {...props}
    >
      <Box sx={{ mx: 2, width: "100%", flexGrow: 1 }}>
        <TextField
          fullWidth
          label="Search By"
          type={"text"}
          required
          value={searchField}
          select
          onChange={handleInputChange}
        >
          {searchFieldOptions.map((option) => (
            <MenuItem key={option.name} value={option.name}>
              {option?.label || option.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <SearchBar
        searchField={searchField}
        searchBlob={tmntFacilityData}
        searchResultsSetter={_handleSearchResults}
        sx={{ mx: 2, width: "100%" }}
      />
      <Button variant="contained" onClick={_renderFoundLayer}>
        Search
      </Button>
    </Box>
  );
}
