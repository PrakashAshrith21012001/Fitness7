/**
 * Squads — the cult.fit "This week's leaderboard" model.
 *
 * A squad is a named group of buddies (the member is in every squad they
 * belong to). The leaderboard ranks members by activities in a Mon–Sun week
 * with dense ranking (two people on 3 both rank 1, the next is 2). The feed
 * under it shows each member's week card and their latest moment.
 *
 * Demo data until the backend has real squads (CONFIRM with the owner).
 * `history` is newest-first: index 0 = this week, 1 = previous week, …
 */

export type SquadMember = {
  id: string;
  name: string;
  initials: string;
  /** avatar tint */
  tint: string;
  weeksActive: number;
  /** activities per week, newest first */
  history: number[];
  kcal?: number;
  steps?: number;
  activeMin?: number;
  /** latest moment */
  moment?: { photo: string; caption: string };
};

export type Squad = { id: string; name: string; ownerId: string; memberIds: string[] };

export const squadMembers: SquadMember[] = [
  { id: "archu", name: "Archu", initials: "AR", tint: "#2ec5ff", weeksActive: 4, history: [3, 4, 2, 3, 5, 1], moment: { photo: "crossfit", caption: "3 Month Streak!" } },
  { id: "arun", name: "Arun", initials: "AN", tint: "#9b6bff", weeksActive: 9, history: [3, 3, 4, 2, 3, 3], moment: { photo: "strength", caption: "3 Months Strong!" } },
  { id: "hari", name: "Hari", initials: "HA", tint: "#ff8a3d", weeksActive: 16, history: [1, 4, 3, 5, 4, 4], moment: { photo: "combat", caption: "5 Months Strong!" } },
  { id: "gokul", name: "Gokul Mechan", initials: "GM", tint: "#3ddc84", weeksActive: 2, history: [0, 2, 1, 0, 2, 1] },
];

export const squads: Squad[] = [
  { id: "hari-squad", name: "Hari's Squad", ownerId: "hari", memberIds: ["hari", "gokul"] },
  { id: "archu-squad", name: "Archu's Squad", ownerId: "archu", memberIds: ["archu", "arun", "hari"] },
];

/** activities for a member in the week `weeksAgo` back (0 = this week) */
export const activitiesFor = (m: SquadMember, weeksAgo: number) => m.history[weeksAgo] ?? 0;

/** dense rank: equal scores share a rank, the next distinct score is +1 */
export function denseRank<T>(rows: T[], score: (r: T) => number): (T & { rank: number })[] {
  const sorted = [...rows].sort((a, b) => score(b) - score(a));
  let rank = 0;
  let last: number | null = null;
  return sorted.map((r) => {
    const s = score(r);
    if (s !== last) {
      rank += 1;
      last = s;
    }
    return { ...r, rank };
  });
}

/** classes squad buddies have booked — "Upcoming classes of the squad" */
export type SquadClass = { id: string; classId: string; dayOffset: number; time: string; memberIds: string[] };
export const squadClasses: SquadClass[] = [
  { id: "sc-1", classId: "hiit", dayOffset: 1, time: "07:00", memberIds: ["archu", "hari"] },
  { id: "sc-2", classId: "strength", dayOffset: 2, time: "18:00", memberIds: ["arun"] },
  { id: "sc-3", classId: "hiit", dayOffset: 3, time: "07:00", memberIds: ["archu", "arun", "gokul"] },
];

export const squadCopy = {
  title: "This week's leaderboard",
  everyone: "Everyone",
  footer: "Keep Your Fitness Journey Going!",
  addFriends: "Add friends to your squad",
  devicesTitle: "Fitness Devices",
  devicesInfo: "If you have a smart watch or any other fitness tracker please connect it with any of the health apps below for Fitness 7 to fetch your health data.",
  weeksActiveInfo: "Do at least one workout to stay consistent this week.",
  streakRisk: "You are going to lose your streak if you don't do any activity by Sunday",
  slipping: "You were doing so well, don't lose the progress you made",
};
