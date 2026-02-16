"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Copy, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import type { ApiKeyInfo } from "@/types";
import { DATE_FORMAT } from "@/lib/constants";

export default function ApiKeysPage() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const { data, isLoading } = useQuery<{ data: ApiKeyInfo[] }>({
    queryKey: ["api-keys"],
    queryFn: async () => {
      const res = await fetch("/api/v1/api-keys");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (name: string) => {
      const res = await fetch("/api/v1/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to create API key");
      return res.json();
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      setGeneratedKey(result.data?.key || null);
      setNewKeyName("");
    },
    onError: () => {
      toast.error("Failed to create API key");
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/v1/api-keys/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to revoke key");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["api-keys"] });
      toast.success("API key revoked");
    },
  });

  const copyKey = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("Copied to clipboard");
  };

  const keys = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="API Keys"
        description="Manage your API keys for programmatic access"
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 size-4" />
            Create Key
          </Button>
        }
      />

      {isLoading ? (
        <TableSkeleton />
      ) : keys.length === 0 ? (
        <EmptyState
          icon={Key}
          message="No API keys yet"
          actionLabel="Create your first key"
          onAction={() => setCreateOpen(true)}
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Key Prefix</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last Used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell className="font-medium">
                      {apiKey.name}
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted rounded px-1.5 py-0.5 text-sm">
                        {apiKey.prefix}...
                      </code>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(new Date(apiKey.createdAt), DATE_FORMAT)}
                    </TableCell>
                    <TableCell className="text-sm">
                      {apiKey.lastUsedAt
                        ? format(new Date(apiKey.lastUsedAt), DATE_FORMAT)
                        : "Never"}
                    </TableCell>
                    <TableCell>
                      {apiKey.revoked ? (
                        <Badge variant="destructive">Revoked</Badge>
                      ) : (
                        <Badge variant="default">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {!apiKey.revoked && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm">
                              Revoke
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Revoke API key?
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently revoke the key &quot;
                                {apiKey.name}&quot;. Any applications using
                                this key will lose access.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  revokeMutation.mutate(apiKey.id)
                                }
                                className="bg-destructive text-white hover:bg-destructive/90"
                              >
                                Revoke
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) {
            setGeneratedKey(null);
            setNewKeyName("");
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {generatedKey ? "API Key Created" : "Create API Key"}
            </DialogTitle>
            <DialogDescription>
              {generatedKey
                ? "Copy your key now. You won't be able to see it again."
                : "Enter a name for your new API key."}
            </DialogDescription>
          </DialogHeader>

          {generatedKey ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <code className="bg-muted flex-1 rounded p-3 text-sm break-all">
                  {generatedKey}
                </code>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => copyKey(generatedKey)}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => {
                    setCreateOpen(false);
                    setGeneratedKey(null);
                  }}
                >
                  Done
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (newKeyName.trim()) {
                  createMutation.mutate(newKeyName.trim());
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="keyName">Key Name</Label>
                <Input
                  id="keyName"
                  placeholder="e.g., Production API"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!newKeyName.trim() || createMutation.isPending}
                >
                  {createMutation.isPending ? "Creating..." : "Create"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
