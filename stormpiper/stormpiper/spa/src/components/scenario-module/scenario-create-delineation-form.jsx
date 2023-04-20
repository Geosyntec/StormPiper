import { useState, forwardRef, useImperativeHandle } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Box, Button, TextField, Typography } from "@mui/material";
import { api_fetch } from "../../utils/utils";

export const ScenarioDelineationForm = forwardRef(
  function ScenarioDelineationForm({ delineationSetter, delineation }, ref) {
    const {
      register,
      handleSubmit,
      formState: { errors },
      trigger,
      getValues,
    } = useForm();
    // const delineation = scenarioObject?.input?.delineation_collection || null;
    console.log("Inside delineation form, delineation = ", delineation);
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const fields = [
      {
        fieldID: "delinName",
        label: "Delineation Name",
        type: "text",
        required: true,
        value: delineation?.features[0]?.properties?.name || "",
      },
    ];

    useImperativeHandle(
      ref,
      () => {
        return {
          async triggerValidation(delineation) {
            const isFormValid = await trigger();
            const doesPolygonExist =
              delineation?.features.length > 0 &&
              delineation.features[0].geometry;
            console.log("Validating delineation: ", delineation);
            console.log("Delineation form valid?: ", isFormValid);
            console.log("Delineation drawn?", doesPolygonExist);
            return isFormValid && doesPolygonExist;
          },

          async resetForm() {
            delineationSetter(null);
            // delineationSetter({
            //   type: "FeatureCollection",
            //   features: [],
            // });
          },

          setName(delineation) {
            delineationSetter({
              type: "FeatureCollection",
              features: [
                {
                  ...delineation.features[0],
                  properties: { name: getValues("delinName") },
                },
              ],
            });
          },
        };
      },
      []
    );

    function setDelineationName(e) {
      delineation?.features?.length > 0
        ? delineationSetter({
            type: "FeatureCollection",
            features: [
              {
                ...delineation.features[0],
                properties: { name: e.target.value },
              },
            ],
          })
        : delineationSetter({
            type: "FeatureCollection",
            features: [
              {
                properties: { name: e.target.value },
              },
            ],
          });
    }

    function _renderFormFields() {
      let fieldDiv = Object.values(fields).map((formField) => {
        return (
          <Box key={formField.fieldID} sx={{ width: "300" }}>
            {
              <TextField
                {...register(formField.fieldID, {
                  required: formField.required,
                })}
                label={formField.label}
                type={formField.type}
                defaultValue={formField.value}
                required={formField.required}
                margin="dense"
                onChange={(e) => {
                  console.log("Updating delineation from form: ", delineation);
                  setDelineationName(e);
                }}
                fullWidth
              />
            }
            {errors[formField.name] && (
              <Typography
                variant="caption"
                sx={{ color: (theme) => theme.palette.warning.main }}
              >
                {errors[formField.name]?.message}
              </Typography>
            )}
          </Box>
        );
      });
      return fieldDiv;
    }

    function _handleSubmit(data) {
      delineationSetter({
        type: "FeatureCollection",
        features: [
          { ...delineation.features[0], properties: { name: data.name } },
        ],
      });
    }

    return (
      <Box>
        {/* <Typography variant="subtitle1" align="left">
          Delineation Editor
        </Typography> */}
        <Box
          sx={{
            margin: "1em",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <form onSubmit={handleSubmit(_handleSubmit)}>
            {_renderFormFields()}

            {/* <Box sx={{ mt: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Button variant="contained" color="primary" type="submit">
                  Save
                </Button>
              </Box>
            </Box> */}

            {/* {error && (
              <Box
                sx={{ my: "2rem", display: "flex", justifyContent: "start" }}
              >
                <Typography
                  variant="caption"
                  align="left"
                  color={(theme) => theme.palette.warning.main}
                >
                  Something went wrong - please try again
                </Typography>
              </Box>
            )}
            {success && (
              <Box
                sx={{ my: "2rem", display: "flex", justifyContent: "start" }}
              >
                <Typography
                  variant="caption"
                  align="left"
                  color={(theme) => theme.palette.success.main}
                >
                  Name Saved
                </Typography>
              </Box>
            )} */}
          </form>
        </Box>
      </Box>
    );
  }
);
