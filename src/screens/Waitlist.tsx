/* PORT-STUB: waitlist — replace with the ported screen. */

import { EmptyState } from "../components";
import "../styles/screen-waitlist.css";

export default function Waitlist() {
  return (
    <div className="lp-page scr-waitlist">
      <EmptyState icon="box" title="Waitlist" body="Not ported yet." />
    </div>
  );
}
