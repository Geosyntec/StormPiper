import { Box, Button, Modal, Typography } from "@mui/material";
import DeleteIcon from "@material-ui/icons/DeleteOutlined";

export function ConfirmDeleteModal({
  modalOpen,
  handleModalClose,
  handleConfirmDelete,
  email,
}) {
  const style = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: { xs: "300px", sm: "60ch" },
    maxWidth: 450,
    bgcolor: "background.paper",
    border: "2px solid #000",
    boxShadow: 24,
    p: 4,
    display: "flex",
    flexDirection: "column",
  };

  return (
    <Modal
      open={modalOpen}
      onClose={handleModalClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={style}>
        <Typography id="modal-modal-title" variant="h6" component="h2">
          Are you sure you want to delete this user?
        </Typography>
        <Typography id="modal-modal-description" align="center" sx={{ mt: 2 }}>
          {email}
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            sx={{ width: "100px" }}
            onClick={handleModalClose}
            variant="outlined"
            color="primary"
          >
            Cancel
          </Button>
          <Button
            sx={{ width: "200px" }}
            onClick={handleConfirmDelete}
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
          >
            Confirm Delete
          </Button>
        </Box>
      </Box>
    </Modal>
  );
}
