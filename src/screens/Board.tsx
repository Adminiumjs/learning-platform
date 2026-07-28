/* PORT-STUB: board — replace with the ported screen. */

import { EmptyState } from "../components";
import "../styles/screen-board.css";

export default function Board() {
  return (
    <div className="lp-page scr-board">
      <EmptyState icon="box" title="Discussion board" body="Not ported yet." />
    </div>
  );
}
