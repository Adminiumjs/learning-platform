/*
 * Alumni directory — the people who finished, and said yes to being found.
 *
 * The privacy line is the point of the screen: role, city and one sentence,
 * nothing else. There is no email column and no "export CSV", because a
 * directory that leaks is worse than no directory. The listing toggle at the
 * bottom says the same thing in the student's own words.
 *
 * "Say hello" sends an intro rather than revealing an address — the button
 * latches to "Message sent" and stays latched, so nobody gets pestered twice.
 */

import {
  Avatar,
  ButtonPrimary,
  ButtonSecondary,
  Chip,
  ChipRow,
  EmptyState,
  Icon,
  PageHead,
  Pill,
} from "../components";
import { ALUMNI, ALUMNI_FILTERS, ALUMNI_LEDE } from "../data/screens/alumni";
import { useAppStore } from "../state/store";
import "../styles/screen-alumni.css";

export default function Alumni() {
  const query = useAppStore((s) => s.alQuery);
  const filter = useAppStore((s) => s.alFilter);
  const connected = useAppStore((s) => s.alConnected);
  const listed = useAppStore((s) => s.alListed);
  const set = useAppStore((s) => s.set);
  const showToast = useAppStore((s) => s.showToast);

  const needle = query.trim().toLowerCase();
  const list = ALUMNI.filter((p) => {
    if (filter === "hiring" && !p.hiring) return false;
    if (filter !== "all" && filter !== "hiring" && p.course !== filter) return false;
    if (!needle) return true;
    return `${p.name} ${p.role} ${p.city} ${p.line} ${p.tags.join(" ")}`
      .toLowerCase()
      .includes(needle);
  });

  function sayHello(name: string) {
    if (connected[name]) return;
    set({ alConnected: { ...connected, [name]: 1 } });
    showToast(`Intro sent to ${name.split(" ")[0]}.`, "send");
  }

  function toggleListing() {
    set({ alListed: !listed });
    showToast(
      listed ? "Removed from the directory." : "You will be listed the day you finish.",
      "user-round-check",
    );
  }

  return (
    <div className="lp-page scr-alumni">
      <PageHead
        className="al-head"
        title="Alumni"
        lede={ALUMNI_LEDE}
        action={
          /* No shared search-field primitive yet, so the icon + bare input
             live here; `:focus-within` gives it the same ring as `lp-fld`. */
          <label className="al-search">
            <Icon name="search" size={16} className="al-search__ico" />
            <input
              className="al-search__input"
              value={query}
              placeholder="Name, city or what they do"
              aria-label="Search alumni"
              onChange={(e) => set({ alQuery: e.target.value })}
            />
          </label>
        }
      />

      <ChipRow className="al-filters">
        {ALUMNI_FILTERS.map((f) => (
          <Chip
            key={f.id}
            active={filter === f.id}
            onClick={() => set({ alFilter: f.id })}
            className="al-filter"
          >
            {f.label}
          </Chip>
        ))}
        <span className="al-count">
          {list.length} {list.length === 1 ? "person" : "people"}
        </span>
      </ChipRow>

      {list.length > 0 ? (
        <div className="al-grid">
          {list.map((p) => {
            const sent = Boolean(connected[p.name]);
            return (
              <div className="lp-cardbox lp-card al-card" key={p.name}>
                <div className="al-card__top">
                  <Avatar initials={p.ini} size="lg" className="al-av" />
                  <span className="al-card__who">
                    <span className="al-card__name">{p.name}</span>
                    <span className="al-card__role">{p.role}</span>
                  </span>
                  {p.hiring ? <Pill tone="pos">Hiring</Pill> : null}
                </div>

                <p className="al-card__line">{p.line}</p>

                <div className="al-tags">
                  {p.tags.map((t) => (
                    <span className="al-tag" key={t}>
                      {t}
                    </span>
                  ))}
                </div>

                <div className="al-card__foot">
                  <span className="lp-mono al-card__city">
                    <Icon name="map-pin" size={12} />
                    {p.city}
                  </span>
                  {/* Latched rather than disabled: the sent state is carried by
                      the label, and a greyed-out control would read as broken. */}
                  <ButtonSecondary
                    className={`al-say${sent ? " al-say--sent" : ""}`}
                    onClick={() => sayHello(p.name)}
                  >
                    {sent ? "Message sent" : "Say hello"}
                  </ButtonSecondary>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <EmptyState
          className="al-empty"
          icon="user-round-search"
          title={`Nobody matches “${query}”.`}
          body="184 people have finished a course here. Try a city, or a word like “systems”."
        />
      )}

      <div className={`al-cta${listed ? " is-listed" : ""}`}>
        <Icon name="user-round-check" size={20} className="al-cta__ico" />
        <span className="al-cta__text">
          {listed
            ? "You are listed. Alumni can see your role, city and one line about your work — nothing else."
            : "Finish a course and you can list yourself here. We show your role, city and one line. No email, no scraping."}
        </span>
        {/* The comp labelled this "Edit my listing" while the handler removed
            the listing — and its own toast said "Removed from the directory".
            Labelled for what it actually does. */}
        <ButtonPrimary className="al-cta__btn" onClick={toggleListing}>
          {listed ? "Remove my listing" : "List me when I finish"}
        </ButtonPrimary>
      </div>
    </div>
  );
}
