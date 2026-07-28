/* PORT-STUB: offline — replace with the ported screen. */

import { EmptyState } from "../components";
import "../styles/screen-offline.css";

export default function Offline() {
  return (
    <div className="lp-page scr-offline">
      <EmptyState icon="box" title="Offline" body="Not ported yet." />
    </div>
  );
}
