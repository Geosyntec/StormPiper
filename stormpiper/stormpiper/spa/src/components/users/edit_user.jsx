import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { api_fetch } from "../../utils/utils";

import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  TextField,
  Typography,
} from "@mui/material";

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

  const userid = params.id;

  const userDataSetter = async () => {
    const _userdata = await getUser(userid);
    const _medata = await getUser("me");

    Promise.all([
      setUserData(_userdata),
      setFormValues(_userdata),
      setMeData(_medata),
    ]).then(() => {
      console.log(userdata, medata, formValues);
    });
  };

  useEffect(() => {
    userDataSetter();
  }, []);

  function _renderFormFields() {
    let fieldDiv = Object.values(fields).map((formField) => {
      return (
        <Box
          sx={{
            mt: 4,
          }}
          key={formField.name}
        >
          {formField?.select ? (
            <TextField
              fullWidth
              {...register(formField.name, { ...formField })}
              label={formField.label}
              type={formField?.type ?? "text"}
              required={formField?.required ?? false}
              value={formValues[formField.name] ?? "public"}
              InputProps={formField?.InputProps}
              disabled={formField?.disabled ?? false}
              select
              onChange={handleInputChange}
            >
              {formField?.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          ) : (
            <TextField
              fullWidth
              {...register(formField.name, { ...formField })}
              label={formField.label}
              type={formField?.type || "text"}
              required={formField?.required || false}
              value={formValues[formField.name] ?? ""}
              InputProps={formField?.InputProps}
              disabled={formField?.disabled || false}
              select={formField?.select || false}
              onChange={handleInputChange}
            ></TextField>
          )}

          {errors[formField.name] && (
            <p className="form-label error-msg">
              {errors[formField.name]?.message}
            </p>
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
      userid,
      Object.fromEntries(formData.entries())
    );

    const rjson = await response.json();

    if (response.status >= 200 && response.status < 300) {
      setSuccess(true);
      setError(false);
      setUserData(rjson);
      setFormValues(rjson);
    } else {
      console.warn("edit user failure", userid, response, rjson);
      setError(true);
      setSuccess(false);
    }
    return response;
  }

  const isMeAdmin = ["admin", "user_admin"].includes(medata?.role);

  const fields = [
    {
      name: "first_name",
      label: "First Name",
    },
    {
      name: "last_name",
      label: "Last Name",
    },
    {
      name: "email",
      label: "Email/Username",
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
      },
    },
  ];

  return (
    <Box>
      <Card>
        <CardContent
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* TODO: check text and variant */}
          <Typography align="center" variant="h4">
            {" "}
            Review and Edit User Information
          </Typography>
          {!userdata ? (
            <Box>loading...</Box>
          ) : (
            // TODO: add loading spinner
            <Box
              sx={{ width: { xs: "100%", sm: "60ch" } }}
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
                    <Typography variant="caption" color="error" align="center">
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
  );
}
