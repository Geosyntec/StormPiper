import { Button, List, ListItem, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

import { api_fetch } from "../../utils/utils";

export default function UserInfo(props) {
  const navigate = useNavigate();
  const userProfile = props.userProfile;
  const theme = useTheme();

  async function _postLogout() {
    await api_fetch("/auth/jwt-cookie/logout", {
      method: "POST",
    });

    await api_fetch("/auth/jwt-bearer/logout", {
      method: "POST",
    });

    navigate("/app/login");
  }

  return (
    <List>
      <ListItem>
        <Typography variant="subtitle1">
          Hello {userProfile.first_name}
        </Typography>
      </ListItem>
      <ListItem>
        <Typography variant="subtitle2">{userProfile.email}</Typography>
      </ListItem>
      <ListItem>
        <Button
          variant="contained"
          sx={{
            backgroundColor: theme.palette.grey[300],
            color: theme.palette.text.primary,
          }}
          onClick={() => navigate("/app/manage-users/me")}
        >
          Manage My Profile
        </Button>
      </ListItem>
      {["admin", "user_admin"].includes(userProfile.role) && (
        <ListItem>
          <Button
            variant="contained"
            sx={{
              backgroundColor: theme.palette.grey[300],
              color: theme.palette.text.primary,
            }}
            onClick={() => navigate("/app/manage-users")}
          >
            Manage All Users
          </Button>
        </ListItem>
      )}
      <ListItem>
        <Button
          sx={{
            backgroundColor: theme.palette.grey[300],
            color: theme.palette.text.primary,
          }}
          variant="contained"
          onClick={_postLogout}
        >
          Logout
        </Button>
      </ListItem>
    </List>
  );
}
