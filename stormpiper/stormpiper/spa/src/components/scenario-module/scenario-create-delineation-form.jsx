import { useState, forwardRef, useImperativeHandle } from "react";
import { useForm } from "react-hook-form";
import { Box, TextField, Typography } from "@mui/material";
import { useEffect } from "react";

export const ScenarioDelineationForm = forwardRef(
  function ScenarioDelineationForm(
    { delineationSetter, delineation, formDisabled },
    ref
  ) {
    const {
      register,
      handleSubmit,
      formState: { errors },
      trigger,
      getValues,
      reset,
    } = useForm();
    // const delineation = scenarioObject?.input?.delineation_collection || null;
    console.log("Inside delineation form, delineation = ", delineation);
    const disabled = formDisabled ?? false;
    const [error, setError] = useState(false);
    const [success, setSuccess] = useState(false);
    const fields = [
      {
        fieldID: "delinName",
        label: "Delineation Name",
        type: "text",
        required: true,
        // value: delineation?.features[0]?.properties?.name || "",
        value: delineation?.features[0]
          ? delineation.features[0].properties.name
          : "",
      },
    ];

    useEffect(() => {
      reset({
        delinName: delineation?.features[0]
          ? delineation.features[0].properties.name
          : "",
      });
    }, [delineation]);

    useImperativeHandle(
      ref,
      () => {
        return {
          async triggerValidation(delineation) {
            const isFormValid = await trigger();
            console.log("delin form values: ", getValues());
            console.log("delin form errors: ", Object.keys(errors));
            const doesPolygonExist =
              delineation?.features.length > 0 &&
              delineation.features[0].geometry.coordinates.length > 0;
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
      console.log("Building delin form fields: ", fields);
      let fieldDiv = Object.values(fields).map((formField) => {
        return (
          <Box key={formField.fieldID}>
            {
              <TextField
                {...register(formField.fieldID, {
                  required: formField.required,
                })}
                label={formField.label}
                type={formField.type}
                defaultValue={formField.value}
                required={formField.required}
                onChange={(e) => {
                  setDelineationName(e);
                }}
                fullWidth
                disabled={disabled}
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            py: 1,
          }}
        >
          <form
            onSubmit={handleSubmit(_handleSubmit)}
            style={{ width: "100%" }}
          >
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
