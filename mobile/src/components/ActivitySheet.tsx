import { FitnessProfile } from "@/components/FitnessProfile";
import { Sheet } from "@/components/Sheet";

/**
 * Home's pull-up weekly-activity sheet (cult.fit): swipe up on the
 * "0/3 This Week Activity" bar and the whole MY PROFILE pane slides over
 * Home with the page peeking out above it.
 */
export function ActivitySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Sheet open={open} onClose={onClose} full bg="#1d2342">
      <FitnessProfile sheet onLeave={onClose} />
    </Sheet>
  );
}
