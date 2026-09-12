import { useState } from "react";
export const useAuth = () => {
  const [user, setUser] = useState(null);
  return { user, isAuthenticated: !!user };
};
