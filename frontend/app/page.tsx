import { redirect } from "next/navigation";

// The app entry point simply sends users to the meetings dashboard.
export default function Home() {
  redirect("/meetings");
}
