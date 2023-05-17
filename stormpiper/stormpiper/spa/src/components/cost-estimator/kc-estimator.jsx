import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { styled } from "@mui/material/styles";
import {
  Box,
  TextField,
  MenuItem,
  Typography,
  Grid,
  Paper,
} from "@mui/material";

import KCdata from "../../assets/data/kc_cost_table.json";

const TACOMA_TYPES = [...new Set(KCdata.map((k) => k.tacoma_type))];
const TACOMA_TYPE_OPTIONS = TACOMA_TYPES.map((k) => {
  return { value: k, label: k };
});
const KC_VARIATIONS = [...new Set(KCdata.map((k) => k.description))];
const KC_VARIATION_OPTIONS = KC_VARIATIONS.map((k) => {
  return { value: k, label: k, bold: false };
});

const BMPTYPE_TO_TACOMA_TYPE = {
  bioretention_with_partial_infiltration: "Bioretention",
  bioretention_with_no_infiltration: "Bioretention",
  bioretention_with_full_infiltration: "Bioretention",
  media_filter: "Media Filter",
  oil_water_separator: "Oil Water Separator",
  pervious_pavement: "Pervious Pavement",
  wet_pond: "Pond",
  sand_filter: "Sand Filter",
  vegetated_swale: "Swale",
  hydrodynamic_separator: "Swirl Separator",
  flow_duration_control_tank: "Tank",
  dry_extended_detention: "Tank",
  infiltration: "Trench",
  vault: "Vault",
  vegetated_box: "Vegetated Box",
};

function getVariationOpts(bmp_type) {
  const opts = [
    ...new Set(
      KCdata.filter((k) => bmp_type === k.tacoma_type).map((k) => k.description)
    ),
  ];
  return opts;
}

function getKCEntry(bmp_variation) {
  const entry = KCdata.find((k) => k.description === bmp_variation);

  return entry;
}

function calculateCost(kcEntry, scaler) {
  const result = {
    ...kcEntry,
    scaler: parseFloat(scaler),
    capital_cost: (kcEntry?.totalcapital_cpu || 0) * parseFloat(scaler),
    om_cost_per_yr: (kcEntry?.om_cpu || 0) * parseFloat(scaler),
  };

  return result;
}

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === "dark" ? "#1A2027" : "#fff",
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: "center",
  color: theme.palette.text.secondary,
}));

export default function KCCostEstimator({ initialBMPType, getResult }) {
  getResult =
    getResult ||
    function (res) {
      console.log(res);
    };

  const taco_type = initialBMPType
    ? BMPTYPE_TO_TACOMA_TYPE?.[initialBMPType.replace("_simple", "")]
    : "Bioretention";

  const [bmpType, setBMPType] = useState(
    TACOMA_TYPES.includes(taco_type) ? taco_type : "Bioretention"
  );

  const [bmpVariationOptions, setBMPVariationOptions] =
    useState(KC_VARIATION_OPTIONS);
  const [bmpVariation, setBMPVariation] = useState(
    getVariationOpts(bmpType)[0]
  );

  const [kcEntry, setKCEntry] = useState(getKCEntry(bmpVariation));
  const [scaler, setScaler] = useState(0);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const opts = getVariationOpts(bmpType);
    setBMPVariationOptions(
      KC_VARIATION_OPTIONS.map((k) => {
        k.bold = opts.includes(k.value);
        return k;
      })
    );
    setBMPVariation(opts[0]);
  }, [bmpType]);

  useEffect(() => {
    const entry = getKCEntry(bmpVariation);
    setKCEntry({ ...entry });
  }, [bmpVariation]);

  useEffect(() => {
    setResult({ ...calculateCost(kcEntry, scaler) });
  }, [kcEntry, scaler]);

  useEffect(() => {
    getResult(result);
  }, [result]);

  const { register } = useForm();

  const fields = [
    {
      fieldID: "tacoma_type",
      label: "BMP Type",
      defaultValue: bmpType,
      select: true,
      options: TACOMA_TYPE_OPTIONS,
      onChange: handleTacomaTypeInputChange,
    },
    {
      fieldID: "kc_variation",
      label: "KC BMP Variation",
      type: "text",
      select: true,
      defaultValue: bmpVariation,
      options: bmpVariationOptions,
      onChange: handleBMPVariationInputChange,
    },
  ];

  function handleTacomaTypeInputChange(e) {
    setBMPType(e.target.value);
  }

  function handleBMPVariationInputChange(e) {
    setBMPVariation(e.target.value);
  }

  function handleScalerInputChange(e) {
    e.target.value && setScaler(parseFloat(e.target.value));
  }

  function _renderPickers() {
    let fieldDiv = Object.values(fields).map((formField) => {
      return (
        <Box key={formField.fieldID}>
          <TextField
            fullWidth
            margin="normal"
            {...register(formField.fieldID, { ...formField })}
            label={formField.label}
            type={formField?.type ?? "text"}
            required={formField?.required ?? false}
            value={formField?.defaultValue || ""}
            InputProps={formField?.InputProps}
            disabled={formField?.disabled ?? false}
            select={formField?.select || false}
            onChange={
              formField.onChange ??
              function (e) {
                console.log(e.target.value);
              }
            }
            // {...formField}
          >
            {formField?.options?.map((option, i) => (
              <MenuItem
                key={option.value}
                value={option.value}
                sx={{
                  fontWeight: option?.bold ? "bold" : "normal",
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        </Box>
      );
    });
    return fieldDiv;
  }

  return (
    <Box>
      {kcEntry && (
        <>
          <Box>{_renderPickers()}</Box>
          <TextField
            margin="normal"
            {...register("scaler")}
            label={`${kcEntry.sizing_method} (${kcEntry.sizing_unit}) `}
            type={"number"}
            required={true}
            value={scaler}
            onChange={handleScalerInputChange}
          ></TextField>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">
              King County Cost Estimates (2023)
            </Typography>

            <Grid
              container
              spacing={{ xs: 2, md: 3 }}
              columns={2}
              sx={{ py: 2 }}
            >
              {result &&
                [
                  { field: "capital_cost", title: "Capital Cost" },
                  { field: "om_cost_per_yr", title: "O&M Cost" },
                ].map((d, index) => {
                  const value = result[d.field];
                  return (
                    <Grid item key={index} xs={1}>
                      <Item>
                        <Typography fontWeight="bold"> {d.title} </Typography>
                        <Typography> {`${value}`} </Typography>
                      </Item>
                    </Grid>
                  );
                })}
            </Grid>
          </Box>
        </>
      )}
    </Box>
  );
}
