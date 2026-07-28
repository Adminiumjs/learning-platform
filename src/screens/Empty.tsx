/* PORT-STUB: empty — replace with the ported screen. */

import { EmptyState } from "../components";
import "../styles/screen-empty.css";

export default function Empty() {
  return (
    <div className="lp-page scr-empty">
      <EmptyState icon="box" title="Empty states" body="Not ported yet." />
    </div>
  );
}
