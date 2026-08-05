import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import ChatInterface from "./ChatInterface";

export default async function PortalPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/");
  }

  const user = await currentUser();
  const userName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.username || "Employee";
  const userEmail = user?.emailAddresses?.[0]?.emailAddress || "";
  const userImage = user?.imageUrl || "";

  return (
    <div className="flex-1 flex flex-col h-screen bg-slate-50 overflow-hidden">
      <ChatInterface
        user={{
          name: userName,
          email: userEmail,
          imageUrl: userImage,
        }}
      />
    </div>
  );
}
