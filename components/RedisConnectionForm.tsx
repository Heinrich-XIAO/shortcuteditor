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
  onConnect: () => void;
  isConnected: boolean;
}

export function RedisConnectionForm({
  onConnect,
  isConnected,
}: RedisConnectionFormProps) {
  const handleSubmit = () => {
    onConnect();
  };

  return (
    <Button 
      variant={isConnected ? "default" : "outline"} 
      className="flex items-centers gap-1"
      onClick={handleSubmit}
    >
      <Database className="h-4 w-4" />
      <span>{isConnected ? "Connected to database" : "Connect to database"}</span>
    </Button>
  );
}