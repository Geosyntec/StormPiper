import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { UserProfileContext } from "./authProvider";

export default function AuthChecker({
  allowedRoles,
  disallowedRoles,
  useNav,
  children,
}) {
  const userProfile = useContext(UserProfileContext);
  const navigate = useNavigate();

  const _allowedRoles = allowedRoles || [];
  const _disallowedRoles = disallowedRoles || [];
  const _useNav = useNav || false; // default to false
  if (_allowedRoles.length && !_allowedRoles.includes(userProfile.role)) {
    if (_useNav) navigate("/app");
    return <></>;
  }

  if (_disallowedRoles.length && _disallowedRoles.includes(userProfile.role)) {
    if (_useNav) navigate("/app");
    return <></>;
  }

  return <> {children} </>;
}
