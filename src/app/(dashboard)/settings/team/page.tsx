"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { UserPlus, MoreHorizontal, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { PageHeader } from "@/components/shared/page-header";
import { FormSkeleton } from "@/components/shared/loading-skeleton";
import { UserAvatar } from "@/components/shared/user-avatar";
import type { TeamWithMembers, UserProfile } from "@/types";
import { ROLES, DATE_FORMAT } from "@/lib/constants";

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["ADMIN", "MEMBER"]),
});

type InviteForm = z.infer<typeof inviteSchema>;

const roleBadgeVariant: Record<
  string,
  "default" | "secondary" | "outline"
> = {
  OWNER: "default",
  ADMIN: "secondary",
  MEMBER: "outline",
};

export default function TeamSettingsPage() {
  const queryClient = useQueryClient();
  const [inviting, setInviting] = useState(false);

  const { data: userData } = useQuery<{ data: UserProfile }>({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const res = await fetch("/api/v1/users/me");
      return res.json();
    },
  });

  const teamId = userData?.data?.teamId;

  const { data, isLoading } = useQuery<{ data: TeamWithMembers }>({
    queryKey: ["team", teamId],
    queryFn: async () => {
      const res = await fetch(`/api/v1/teams/${teamId}`);
      return res.json();
    },
    enabled: !!teamId,
  });

  const inviteForm = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: { role: "MEMBER" },
  });

  const inviteMutation = useMutation({
    mutationFn: async (formData: InviteForm) => {
      const res = await fetch(`/api/v1/teams/${teamId}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to invite member");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Invitation sent");
      inviteForm.reset({ role: "MEMBER" });
      setInviting(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: async ({
      memberId,
      role,
    }: {
      memberId: string;
      role: string;
    }) => {
      const res = await fetch(
        `/api/v1/teams/${teamId}/members/${memberId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ role }),
        }
      );
      if (!res.ok) throw new Error("Failed to change role");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Role updated");
    },
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await fetch(
        `/api/v1/teams/${teamId}/members/${memberId}`,
        { method: "DELETE" }
      );
      if (!res.ok) throw new Error("Failed to remove member");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team"] });
      toast.success("Member removed");
    },
  });

  if (isLoading || !teamId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Team Settings" />
        <FormSkeleton />
      </div>
    );
  }

  const team = data?.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Settings"
        description="Manage your team members and invitations"
      />

      {team && (
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>{team.name}</CardTitle>
            <CardDescription>Slug: {team.slug}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <Card className="max-w-3xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>
              {team?.members?.length ?? 0} team member(s)
            </CardDescription>
          </div>
          <Button onClick={() => setInviting(!inviting)} size="sm">
            <UserPlus className="mr-2 size-4" />
            Invite
          </Button>
        </CardHeader>
        <CardContent>
          {inviting && (
            <form
              onSubmit={inviteForm.handleSubmit((data) =>
                inviteMutation.mutate(data)
              )}
              className="mb-4 flex gap-2"
            >
              <div className="flex-1">
                <Input
                  placeholder="email@example.com"
                  {...inviteForm.register("email")}
                />
              </div>
              <Select
                value={inviteForm.watch("role")}
                onValueChange={(val) =>
                  inviteForm.setValue("role", val as InviteForm["role"])
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                  <SelectItem value="MEMBER">Member</SelectItem>
                </SelectContent>
              </Select>
              <Button type="submit" disabled={inviteMutation.isPending}>
                Send
              </Button>
            </form>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {team?.members?.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={member.user.name}
                        image={member.user.image}
                      />
                      <div>
                        <p className="text-sm font-medium">
                          {member.user.name || "Unnamed"}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={roleBadgeVariant[member.role] || "outline"}>
                      {member.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {format(new Date(member.joinedAt), DATE_FORMAT)}
                  </TableCell>
                  <TableCell>
                    {member.role !== ROLES.OWNER && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon-sm">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              changeRoleMutation.mutate({
                                memberId: member.id,
                                role:
                                  member.role === ROLES.ADMIN
                                    ? ROLES.MEMBER
                                    : ROLES.ADMIN,
                              })
                            }
                          >
                            Make{" "}
                            {member.role === ROLES.ADMIN ? "Member" : "Admin"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() =>
                              removeMemberMutation.mutate(member.id)
                            }
                          >
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {team?.invitations && team.invitations.length > 0 && (
        <>
          <Separator className="max-w-3xl" />
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.invitations.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Mail className="text-muted-foreground size-4" />
                      <div>
                        <p className="text-sm font-medium">{invite.email}</p>
                        <p className="text-muted-foreground text-xs">
                          Invited as {invite.role} - Expires{" "}
                          {format(new Date(invite.expiresAt), DATE_FORMAT)}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline">{invite.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
