/* PORT-STUB: 404 — replace with the ported screen. */

import { EmptyState } from "../components";
import "../styles/screen-404.css";

export default function NotFound() {
  return (
    <div className="lp-page scr-404">
      <EmptyState icon="box" title="404" body="Not ported yet." />
    </div>
  );
}
