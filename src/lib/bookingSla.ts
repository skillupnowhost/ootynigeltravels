export const CONFIRMATION_SLA_HOURS = 12;

/** A booking is "overdue" once it's sat Pending for longer than the confirmation SLA — computed live, not stored. */
export function isBookingOverdue(status: string, createdAt: string): boolean {
  if (status !== "Pending") return false;
  return hoursSinceCreated(createdAt) > CONFIRMATION_SLA_HOURS;
}

export function hoursSinceCreated(createdAt: string): number {
  return (Date.now() - new Date(createdAt).getTime()) / (60 * 60 * 1000);
}
