import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import { UserProfileContext } from "./authProvider";

export default function AuthChecker({
  allowedRoles,
  disallowedRoles,
  useNav,
  children,
}) {
  const [isBlocked, setIsBlocked] = useState(true);
  const userProfile = useContext(UserProfileContext);
  const navigate = useNavigate();

  const _allowedRoles = allowedRoles || [];
  const _disallowedRoles = disallowedRoles || [];
  const _useNav = useNav || false; // default to false

  useEffect(() => {
    if (!userProfile?.role) return;

    if (
      (_disallowedRoles.length &&
        _disallowedRoles.includes(userProfile.role)) ||
      (_allowedRoles.length && !_allowedRoles.includes(userProfile.role))
    ) {
      if (_useNav) {
        navigate("/app");
        return;
      } else return;
    } else {
      setIsBlocked(false);
    }
  }, [children, userProfile]);

  if (isBlocked) return null;
  return <>{children}</>;
}
