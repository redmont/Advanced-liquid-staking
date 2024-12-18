export function getTwoMondaysAgoTimestamp() {
  const now = new Date();
  now.setUTCHours(0, 0, 0, 0);

  // Get last Monday
  const lastMonday = new Date(now);
  lastMonday.setDate(lastMonday.getDate() - ((lastMonday.getDay() + 6) % 7));

  // Get the Monday before last Monday
  const lastLastMonday = new Date(lastMonday);
  lastLastMonday.setDate(lastLastMonday.getDate() - 7);

  return Math.floor(lastLastMonday.getTime() / 1000);
}
