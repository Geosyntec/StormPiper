import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { UserProfileContext } from "./authProvider";

export default function AuthChecker({
  allowedRoles,
  disallowedRoles,
  useNav,
  children,
}) {
  const [isBlocked, setIsBlocked] = useState(false);
  const userProfile = useContext(UserProfileContext);
  const navigate = useNavigate();

  const _allowedRoles = allowedRoles || [];
  const _disallowedRoles = disallowedRoles || [];
  const _useNav = useNav || false; // default to false

  useEffect(() => {
    if (
      _disallowedRoles.includes(userProfile.role) ||
      !_allowedRoles.includes(userProfile.role)
    ) {
      if (_useNav) {
        navigate("/app");
      } else setIsBlocked(true);
    }
  }, [children]);

  if (isBlocked) return <></>;
  return <>{children}</>;
}
