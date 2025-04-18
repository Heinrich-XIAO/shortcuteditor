"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Database } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RedisConnectionSchema, RedisConnectionSchemaType } from "@/lib/schema";

interface RedisConnectionFormProps {
  onConnect: (credentials: RedisConnectionSchemaType) => void;
  isConnected: boolean;
}

export function RedisConnectionForm({
  onConnect,
  isConnected,
}: RedisConnectionFormProps) {
  const form = useForm<RedisConnectionSchemaType>({
    resolver: zodResolver(RedisConnectionSchema),
    defaultValues: {
      host: "",
      port: "6379",
      username: "",
      password: "",
    },
  });

  const handleSubmit = (data: RedisConnectionSchemaType) => {
    onConnect(data);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant={isConnected ? "default" : "outline"} 
          className="flex items-center gap-1"
        >
          <Database className="h-4 w-4" />
          <span>{isConnected ? "Connected to Redis" : "Connect to Redis"}</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Redis Connection</DialogTitle>
          <DialogDescription>
            Connect to your Redis server to save and manage shortcuts.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Host</FormLabel>
                  <FormControl>
                    <Input placeholder="localhost" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Port</FormLabel>
                  <FormControl>
                    <Input placeholder="6379" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password (optional)</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-6">
              <Button type="submit">Connect</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}