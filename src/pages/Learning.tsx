import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SelfAttentionWorkflow } from "@/components/SelfAttentionWorkflow";

const Learning = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user) {
      // Redirect to auth with the current location
      navigate("/auth", { state: { from: location } });
    }
  }, [user, navigate, location]);

  // Don't render the workflow if user is not authenticated
  if (!user) {
    return null;
  }

  return <SelfAttentionWorkflow />;
};

export default Learning;
