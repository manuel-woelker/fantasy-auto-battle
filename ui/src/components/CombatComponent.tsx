import { css, keyframes } from "@emotion/react";
import styled from "@emotion/styled";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { CardComponent } from "./CardComponent";
import type { CombatEvent, CombatResult } from "../shared/combat";
import type { CombatantRef } from "../shared/combat/battle-computer";
import type { Card as CardModel } from "../shared/models/card";
import type { Team } from "../shared/models/team";

interface CombatComponentProps {
  teamA: Team;
  teamB: Team;
  result: CombatResult;
  speed?: number;
  autoPlay?: boolean;
}

interface UnitView {
  card: CardModel;
  alive: boolean;
}

interface AttackMotionState {
  attackerKey: string;
  eventIndex: number;
  dx: number;
  dy: number;
  tiltDeg: number;
}

type TeamKey = "teamA" | "teamB";
type SlotAnimation = "none" | "attacker" | "target" | "faint";

const MIN_SPEED = 0.25;
const MAX_SPEED = 4;
const BASE_STEP_MS = 800;
const ATTACK_ANIMATION_MS = 650;
const TARGET_SHAKE_MS = 500;
const FAINT_ANIMATION_MS = 160;
const POST_ATTACK_BUFFER_MS = 24;

const attackerPulse = keyframes`
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    box-shadow: 0 0 0 rgba(255, 92, 74, 0);
  }
  60% {
    transform: translate3d(var(--attack-dx, 0px), var(--attack-dy, 0px), 0) rotate(var(--attack-tilt, 0deg)) scale(1.02);
    box-shadow: 0 0 0 7px rgba(255, 92, 74, 0.15);
  }
  68% {
    transform: translate3d(var(--attack-dx, 0px), var(--attack-dy, 0px), 0) rotate(var(--attack-tilt, 0deg)) scale(1.02);
  }
  100% {
    transform: translate3d(0, 0, 0) rotate(0deg) scale(1);
    box-shadow: 0 0 0 rgba(255, 92, 74, 0);
  }
`;

const targetShake = keyframes`
  0% { transform: translateX(0); }
  20% { transform: translateX(-2px); }
  50% { transform: translateX(3px); }
  80% { transform: translateX(-1px); }
  100% { transform: translateX(0); }
`;

const faintDrop = keyframes`
  0% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0.55; transform: translateY(6px) scale(0.98); }
`;

const damageFloat = keyframes`
  0% { opacity: 0; transform: translateY(8px) scale(0.94); }
  12% { opacity: 1; transform: translateY(0) scale(1); }
  100% { opacity: 0; transform: translateY(-26px) scale(1.02); }
`;

const Root = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 16px;
  background: linear-gradient(180deg, #f8f3e8 0%, #efe6d8 100%);
  border: 1px solid #cfbca0;
  border-radius: 10px;
  color: #3a2b1a;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 20px;
`;

const WinnerBadge = styled.span<{ winner: CombatResult["winner"] }>`
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  background-color: ${(props) => {
    if (props.winner === "teamA") return "#d9f2da";
    if (props.winner === "teamB") return "#f2dad9";
    return "#e8e2d6";
  }};
  border: 1px solid
    ${(props) => {
      if (props.winner === "teamA") return "#7eb381";
      if (props.winner === "teamB") return "#b37e7e";
      return "#b7a994";
    }};
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
`;

const Label = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
`;

const Range = styled.input`
  width: 140px;
`;

const Button = styled.button`
  border: 1px solid #8f7860;
  background-color: #fbf8f2;
  color: #3a2b1a;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 13px;
  cursor: pointer;

  &:hover {
    background-color: #f1eadf;
  }
`;

const StepLabel = styled.span`
  font-size: 13px;
  color: #5d4a36;
`;

const Battlefield = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const Lane = styled.div`
  border: 1px solid #ccb89b;
  border-radius: 8px;
  background-color: rgba(255, 255, 255, 0.65);
  padding: 10px;
`;

const TeamsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const TeamColumn = styled.div`
  border: 1px solid #d8c8b0;
  border-radius: 7px;
  padding: 8px;
`;

const Slots = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, 200px);
  gap: 8px;
  justify-content: center;
`;

const Slot = styled.div`
  width: 200px;
  min-height: 290px;
  border-radius: 6px;
  background-color: transparent;
  padding: 6px;
  position: relative;
`;

const AnimatedCardFrame = styled.div<{
  alive: boolean;
  animationType: SlotAnimation;
  attackDurationMs: number;
  targetDurationMs: number;
  faintDurationMs: number;
}>`
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  border-radius: 6px;
  transition: opacity 0.2s ease;
  will-change: transform, opacity;
  opacity: ${(props) => (props.alive ? 1 : 0.62)};
  filter: ${(props) => (props.alive ? "none" : "grayscale(0.65)")};
  animation: ${(props) => {
    if (props.animationType === "attacker")
      return css`
        ${attackerPulse} ${props.attackDurationMs}ms ease
      `;
    if (props.animationType === "target")
      return css`
        ${targetShake} ${props.targetDurationMs}ms ease
      `;
    if (props.animationType === "faint")
      return css`
        ${faintDrop} ${props.faintDurationMs}ms linear forwards
      `;
    return css`
      none
    `;
  }};
`;

const DamageIndicator = styled.div`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) rotate(var(--damage-counter-rotate, 0deg));
  z-index: 2;
  pointer-events: none;
`;

const DamageText = styled.div<{ durationMs: number; delayMs: number }>`
  font-size: 88px;
  font-weight: 700;
  color: #b62020;
  opacity: 0;
  text-shadow:
    0 1px 0 #fff,
    0 0 6px rgba(255, 255, 255, 0.9);
  animation: ${(props) => css`
    ${damageFloat} ${props.durationMs}ms ease-out ${props.delayMs}ms forwards
  `};
`;

const EmptySlot = styled.div`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #9a8770;
  font-size: 11px;
  font-style: italic;
`;

function normalizeSpeed(speed: number): number {
  return Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed));
}

function buildSlotKey(team: TeamKey, lane: number, slot: number): string {
  return `${team}:${lane}:${slot}`;
}

function buildRefKey(ref: CombatantRef): string {
  return `${ref.team}:${ref.lane}:${ref.slot}:${ref.cardId}`;
}

function getLaneCount(teamA: Team, teamB: Team, events: CombatEvent[]): number {
  let laneCount = Math.max(teamA.lanes.length, teamB.lanes.length);
  events.forEach((event) => {
    if (event.type === "attack") {
      laneCount = Math.max(
        laneCount,
        event.attacker.lane + 1,
        event.target.lane + 1,
      );
      return;
    }

    laneCount = Math.max(laneCount, event.target.lane + 1);
  });
  return laneCount;
}

function getSlotCountForLane(
  laneIndex: number,
  teamA: Team,
  teamB: Team,
  events: CombatEvent[],
): number {
  let slotCount = Math.max(
    teamA.lanes[laneIndex]?.length ?? 0,
    teamB.lanes[laneIndex]?.length ?? 0,
  );

  events.forEach((event) => {
    if (event.type === "attack") {
      if (event.attacker.lane === laneIndex) {
        slotCount = Math.max(slotCount, event.attacker.slot + 1);
      }
      if (event.target.lane === laneIndex) {
        slotCount = Math.max(slotCount, event.target.slot + 1);
      }
      return;
    }

    if (event.target.lane === laneIndex) {
      slotCount = Math.max(slotCount, event.target.slot + 1);
    }
  });

  return slotCount;
}

function buildBoardState(
  teamA: Team,
  teamB: Team,
  events: CombatEvent[],
  appliedEventCount: number,
): Record<TeamKey, (UnitView | null)[][]> {
  const laneCount = getLaneCount(teamA, teamB, events);
  const board: Record<TeamKey, (UnitView | null)[][]> = {
    teamA: [],
    teamB: [],
  };
  const byRefKey = new Map<string, UnitView>();

  for (let laneIndex = 0; laneIndex < laneCount; laneIndex += 1) {
    const slotCount = getSlotCountForLane(laneIndex, teamA, teamB, events);
    board.teamA[laneIndex] = new Array(slotCount).fill(null);
    board.teamB[laneIndex] = new Array(slotCount).fill(null);

    (["teamA", "teamB"] as TeamKey[]).forEach((teamKey) => {
      const sourceTeam = teamKey === "teamA" ? teamA : teamB;
      const lane = sourceTeam.lanes[laneIndex] ?? [];

      for (let slotIndex = 0; slotIndex < slotCount; slotIndex += 1) {
        const card = lane[slotIndex]?.card;
        if (!card) {
          continue;
        }

        const unit: UnitView = {
          card: { ...card },
          alive: card.defense > 0,
        };
        board[teamKey][laneIndex][slotIndex] = unit;
        byRefKey.set(
          buildRefKey({
            team: teamKey,
            lane: laneIndex,
            slot: slotIndex,
            cardId: card.id,
          }),
          unit,
        );
      }
    });
  }

  /* 📖 # Why replay events from the combat log instead of mutating source team cards?
  The combat log is the single deterministic source of truth for animation state.
  Replaying `n` events always yields the same frame and keeps UI rendering pure.
  */
  for (
    let eventIndex = 0;
    eventIndex < Math.min(appliedEventCount, events.length);
    eventIndex += 1
  ) {
    const event = events[eventIndex];
    if (event.type === "attack") {
      const attacker = byRefKey.get(buildRefKey(event.attacker));
      const target = byRefKey.get(buildRefKey(event.target));
      if (attacker) {
        attacker.card.defense = event.attackerDefenseAfter;
        attacker.alive = event.attackerDefenseAfter > 0;
      }
      if (target) {
        target.card.defense = event.targetDefenseAfter;
        target.alive = event.targetDefenseAfter > 0;
      }
      continue;
    }

    const target = byRefKey.get(buildRefKey(event.target));
    if (target) {
      target.card.defense = 0;
      target.alive = false;
    }
  }

  return board;
}

function isMatchingRef(
  team: TeamKey,
  lane: number,
  slot: number,
  ref: CombatantRef,
): boolean {
  return ref.team === team && ref.lane === lane && ref.slot === slot;
}

function getSlotAnimationType(
  team: TeamKey,
  lane: number,
  slot: number,
  currentEvent: CombatEvent | null,
): SlotAnimation {
  if (!currentEvent) {
    return "none";
  }

  if (currentEvent.type === "attack") {
    if (isMatchingRef(team, lane, slot, currentEvent.attacker)) {
      return "attacker";
    }
    if (isMatchingRef(team, lane, slot, currentEvent.target)) {
      return "target";
    }
    return "none";
  }

  if (isMatchingRef(team, lane, slot, currentEvent.target)) {
    return "faint";
  }

  return "none";
}

function getDamageTakenForSlot(
  team: TeamKey,
  lane: number,
  slot: number,
  currentEvent: CombatEvent | null,
): number | null {
  if (!currentEvent || currentEvent.type !== "attack") {
    return null;
  }

  if (isMatchingRef(team, lane, slot, currentEvent.target)) {
    return currentEvent.damageToTarget;
  }

  if (isMatchingRef(team, lane, slot, currentEvent.attacker)) {
    return currentEvent.damageToAttacker;
  }

  return null;
}

function isAttackerSlot(
  team: TeamKey,
  lane: number,
  slot: number,
  currentEvent: CombatEvent | null,
): boolean {
  if (!currentEvent || currentEvent.type !== "attack") {
    return false;
  }

  return isMatchingRef(team, lane, slot, currentEvent.attacker);
}

function getDelayBeforeNextEvent(
  currentIndex: number,
  events: CombatEvent[],
  defaultDelayMs: number,
  attackDurationMs: number,
  faintDurationMs: number,
  postAttackBufferMs: number,
): number {
  if (currentIndex < 0) {
    return defaultDelayMs;
  }

  const currentEvent = events[currentIndex];
  const nextEvent = events[currentIndex + 1];

  if (!nextEvent) {
    return defaultDelayMs;
  }

  // Attack -> faint should start right after attack completes (plus one tiny frame buffer).
  if (currentEvent.type === "attack" && nextEvent.type === "faint") {
    return attackDurationMs + postAttackBufferMs;
  }

  // Multiple faints in sequence should also flow without extra pause.
  if (currentEvent.type === "faint" && nextEvent.type === "faint") {
    return faintDurationMs;
  }

  return defaultDelayMs;
}

export function CombatComponent({
  teamA,
  teamB,
  result,
  speed = 1,
  autoPlay = true,
}: CombatComponentProps) {
  const [eventIndex, setEventIndex] = useState(-1);
  const [playing, setPlaying] = useState(autoPlay);
  const [playbackSpeed, setPlaybackSpeed] = useState(normalizeSpeed(speed));
  const [attackMotion, setAttackMotion] = useState<AttackMotionState | null>(
    null,
  );
  const slotRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    setEventIndex(-1);
    setPlaying(autoPlay);
  }, [teamA, teamB, result, autoPlay]);

  useEffect(() => {
    setPlaybackSpeed(normalizeSpeed(speed));
  }, [speed]);

  const stepIntervalMs = useMemo(
    () => BASE_STEP_MS / playbackSpeed,
    [playbackSpeed],
  );
  const attackDurationMs = useMemo(
    () => ATTACK_ANIMATION_MS / playbackSpeed,
    [playbackSpeed],
  );
  const targetDurationMs = useMemo(
    () => TARGET_SHAKE_MS / playbackSpeed,
    [playbackSpeed],
  );
  const damageFloatDurationMs = useMemo(
    () => Math.max(240, attackDurationMs * 1.6),
    [attackDurationMs],
  );
  const damageFloatDelayMs = useMemo(
    () => Math.max(0, attackDurationMs * 0.6),
    [attackDurationMs],
  );
  const faintDurationMs = useMemo(
    () => FAINT_ANIMATION_MS / playbackSpeed,
    [playbackSpeed],
  );
  const delayBeforeNextEventMs = useMemo(
    () =>
      getDelayBeforeNextEvent(
        eventIndex,
        result.events,
        stepIntervalMs,
        attackDurationMs,
        faintDurationMs,
        POST_ATTACK_BUFFER_MS / playbackSpeed,
      ),
    [
      eventIndex,
      result.events,
      stepIntervalMs,
      attackDurationMs,
      faintDurationMs,
      playbackSpeed,
    ],
  );

  useEffect(() => {
    if (!playing || result.events.length === 0) {
      return;
    }
    if (eventIndex >= result.events.length - 1) {
      return;
    }

    const timer = window.setTimeout(() => {
      setEventIndex((current) => {
        const next = Math.min(current + 1, result.events.length - 1);
        if (next >= result.events.length - 1) {
          setPlaying(false);
        }
        return next;
      });
    }, delayBeforeNextEventMs);

    return () => window.clearTimeout(timer);
  }, [delayBeforeNextEventMs, eventIndex, playing, result.events.length]);

  const currentEvent = eventIndex >= 0 ? result.events[eventIndex] : null;
  const board = useMemo(() => {
    if (eventIndex < 0) {
      return buildBoardState(teamA, teamB, result.events, 0);
    }

    const appliedEventCount =
      currentEvent?.type === "attack" ? eventIndex : eventIndex + 1;

    return buildBoardState(teamA, teamB, result.events, appliedEventCount);
  }, [teamA, teamB, result.events, eventIndex, currentEvent?.type]);
  const laneCount = board.teamA.length;

  useLayoutEffect(() => {
    if (eventIndex < 0 || currentEvent?.type !== "attack") {
      setAttackMotion(null);
      return;
    }

    const attackerKey = buildSlotKey(
      currentEvent.attacker.team,
      currentEvent.attacker.lane,
      currentEvent.attacker.slot,
    );
    const targetKey = buildSlotKey(
      currentEvent.target.team,
      currentEvent.target.lane,
      currentEvent.target.slot,
    );
    const attackerNode = slotRefs.current[attackerKey];
    const targetNode = slotRefs.current[targetKey];

    if (!attackerNode || !targetNode) {
      setAttackMotion(null);
      return;
    }

    const attackerRect = attackerNode.getBoundingClientRect();
    const targetRect = targetNode.getBoundingClientRect();
    const rawDx =
      targetRect.left +
      targetRect.width / 2 -
      (attackerRect.left + attackerRect.width / 2);
    const rawDy =
      targetRect.top +
      targetRect.height / 2 -
      (attackerRect.top + attackerRect.height / 2);
    const distance = Math.hypot(rawDx, rawDy);

    if (distance <= 0.01) {
      setAttackMotion({
        attackerKey,
        eventIndex,
        dx: 0,
        dy: 0,
        tiltDeg: 0,
      });
      return;
    }

    // Move until card bodies contact, then slightly overlap for visible impact.
    const contactDistance = (attackerRect.width + targetRect.width) / 2 - 16;
    const travelDistance = Math.max(0, distance - contactDistance);
    const travelScale = travelDistance / distance;
    const tiltDeg = currentEvent.attacker.team === "teamA" ? 30 : -30;

    setAttackMotion({
      attackerKey,
      eventIndex,
      dx: rawDx * travelScale,
      dy: rawDy * travelScale,
      tiltDeg,
    });
  }, [currentEvent, eventIndex]);

  return (
    <Root>
      <Header>
        <Title>Combat Replay</Title>
        <WinnerBadge winner={result.winner} data-testid="winner-badge">
          Winner: {result.winner}
        </WinnerBadge>
      </Header>

      <Controls>
        <Label>
          Speed
          <Range
            type="range"
            min={MIN_SPEED}
            max={MAX_SPEED}
            step={0.25}
            value={playbackSpeed}
            onChange={(event) =>
              setPlaybackSpeed(normalizeSpeed(Number(event.target.value)))
            }
            aria-label="Playback speed"
          />
          {playbackSpeed.toFixed(2)}x
        </Label>
        <Button type="button" onClick={() => setPlaying((current) => !current)}>
          {playing ? "Pause" : "Play"}
        </Button>
        <Button
          type="button"
          onClick={() => {
            setEventIndex(-1);
            setPlaying(autoPlay);
          }}
        >
          Reset
        </Button>
        <StepLabel data-testid="step-label">
          Step: {Math.max(0, eventIndex + 1)} / {result.events.length}
        </StepLabel>
      </Controls>

      <Battlefield>
        {laneCount === 0 && <div>No lanes to render.</div>}
        {Array.from({ length: laneCount }, (_, laneIndex) => {
          const slotCount = Math.max(
            board.teamA[laneIndex].length,
            board.teamB[laneIndex].length,
          );
          return (
            <Lane key={`lane-${laneIndex}`}>
              <TeamsGrid>
                {(["teamA", "teamB"] as TeamKey[]).map((teamKey) => (
                  <TeamColumn key={`${teamKey}-${laneIndex}`}>
                    <Slots>
                      {Array.from({ length: slotCount }, (_, slotIndex) => {
                        const unit = board[teamKey][laneIndex][slotIndex];
                        const slotKey = buildSlotKey(
                          teamKey,
                          laneIndex,
                          slotIndex,
                        );
                        const motion =
                          attackMotion &&
                          attackMotion.eventIndex === eventIndex &&
                          attackMotion.attackerKey === slotKey
                            ? attackMotion
                            : null;
                        const animationType = getSlotAnimationType(
                          teamKey,
                          laneIndex,
                          slotIndex,
                          currentEvent,
                        );
                        const damageTaken = getDamageTakenForSlot(
                          teamKey,
                          laneIndex,
                          slotIndex,
                          currentEvent,
                        );
                        const isCurrentAttacker = isAttackerSlot(
                          teamKey,
                          laneIndex,
                          slotIndex,
                          currentEvent,
                        );
                        return (
                          <Slot key={`${teamKey}-${laneIndex}-${slotIndex}`}>
                            {!unit ? (
                              <EmptySlot>Empty Slot</EmptySlot>
                            ) : (
                              <>
                                {damageTaken &&
                                damageTaken > 0 &&
                                !isCurrentAttacker ? (
                                  <DamageIndicator
                                    data-testid={`damage-${teamKey}-${laneIndex}-${slotIndex}`}
                                  >
                                    <DamageText
                                      durationMs={damageFloatDurationMs}
                                      delayMs={damageFloatDelayMs}
                                    >
                                      {damageTaken}
                                    </DamageText>
                                  </DamageIndicator>
                                ) : null}
                                <AnimatedCardFrame
                                  alive={unit.alive}
                                  animationType={animationType}
                                  attackDurationMs={attackDurationMs}
                                  targetDurationMs={targetDurationMs}
                                  faintDurationMs={faintDurationMs}
                                  data-testid={`${teamKey}-lane-${laneIndex}-slot-${slotIndex}`}
                                  ref={(node) => {
                                    slotRefs.current[slotKey] = node;
                                  }}
                                  style={
                                    motion
                                      ? ({
                                          "--attack-dx": `${motion.dx}px`,
                                          "--attack-dy": `${motion.dy}px`,
                                          "--attack-tilt": `${motion.tiltDeg}deg`,
                                        } as CSSProperties)
                                      : undefined
                                  }
                                >
                                  {damageTaken &&
                                  damageTaken > 0 &&
                                  isCurrentAttacker ? (
                                    <DamageIndicator
                                      data-testid={`damage-${teamKey}-${laneIndex}-${slotIndex}`}
                                      style={
                                        {
                                          "--damage-counter-rotate":
                                            "calc(var(--attack-tilt, 0deg) * -1)",
                                        } as CSSProperties
                                      }
                                    >
                                      <DamageText
                                        durationMs={damageFloatDurationMs}
                                        delayMs={damageFloatDelayMs}
                                      >
                                        {damageTaken}
                                      </DamageText>
                                    </DamageIndicator>
                                  ) : null}
                                  <CardComponent card={unit.card} />
                                </AnimatedCardFrame>
                              </>
                            )}
                          </Slot>
                        );
                      })}
                    </Slots>
                  </TeamColumn>
                ))}
              </TeamsGrid>
            </Lane>
          );
        })}
      </Battlefield>
    </Root>
  );
}
