/*
 * Q&A — every question in the cohort, filtered three ways.
 *
 * The classroom's Q&A tab is the same thread rendered small; this is the
 * whole board. Filtering and the "is it answered?" rule both come from
 * lib/thread (spec 20 D8) rather than being re-derived here, so the pill on a
 * card and the count in the instructor's inbox can never disagree.
 *
 * The demo has no second user: an answer arrives when someone switches to the
 * instructor persona, or presses the dock's "Simulate an answer". The callout
 * says so out loud rather than pretending a reply is in flight.
 */

import {
  Avatar,
  ButtonPrimary,
  Callout,
  Card,
  Chip,
  ChipRow,
  Icon,
  PageHead,
  Pill,
  TextInput,
} from "../components";
import { dataSource } from "../data/source";
import type { Question } from "../data/types";
import { useT } from "../i18n";
import type { MessageKey } from "../i18n";
import type { QaFilter } from "../lib/thread";
import { filterQuestions, questionList } from "../lib/thread";
import { useAppStore } from "../state/store";
import "../styles/screen-qa.css";

const FILTERS: { id: QaFilter; key: MessageKey }[] = [
  { id: "all", key: "screensB.qa.filterAll" },
  { id: "open", key: "screensB.qa.filterOpen" },
  { id: "mine", key: "screensB.qa.filterMine" },
];

export default function Qa() {
  const t = useT();
  const qaText = useAppStore((s) => s.qaText);
  const filter = useAppStore((s) => s.qaFilter) as QaFilter;
  const qaAdded = useAppStore((s) => s.qaAdded);
  const qaReplies = useAppStore((s) => s.qaReplies);
  const set = useAppStore((s) => s.set);
  const askQuestion = useAppStore((s) => s.askQuestion);

  const course = dataSource.courses()[0];
  const student = dataSource.student();
  const list = filterQuestions(questionList(qaAdded, qaReplies), filter);

  return (
    <div className="lp-page lp-page--narrow scr-qa">
      <PageHead
        title={t("screensB.qa.title")}
        lede={t("screensB.qa.lede", { course: course.title })}
      />

      <div className="scr-qa__ask">
        <Avatar initials={student.initials} size="md" />
        <TextInput
          value={qaText}
          onChange={(v) => set({ qaText: v })}
          placeholder={t("screensB.qa.askPlaceholder")}
          ariaLabel={t("screensB.qa.askAria")}
          className="scr-qa__askinput"
        />
        <ButtonPrimary className="scr-qa__askbtn" onClick={askQuestion}>
          {t("screensB.qa.ask")}
        </ButtonPrimary>
      </div>

      <Callout tone="neutral" icon="info" className="scr-qa__note">
        {t("screensB.qa.demoNote")}
      </Callout>

      <ChipRow className="scr-qa__filters">
        {FILTERS.map((f) => (
          <Chip
            key={f.id}
            active={filter === f.id}
            onClick={() => set({ qaFilter: f.id })}
          >
            {t(f.key)}
          </Chip>
        ))}
      </ChipRow>

      <div className="scr-qa__list">
        {list.map((q) => (
          <QuestionCard key={q.id} question={q} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------- card */

function QuestionCard({ question }: { question: Question }) {
  const t = useT();
  const reply = question.reply;
  const instructorFirst = dataSource.instructor().name.split(" ")[0];

  return (
    <Card interactive className="scr-qa__card">
      <Avatar
        initials={question.ini}
        size="md"
        className={`scr-qa__ava${question.mine ? " is-mine" : ""}`}
      />
      <div className="scr-qa__body">
        <div className="scr-qa__meta">
          <span className="scr-qa__who">{question.who}</span>
          <span className="scr-qa__at">{question.at}</span>
          <span className="scr-qa__lesson">· {question.lesson}</span>
          <Pill tone={reply ? "pos" : "neutral"} className="scr-qa__state">
            {reply ? t("screensB.qa.answered") : t("screensB.qa.awaiting")}
          </Pill>
        </div>

        <p className="scr-qa__text">{question.text}</p>

        {reply ? (
          <div className="scr-qa__reply">
            <Avatar initials={reply.ini} size="sm" accent />
            <div className="scr-qa__replybody">
              <div className="scr-qa__replymeta">
                <span className="scr-qa__replywho">{reply.who}</span>
                <Pill tone="accent">{t("screensB.qa.instructor")}</Pill>
                <span className="scr-qa__replyat">{reply.at}</span>
              </div>
              <p className="scr-qa__replytext">{reply.text}</p>
            </div>
          </div>
        ) : (
          <div className="scr-qa__waiting">
            <Icon name="clock" size={14} />
            {t("screensB.qa.repliesWithin", { name: instructorFirst })}
          </div>
        )}
      </div>
    </Card>
  );
}
