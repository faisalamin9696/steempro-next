"use client";
import NotificationsTable from "@/components/NotificationsTable";
import usePathnameClient from "@/libs/hooks/usePathnameClient";
import React from "react";

export default function ProfileNotificationsTab() {
  const { username } = usePathnameClient();
  return (
    <NotificationsTable
      username={username}
      onOpenChange={() => {}}
      isOpen={true}
    />
  );
}
