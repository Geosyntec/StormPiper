import { Box, InputAdornment, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";

export default function SearchBar({
  searchField,
  searchBlob,
  searchResultsSetter,
  ...props
}) {
  const [searchTerm, setSearchTerm] = useState("");

  function _do_search(searchFor) {
    const results =
      searchFor != ""
        ? searchBlob.filter((k) =>
            `${k?.[searchField]}`
              .toLowerCase()
              .includes(searchFor.toLowerCase())
          )
        : [];

    console.log(searchFor, searchField, results);
    searchResultsSetter(results);
  }

  useEffect(() => {
    if (searchTerm == "") return;
    _do_search(searchTerm);
  }, [searchField, searchTerm]);

  const handleChange = (event) => {
    const searchFor = event.target.value.trim();
    setSearchTerm(searchFor);
  };

  return (
    <Box sx={{ width: "100%" }} {...props}>
      <TextField
        fullWidth
        id="search"
        type="search"
        label="Search"
        value={searchTerm}
        onChange={handleChange}
        sx={{ width: "100%" }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
