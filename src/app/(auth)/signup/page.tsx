import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SignupPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Registration Closed</CardTitle>
        <CardDescription>
          Registration is currently closed. Contact your administrator for
          access.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/login">Back to Sign in</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
