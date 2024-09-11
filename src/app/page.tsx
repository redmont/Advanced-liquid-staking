import { getServerAuthSession } from "@/server/auth";

export default async function HomePage() {
  const session = await getServerAuthSession();
  return <main className="">Sup homie:{JSON.stringify(session)}</main>;
}
