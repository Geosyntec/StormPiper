import { useRef, useState } from "react";
import {
  Box,
  Step,
  Stepper,
  StepLabel,
  StepContent,
  Button,
  Grid,
  Typography,
  Snackbar,
} from "@mui/material";
import { ScenarioInfoForm } from "./scenario-create-info-form";
import { ScenarioDelineationForm } from "./scenario-create-delineation-form";
import { ScenarioBMPForm } from "./scenario-bmp-detail-form";

export function ScenarioCreateStepper({
  handleSubmit,
  scenarioObject,
  scenarioSetter,
  delineation,
  delineationSetter,
  delineationDrawToggler,
  facility,
  facilitySetter,
  facilityDrawToggler,
  viewModeToggler,
}) {
  const infoRef = useRef(null);
  const facilityRef = useRef(null);
  const delinRef = useRef(null);
  const steps = [
    {
      label: "Enter Basic Info",
      stepComponent: (
        <ScenarioInfoForm
          scenario={scenarioObject}
          scenarioSetter={scenarioSetter}
          ref={infoRef}
        />
      ),
      optional: false,
      stepRef: infoRef,
      resetEventHandler: infoRef?.current?.resetForm,
      nextEventHandler: delineationDrawToggler,
      validationObject: scenarioObject,
      errMsg: "Enter a Scenario Name",
    },
    {
      label: "Create a Delineation",
      stepComponent: (
        <ScenarioDelineationForm
          delineation={delineation}
          delineationSetter={delineationSetter}
          ref={delinRef}
          showHelperText={true}
        />
      ),
      optional: true,
      stepRef: delinRef,
      nextEventHandler: () => {
        delinRef?.current?.setName(delineation);
        facilityDrawToggler();
      },
      backEventHandler: viewModeToggler,
      resetEventHandler: delinRef?.current?.resetForm,
      skipEventHandler: () => {
        delinRef?.current?.resetForm();
        facilityDrawToggler();
      },
      validationObject: delineation,
      errMsg: "Draw Your Delineation and Enter a Name",
    },
    {
      label: "Create a BMP",
      stepComponent: (
        <ScenarioBMPForm
          facility={facility}
          facilitySetter={facilitySetter}
          ref={facilityRef}
          showHelperText={true}
        />
      ),
      optional: true,
      stepRef: facilityRef,
      nextEventHandler: () => facilityRef?.current?.handleSubmit(facility),
      backEventHandler: () => {
        facilityRef?.current?.handleSubmit(facility);
        delineationDrawToggler();
      },
      resetEventHandler: facilityRef?.current?.resetForm,
      skipEventHandler: () => {
        facilityRef?.current?.resetForm();
      },
      validationObject: facility,
      errMsg: "Set a BMP Location and Fill Out All Required Fields",
    },
  ];
  const [activeStep, setActiveStep] = useState(0);
  const [skipped, setSkipped] = useState(new Set());

  const isStepOptional = (step) => {
    return steps[step].optional;
  };

  const isStepSkipped = (step) => {
    return skipped.has(step);
  };

  const handleNext = async (idx) => {
    const validationObject = steps[idx].validationObject;
    const isValid = await steps[idx].stepRef.current.triggerValidation(
      validationObject
    );

    if (isValid) {
      let newSkipped = skipped;
      if (isStepSkipped(activeStep)) {
        newSkipped = new Set(newSkipped.values());
        newSkipped.delete(activeStep);
      }
      if (steps[idx].nextEventHandler) {
        steps[idx].nextEventHandler(facility);
      }
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setSkipped(newSkipped);
    } else {
      setErrMsg(steps[idx].errMsg);
      setDisplayErr(true);
    }
  };

  const handleBack = () => {
    if (steps[activeStep]?.backEventHandler) {
      steps[activeStep].backEventHandler();
    }
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    if (steps[activeStep].resetEventHandler) {
      steps[activeStep].resetEventHandler();
    }
  };
  const handleSkip = () => {
    if (!isStepOptional(activeStep)) {
      // You probably want to guard against something like this,
      // it should never occur unless someone's actively trying to break something.
      throw new Error("You can't skip a step that isn't optional.");
    }

    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    setSkipped((prevSkipped) => {
      const newSkipped = new Set(prevSkipped.values());
      newSkipped.add(activeStep);
      return newSkipped;
    });
    if (steps[activeStep].skipEventHandler) {
      steps[activeStep].skipEventHandler();
    }
  };

  const facilityDoesExist = () => {
    return (
      facility?.features?.length > 0 &&
      facility?.features[0].geometry?.coordinates?.length > 0
    );
  };
  const delineationDoesExist = () => {
    return delineation?.features?.length > 0;
  };

  const [displayErr, setDisplayErr] = useState(false);
  const [errMsg, setErrMsg] = useState("You're missing something");

  return (
    <Box sx={{ width: "100%" }}>
      <Snackbar
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        open={displayErr}
        autoHideDuration={3000}
        onClose={() => setDisplayErr(false)}
        message={errMsg}
      />
      <Stepper activeStep={activeStep} orientation="horizontal">
        {steps.map((step, index) => {
          const stepProps = {};
          const labelProps = {};
          if (isStepOptional(index)) {
            labelProps.optional = (
              <Typography variant="caption">Optional</Typography>
            );
          }
          if (isStepSkipped(index)) {
            stepProps.completed = false;
          }
          return (
            <Step key={step.label} {...stepProps}>
              <StepLabel {...labelProps}>{step.label}</StepLabel>
            </Step>
          );
        })}
      </Stepper>
      {activeStep === steps.length ? (
        <>
          <Box sx={{ margin: "1rem" }}>
            <Typography variant="h6">Review Scenario</Typography>
            <Typography>Name: {scenarioObject.name}</Typography>
            <Typography>
              Facility:{" "}
              {facilityDoesExist()
                ? facility.features[0].properties.facility_type
                : "None"}
            </Typography>
            <Typography>
              Delineation:{" "}
              {delineationDoesExist()
                ? delineation.features[0].properties.name
                : "None"}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button onClick={handleSubmit}>Create Scenario</Button>
          </Box>
        </>
      ) : (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              flexWrap: "wrap",
              pt: 2,
            }}
          >
            <Box sx={{ width: "100%", margin: "1rem" }}>
              {steps[activeStep].stepComponent}
            </Box>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            <Box sx={{ flex: "1 1 auto" }} />
            <Button color="inherit" onClick={handleReset} sx={{ mr: 1 }}>
              Reset
            </Button>
            {isStepOptional(activeStep) && (
              <Button color="inherit" onClick={handleSkip} sx={{ mr: 1 }}>
                Skip
              </Button>
            )}
            <Button onClick={() => handleNext(activeStep)}>Next</Button>
          </Box>
        </>
      )}
    </Box>
  );
}
