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
        return (
          <Box key={formField.fieldID}>
            {
              <TextField
                {...register(formField.fieldID, {
                  required: formField.required,
                })}
                label={formField.label}
                InputLabelProps={{
                  shrink: true,
                }}
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
            justifyContent: "flex-start",
            py: 1,
          }}
        >
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
