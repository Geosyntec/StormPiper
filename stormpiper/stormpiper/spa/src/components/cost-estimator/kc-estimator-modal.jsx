import { Box, Button, Modal, Typography } from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";

import KCCostEstimator from "./kc-estimator";
import DocumentationURL from "../../assets/docs/Appendix_B.pdf";

export function KCBMPDetailModal({
  modalOpen,
  handleModalClose,
  handleApply,
  initialBMPType,
  disableApply,
}) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "300px", sm: "80ch" },
    maxWidth: "calc(100% - 30px)",
    bgcolor: "background.paper",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
    borderRadius: 2,
  };

  const [result, setResult] = useState(null);

  const getResult = (res) => setResult(res);

  const _handleApply = () => {
    handleApply(result);
    handleModalClose();
  };

  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography
          id="modal-modal-title"
          align="center"
          variant="h6"
          component="h2"
        >
          {"King County BMP Cost Estimator Tool"}
        </Typography>
        <Typography id="modal-modal-description" align="center" sx={{ mt: 2 }}>
          <Button
            variant="contained"
            component={Link}
            to={DocumentationURL}
            target={"_blank"}
            sx={{
              textTransform: "none",
              textDecoration: "none",
            }}
          >
            King County WQBE Report (PDF)
          </Button>
        </Typography>

        <KCCostEstimator
          initialBMPType={initialBMPType}
          getResult={getResult}
        />
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button onClick={handleModalClose} variant="outlined" color="inherit">
            Close
          </Button>
          <Button
            onClick={_handleApply}
            variant="outlined"
            color="primary"
            disabled={disableApply}
          >
            Apply to BMP Form
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
