import { auth } from "@/auth";

export default async function HomePage() {
  const session = await auth();
  return <main className="">Sup homie:{JSON.stringify(session)}</main>;
}
