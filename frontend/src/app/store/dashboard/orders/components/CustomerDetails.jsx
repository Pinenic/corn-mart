"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";

export default function CustomerDetails({ customer = {}, loading = false }) {
  return (
    <Card className="rounded-2xl shadow-none w-full">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h2 className="font-semibold text-lg">Customer Details</h2>
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center">
            <Spinner className="size-8 text-blue-500" />
          </div>
        ) : (
          <div className="flex flex-col">
            <p className="flex justify-between text-muted-foreground capitalize">Name <span> {customer?.full_name || "name"}</span></p>
            <p className="flex justify-between text-muted-foreground ">email <span> {customer?.email || "email@email.com"}</span></p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
