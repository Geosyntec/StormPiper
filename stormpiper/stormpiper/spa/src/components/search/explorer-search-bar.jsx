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
  const [matchedValues, setMatchedValues] = useState(null);

  async function _fetch_tmnt_facility_data() {
    const response = await api_fetch("/api/rest/tmnt_facility?f=geojson");
    if (response.status < 400) {
      const geojson = await response.json();
      setTmntFacilityData(geojson.features.map((f) => f.properties));
      setTmntFacilityGeojson(geojson);
    } else {
      response.status >= 400 &&
        console.error("unable to fetch", await response.content());
    }
  }

  useEffect(() => {
    _fetch_tmnt_facility_data();
  }, []);

  useEffect(() => {
    const matchedValues = searchResults.map((k) =>
      `${k?.[searchField]}`.toLowerCase()
    );
    setMatchedValues(matchedValues);
  }, [searchField, searchResults]);

  function isFound(f) {
    return matchedValues.includes(
      `${f.properties?.[searchField]}`.toLowerCase()
    );
  }

  function _refreshMap() {
    const facilityLayerFound = new GeoJsonLayer({
      ...tmnt.props,
      id: "facilitiesFound",
      label: "Facilities Found",
      data: tmntFacilityGeojson,
      getIconColor: (f) => (isFound(f) ? colorToList("yellow") : [0, 0, 0, 0]),
      pickable: false,
      updateTriggers: {
        getIconColor: [matchedValues],
      },
    });
    setLayers([facilityLayerFound]);
  }

  useEffect(() => {
    _refreshMap();
  }, [tmntFacilityGeojson, matchedValues]);

  function _handleSearchResults(data) {
    setSearchResults(data);
  }

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
          size="small"
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
      <Button variant="contained" onClick={_refreshMap}>
        Search
      </Button>
    </Box>
  );
}
