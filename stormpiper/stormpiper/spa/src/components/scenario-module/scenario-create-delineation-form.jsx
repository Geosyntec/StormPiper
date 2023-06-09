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
              delineation?.features[0]?.geometry?.coordinates?.length > 0;
            return isFormValid && doesPolygonExist;
          },

          async resetForm() {
            delineationSetter(null);
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
                type: "Feature",
              },
            ],
          })
        : delineationSetter({
            type: "FeatureCollection",
            features: [
              {
                properties: { name: e.target.value },
                type: "Feature",
              },
            ],
          });
    }

    function _renderFormFields() {
      console.log("Building delin form fields: ", fields);
      let fieldDiv = Object.values(fields).map((formField) => {
        const { ref: inputRef, ...inputProps } = register(formField.fieldID, {
          required: formField.required ? "This field is required" : false,
        });
        return (
          <Box key={formField.fieldID}>
            {
              <TextField
                inputRef={inputRef}
                label={formField.label}
                InputLabelProps={{
                  shrink: true,
                }}
                required={formField.required}
                type={formField.type}
                defaultValue={formField.value}
                fullWidth
                disabled={disabled}
                {...inputProps}
                onChange={(e) => {
                  setDelineationName(e);
                }}
              />
            }
            {errors[formField.fieldID] && (
              <Typography
                variant="caption"
                sx={{ color: (theme) => theme.palette.warning.main }}
              >
                {errors[formField.fieldID]?.message}
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
          {
            ...delineation.features[0],
            properties: { name: data.name },
            type: "Feature",
          },
        ],
      });
    }

    return (
      <Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
          }}
        >
          <Typography
            variant="body2"
            sx={{ mt: 1, mb: 4, pb: 1, borderBottom: "1px solid grey" }}
          >
            <strong>Draw a delineation on the map, and give it a name</strong>
          </Typography>
          <form
            onSubmit={handleSubmit(_handleSubmit)}
            style={{ width: "100%" }}
          >
            {_renderFormFields()}
          </form>
        </Box>
      </Box>
    );
  }
);
