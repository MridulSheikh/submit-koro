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
import { FileText, LayoutDashboard, LogOut, Star, UsersRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export type UserRole = "MENTOR" | "STUDENT";

const navigation = {
  MENTOR: {
    groupName: "Mentor View",
    links: [
      { text: "Overview", icon: LayoutDashboard, route: "/" },
      { text: "Review Submissions", icon: Star, route: "/review" },
      { text: "My Submissions", icon: FileText, route: "/submission" },
      { text: "Manage Team", icon: UsersRound, route: "/mentors" },
    ],
  },
  STUDENT: {
    groupName: "Student View",
    links: [{ text: "My Submissions", icon: FileText, route: "/submission" }],
  },
};

const AppSidebar = ({ role = "MENTOR" }: { role?: UserRole }) => {
  const pathname = usePathname();
  const { groupName, links } = navigation[role];

  return (
    <Sidebar>
      <SidebarHeader className="border-b border-slate-200 px-5 py-3">
        <Link href="/" aria-label="Submit Koro home" className="inline-flex rounded-md outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
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
        <p className="text-xs font-medium text-slate-500">{role === "MENTOR" ? "Mentor workspace" : "Student workspace"}</p>
        <p className="mt-1 text-[11px] text-slate-400">Submission management</p>
        <SidebarMenu className="mt-3">
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/login" />}
              className="h-9 rounded-lg px-2 text-xs font-medium text-slate-500 hover:bg-rose-50 hover:text-rose-700 [&_svg]:size-4"
            >
              <LogOut />
              <span>Log out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
