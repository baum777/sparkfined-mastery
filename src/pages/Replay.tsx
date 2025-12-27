import { Navigate } from "react-router-dom";

/**
 * /replay and /chart/replay redirect to /chart with replay mode enabled
 */
export default function Replay() {
  return <Navigate to="/chart?replay=true" replace />;
}
