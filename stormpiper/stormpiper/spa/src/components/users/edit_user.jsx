import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import {
  Box,
  Button,
  IconButton,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
  Tooltip,
  Stack,
} from "@mui/material";

import { api_fetch } from "../../utils/utils";
import TokenRouteTable from "./data-access";

const defaultFormValues = {
  first_name: "fname",
  last_name: "lname",
  email: "def-email",
  role: "public",
  is_verified: false,
  readonly_token: "tst",
};

async function getUser(id) {
  const response = await api_fetch(`/api/rest/users/${id}`);
  return response.json();
}

async function rotateToken() {
  const response = await api_fetch("/api/rest/users/me/rotate_readonly_token", {
    method: "POST",
  });
  return response.json();
}

const patchUserId = async (id, data) => {
  return await api_fetch(`/api/rest/users/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
};

export default function EditUser() {
  const params = useParams();
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [userdata, setUserData] = useState(null);
  const [medata, setMeData] = useState(null);
  const [formValues, setFormValues] = useState(defaultFormValues);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSuccess(false);
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: defaultFormValues });

  const userDataSetter = async () => {
    // console.log("data on getter", params.id);
    const _userdata = await getUser(params.id);
    const _medata = await getUser("me");

    Promise.all([
      setUserData({ ..._userdata }),
      setFormValues({ ..._userdata }),
      setMeData({ ..._medata }),
    ]).then(() => {
      // console.log(userdata, medata, formValues);
    });
  };

  useEffect(() => {
    userDataSetter();
  }, [params.id]);

  function _renderFormFields() {
    let fieldDiv = Object.values(fields).map((formField) => {
      return (
        <Box key={formField.name}>
          <TextField
            fullWidth
            margin="normal"
            {...register(formField.name, { ...formField })}
            label={formField.label}
            type={formField?.type ?? "text"}
            required={formField?.required ?? false}
            value={formValues?.[formField.name] || ""}
            InputProps={formField?.InputProps}
            disabled={formField?.disabled ?? false}
            select={formField?.select || false}
            onChange={handleInputChange}
            {...formField}
          >
            {formField?.options?.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
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

  async function _handleSubmit(data, e) {
    console.log("Event: ", e);
    console.log("Data:", data);
    delete data.is_verified;
    delete data.readonly_token;
    const formData = new FormData(e.target);

    const response = await patchUserId(
      params.id,
      Object.fromEntries(formData.entries())
    );

    const rjson = await response.json();

    if (response.status >= 200 && response.status < 300) {
      setSuccess(true);
      setError(false);
      setUserData(rjson);
      setFormValues(rjson);
    } else {
      console.warn("edit user failure", params.id, response, rjson);
      setError(true);
      setSuccess(false);
    }
    return response;
  }

  const isMeAdmin = ["admin", "user_admin"].includes(medata?.role);
  const userIsMe = medata?.id === userdata?.id;

  const CopyToClipboardButton = ({ data }) => {
    const handleClick = () => {
      navigator.clipboard.writeText(data);
      console.log(data);
    };

    return (
      <Tooltip title="Copy to Clipboard">
        <IconButton onClick={handleClick}>
          <ContentCopyIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const RotateTokenButton = () => {
    const handleClick = async () => {
      const _ = await rotateToken();
      await userDataSetter();
    };

    return (
      <Tooltip title="Rotate Token">
        <IconButton onClick={handleClick}>
          <AutorenewIcon />
        </IconButton>
      </Tooltip>
    );
  };

  const fields = [
    {
      name: "first_name",
      label: "First Name",
      InputProps: {
        readOnly: !userIsMe,
      },
      disabled: !userIsMe,
    },
    {
      name: "last_name",
      label: "Last Name",
      InputProps: {
        readOnly: !userIsMe,
      },
      disabled: !userIsMe,
    },
    {
      name: "email",
      label: "Email/Username",
      InputProps: {
        readOnly: !userIsMe,
      },
      disabled: !userIsMe,
    },
    {
      name: "role",
      label: "Role/Permissions",
      disabled: !isMeAdmin,
      InputProps: {
        readOnly: !isMeAdmin,
      },
      select: true,
      options: [
        { label: "Public", value: "public" },
        { label: "Read-only", value: "reader" },
        { label: "User/Editor", value: "editor" },
        { label: "User Admin", value: "user_admin" },
        { label: "System Admin", value: "admin" },
      ],
    },
    {
      name: "is_verified",
      label: "Email is Verified",
      disabled: true,
      InputProps: {
        readOnly: true,
      },
    },
    {
      name: "readonly_token",
      label: "Readonly Token",
      disabled: true,
      InputProps: {
        readOnly: true,
        endAdornment: (
          <>
            <CopyToClipboardButton data={medata?.readonly_token} />
            <RotateTokenButton />
          </>
        ),
      },
    },
  ];

  return (
    <Stack spacing={3} mt={3} mb={6}>
      <Box display="flex" justifyContent="center">
        <Card sx={{ p: 2, width: { xs: "100%", sm: 500 } }}>
          <CardContent>
            {/* TODO: check text and variant */}
            <Typography align="center" variant="h5">
              Review and Edit User Information
            </Typography>
            {!userdata ? (
              <Box>loading...</Box>
            ) : (
              // TODO: add loading spinner
              <Box
                component="form"
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit(_handleSubmit)}
              >
                {_renderFormFields()}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "flex-end",
                    flexDirection: "column",
                    mt: 4,
                  }}
                >
                  <Button variant="contained" color="primary" type="submit">
                    Submit
                  </Button>
                  <Box>
                    {!error && !success && (
                      <Typography variant="caption" align="center">
                        &nbsp;
                      </Typography>
                    )}
                    {error && (
                      <Typography
                        variant="caption"
                        color="error"
                        align="center"
                      >
                        Edits not stored.
                      </Typography>
                    )}
                    {success && (
                      <Typography
                        variant="caption"
                        color="primary"
                        align="center"
                      >
                        Success
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
      <Box display="flex" justifyContent="center">
        <Card
          sx={{
            p: 2,
            // width: { xs: "100%", sm: 500 }
          }}
        >
          <TokenRouteTable token={medata?.readonly_token} />
        </Card>
      </Box>
    </Stack>
  );
}
