import { contact } from "./gym";
import type { Trek, Plan } from "./gym";
import { inr, longDate } from "./format";

/**
 * WhatsApp flows.
 *
 * Phase 1 (live now): wa.me deep links. Every enquiry lands in the gym's own
 * WhatsApp inbox pre-written, so the owner needs no setup at all.
 *
 * Phase 2 (server/whatsapp.ts): the same message objects are posted to the
 * WhatsApp Cloud API for auto-replies, trek reminders and renewal nudges.
 */

const digitsOnly = (n: string) => n.replace(/[^0-9]/g, "");

export function waLink(message: string, phone: string = contact.phone) {
  return `https://wa.me/${digitsOnly(phone)}?text=${encodeURIComponent(message)}`;
}

export function telLink(phone: string = contact.phone) {
  return `tel:${phone}`;
}

export const waMessages = {
  general: () =>
    `Hi Fitness 7! I found you online and I'd like to know more about joining.`,

  trial: () =>
    `Hi Fitness 7! I'd like to book my free trial session. My name is `,

  plan: (plan: Plan) =>
    `Hi Fitness 7! I'm interested in the ${plan.name} membership (${inr(
      plan.priceINR,
    )} ${plan.period}). Could you tell me the next steps?`,

  class: (className: string) =>
    `Hi Fitness 7! I'd like to join the ${className} class. When can I start?`,

  trek: (trek: Trek) =>
    `Hi Fitness 7! I want to book a slot for the ${trek.title} trek on ${longDate(
      trek.date,
    )}.\n\nName: \nPhone: \nAre you a member? `,

  personalTraining: () =>
    `Hi Fitness 7! I'd like to talk about personal training. My goal is `,

  directions: () =>
    `Hi Fitness 7! Could you share the exact location of the gym?`,
} as const;

export const wa = {
  general: () => waLink(waMessages.general()),
  trial: () => waLink(waMessages.trial()),
  plan: (plan: Plan) => waLink(waMessages.plan(plan)),
  class: (name: string) => waLink(waMessages.class(name)),
  trek: (trek: Trek) => waLink(waMessages.trek(trek)),
  personalTraining: () => waLink(waMessages.personalTraining()),
  directions: () => waLink(waMessages.directions()),
};
