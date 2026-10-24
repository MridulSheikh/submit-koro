"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  FileText,
  LayoutDashboard,
  LogOut,
  Star,
  UserRound,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth/client";
import type { DashboardUser } from "@/lib/auth/server";
import { withMutationToast } from "@/lib/mutation-toast";

const navigation = [
  { text: "Overview", icon: LayoutDashboard, route: "/", allowed: (user: DashboardUser) => user.role?.overviewPermission.includes("VIEW") },
  { text: "Review Submissions", icon: Star, route: "/review", allowed: (user: DashboardUser) => Boolean(user.role && user.role.reviewPermission.includes("REVIEW") && user.role.submissionPermission.some((item) => item === "VIEW" || item === "SUBMIT")) },
  { text: "My Submissions", icon: FileText, route: "/submission", allowed: (user: DashboardUser) => Boolean(user.role?.submissionPermission.some((item) => item === "VIEW" || item === "SUBMIT")) },
  { text: "Manage Team", icon: UsersRound, route: "/mentors", allowed: (user: DashboardUser) => Boolean(user.role?.teamPermission.some((item) => item === "VIEW" || item === "MANAGE")) },
  { text: "Edit Profile", icon: UserRound, route: "/profile", allowed: () => true },
];

const AppSidebar = ({ user }: { user: DashboardUser }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState("");
  const links = navigation.filter((item) => item.allowed(user));
  const homeRoute = links.some((item) => item.route === "/")
    ? "/"
    : links[0]?.route ?? "/profile";
  const groupName = `${user.role?.name ?? "Account"} workspace`;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    setSignOutError("");

    try {
      await withMutationToast({ loading: "Signing out…", success: "Signed out.", error: "Unable to log out." }, async () => {
        const { error } = await authClient.signOut();
        if (error) throw new Error(error.message || "Unable to log out. Please try again.");
      });

      router.replace("/login");
      router.refresh();
    } catch (error) {
      setSignOutError(
        error instanceof Error
          ? error.message
          : "Unable to log out. Please try again.",
      );
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-slate-200 px-5 py-3">
        <Link href={homeRoute} aria-label="Submit Koro home" className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
          <Image
            src="/light_theme_barnd_logo.png"
            alt="Submit Koro"
            width={677}
            height={369}
            priority
            className="h-auto w-[170px] object-contain"
          />
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3 py-5">
        <SidebarGroup className="p-0">
          <SidebarGroupLabel className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">{groupName}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {links.map(({ text, icon: Icon, route }) => (
                <SidebarMenuItem key={route}>
                  <SidebarMenuButton
                    render={<Link href={route} />}
                    isActive={pathname === route}
                    className="h-10 rounded-lg px-3 text-[13px] font-medium text-slate-600 hover:bg-blue-50 hover:text-slate-900 data-active:bg-blue-50 data-active:text-blue-800 [&_svg]:size-[17px] [&_svg]:text-slate-400 data-active:[&_svg]:text-blue-700"
                  >
                    <Icon />
                    <span>{text}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-slate-200 px-5 py-4">
        <p className="text-xs font-medium text-slate-500">{groupName}</p>
        <p className="mt-1 text-[11px] text-slate-400">Submission management</p>
        {signOutError && (
          <p className="mt-3 text-xs leading-5 text-red-600" role="alert">
            {signOutError}
          </p>
        )}
        <SidebarMenu className="mt-3">
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleSignOut}
              disabled={isSigningOut}
              aria-busy={isSigningOut}
              className="h-9 rounded-lg px-2 text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-60 [&_svg]:size-4"
            >
              <LogOut />
              <span>{isSigningOut ? "Logging out..." : "Log out"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
