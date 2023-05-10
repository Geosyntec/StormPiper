import { Box, InputAdornment, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import SearchIcon from "@mui/icons-material/Search";
import debounce from "lodash.debounce";

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
    searchResultsSetter(results);
  }

  const update = debounce(_do_search, 200, { maxWait: 1000 });

  useEffect(() => {
    update(searchTerm);
  }, [searchField, searchTerm]);

  const handleChange = (event) => {
    const searchFor = event.target.value.trim();
    setSearchTerm(searchFor);
  };

  return (
    <Box sx={{ width: "100%" }} {...props}>
      <TextField
        fullWidth
        size="small"
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
