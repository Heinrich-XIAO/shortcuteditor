"use client";

import { useState, useEffect } from "react";
import { PlusCircle, ScanText } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

import { ThemeToggle } from "@/components/ThemeToggle";
import { ShortcutForm } from "@/components/ShortcutForm";
import { ShortcutList } from "@/components/ShortcutList";
import { ShortcutPreview } from "@/components/ShortcutPreview";
import { ImportExport } from "@/components/ImportExport";
import { RedisConnectionForm } from "@/components/RedisConnectionForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { WebSubURLShortcut } from "@/lib/types";
import { RedisConnectionSchemaType } from "@/lib/schema";

export default function Home() {
  const { toast } = useToast();
  const [shortcuts, setShortcuts] = useLocalStorage<WebSubURLShortcut[]>("shortcuts", []);
  const [selectedShortcut, setSelectedShortcut] = useState<WebSubURLShortcut | null>(null);
  const [editingShortcut, setEditingShortcut] = useState<WebSubURLShortcut | null>(null);
  const [activeTab, setActiveTab] = useState<string>("create");
  const [isRedisConnected, setIsRedisConnected] = useState<boolean>(false);
  const [redisCredentials, setRedisCredentials] = useState<RedisConnectionSchemaType | null>(null);

  // Load shortcuts from Redis if connected
  useEffect(() => {
    const fetchRedisShortcuts = async () => {
      if (!redisCredentials) return;
      
      try {
        const response = await fetch("/api/redis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credentials: redisCredentials,
            action: "get",
          }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.shortcuts) {
          setShortcuts(data.shortcuts);
          toast({
            title: "Success",
            description: "Shortcuts loaded from Redis",
          });
        } else {
          throw new Error(data.error || "Failed to load shortcuts from Redis");
        }
      } catch (error) {
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load shortcuts from Redis",
          variant: "destructive",
        });
      }
    };
    
    if (isRedisConnected) {
      fetchRedisShortcuts();
    }
  }, [isRedisConnected, redisCredentials, toast]);

  const handleSaveShortcut = async (shortcut: WebSubURLShortcut) => {
    try {
      // Check if we're editing an existing shortcut
      const isEditing = shortcuts.some((s) => s.uuid === shortcut.uuid);
      
      if (isEditing) {
        // Update existing shortcut
        const updatedShortcuts = shortcuts.map((s) =>
          s.uuid === shortcut.uuid ? shortcut : s
        );
        setShortcuts(updatedShortcuts);
        
        // Update in Redis if connected
        if (isRedisConnected && redisCredentials) {
          await fetch("/api/redis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              credentials: redisCredentials,
              action: "update",
              data: shortcut,
            }),
          });
        }
        
        toast({
          title: "Success",
          description: "Shortcut updated successfully",
        });
      } else {
        // Add new shortcut
        const newShortcuts = [...shortcuts, shortcut];
        setShortcuts(newShortcuts);
        
        // Save to Redis if connected
        if (isRedisConnected && redisCredentials) {
          await fetch("/api/redis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              credentials: redisCredentials,
              action: "save",
              data: shortcut,
            }),
          });
        }
        
        toast({
          title: "Success",
          description: "Shortcut saved successfully",
        });
      }
      
      // Reset editing state
      setEditingShortcut(null);
      setActiveTab("list");
      
      // Set as selected for preview
      setSelectedShortcut(shortcut);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save shortcut",
        variant: "destructive",
      });
    }
  };

  const handleEditShortcut = (shortcut: WebSubURLShortcut) => {
    setEditingShortcut(shortcut);
    setActiveTab("create");
  };

  const handleDeleteShortcut = async (uuid: string) => {
    try {
      // Delete from local state
      const updatedShortcuts = shortcuts.filter((s) => s.uuid !== uuid);
      setShortcuts(updatedShortcuts);
      
      // Delete from Redis if connected
      if (isRedisConnected && redisCredentials) {
        await fetch("/api/redis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credentials: redisCredentials,
            action: "delete",
            data: { uuid },
          }),
        });
      }
      
      // Clear selected if it's the one being deleted
      if (selectedShortcut?.uuid === uuid) {
        setSelectedShortcut(null);
      }
      
      toast({
        title: "Success",
        description: "Shortcut deleted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete shortcut",
        variant: "destructive",
      });
    }
  };

  const handleImportShortcuts = (importedShortcuts: WebSubURLShortcut[]) => {
    // Combine with existing shortcuts, avoiding duplicates by UUID
    const existing = new Set(shortcuts.map((s) => s.uuid));
    const newShortcuts = importedShortcuts.filter((s) => !existing.has(s.uuid));
    
    setShortcuts([...shortcuts, ...newShortcuts]);
    
    toast({
      title: "Import successful",
      description: `Imported ${newShortcuts.length} new shortcuts`,
    });
  };

  const handleConnectToRedis = async (credentials: RedisConnectionSchemaType) => {
    try {
      const response = await fetch("/api/redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          credentials,
          action: "test",
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsRedisConnected(true);
        setRedisCredentials(credentials);
        
        toast({
          title: "Connected",
          description: "Successfully connected to Redis server",
        });
      } else {
        throw new Error(data.error || "Failed to connect to Redis");
      }
    } catch (error) {
      toast({
        title: "Connection Error",
        description: error instanceof Error ? error.message : "Failed to connect to Redis",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ScanText className="h-6 w-6" />
            <h1 className="text-xl font-bold">WebSubURL Shortcut Manager</h1>
          </div>
          <div className="flex items-center space-x-3">
            <ImportExport shortcuts={shortcuts} onImport={handleImportShortcuts} />
            <RedisConnectionForm
              onConnect={handleConnectToRedis}
              isConnected={isRedisConnected}
            />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList>
                  <TabsTrigger value="create" className="flex items-center gap-1">
                    <PlusCircle className="h-4 w-4" />
                    <span>{editingShortcut ? "Edit" : "Create"}</span>
                  </TabsTrigger>
                  <TabsTrigger value="list">My Shortcuts</TabsTrigger>
                </TabsList>
                {activeTab === "list" && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setEditingShortcut(null);
                      setActiveTab("create");
                    }}
                    className="flex items-center gap-1"
                  >
                    <PlusCircle className="h-4 w-4" />
                    <span>New Shortcut</span>
                  </Button>
                )}
              </div>
              
              <TabsContent value="create" className="m-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShortcutForm
                    initialData={editingShortcut || undefined}
                    onSubmit={handleSaveShortcut}
                    onCancel={() => {
                      setEditingShortcut(null);
                      if (shortcuts.length > 0) {
                        setActiveTab("list");
                      }
                    }}
                  />
                </motion.div>
              </TabsContent>
              
              <TabsContent value="list" className="m-0">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ShortcutList
                    shortcuts={shortcuts}
                    onEdit={(shortcut) => {
                      setSelectedShortcut(shortcut);
                      handleEditShortcut(shortcut);
                    }}
                    onDelete={handleDeleteShortcut}
                  />
                </motion.div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="hidden lg:block">
            <ShortcutPreview shortcut={selectedShortcut || editingShortcut} />
          </div>
        </div>
      </main>
    </div>
  );
}