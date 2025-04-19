"use client";

import { useState, useEffect } from "react";
import { PlusCircle, ScanText } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import {
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
	useAuth,
} from '@clerk/nextjs'
import { ThemeToggle } from "@/components/ThemeToggle";
import { ShortcutForm } from "@/components/ShortcutForm";
import { ShortcutList } from "@/components/ShortcutList";
import { ShortcutPreview } from "@/components/ShortcutPreview";
import { ImportExport } from "@/components/ImportExport";
import { RedisConnectionForm } from "@/components/RedisConnectionForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WebSubURLShortcut } from "@/lib/types";

export default function Home() {
  const { toast } = useToast();
  const [shortcuts, setShortcuts] = useState<WebSubURLShortcut[]>([]);
  const [selectedShortcut, setSelectedShortcut] = useState<WebSubURLShortcut | null>(null);
  const [editingShortcut, setEditingShortcut] = useState<WebSubURLShortcut | null>(null);
  const [activeTab, setActiveTab] = useState<string>("list");
  const [isRedisConnected, setIsRedisConnected] = useState<boolean>(false);
	const { userId, isSignedIn, isLoaded } = useAuth();

  // Load shortcuts from Redis if connected
  useEffect(() => {
    const fetchRedisShortcuts = async () => {
      try {
        const response = await fetch("/api/redis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
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
      console.log("Fetching shortcuts from Redis...");
      fetchRedisShortcuts();
    }
  }, [isRedisConnected]); // modified dependency array to only include isRedisConnected

  const handleSaveShortcut = async (shortcut: WebSubURLShortcut) => {
    try {
			console.log(shortcut);
      const isEditing = shortcuts.some((s) => s.uuid === shortcut.uuid);
      
      if (isEditing) {
        const updatedShortcuts = shortcuts.map((s) =>
          s.uuid === shortcut.uuid ? shortcut : s
        );
        setShortcuts(updatedShortcuts);
        
        if (isRedisConnected) {
          await fetch("/api/redis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
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
        const newShortcuts = [...shortcuts, shortcut];
        setShortcuts(newShortcuts);
        
        if (isRedisConnected) {
          await fetch("/api/redis", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
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
      
      setEditingShortcut(null);
      setActiveTab("list");
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

      if (isRedisConnected) {
        await fetch("/api/redis", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "delete",
            data: { uuid },
          }),
        });
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

  const handleConnectToRedis = async () => {
    try {
      const response = await fetch("/api/redis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "test",
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        setIsRedisConnected(true);
        
        toast({
          title: "Connected",
          description: "Connected to database",
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

  // Auto-connect to Redis on mount
  useEffect(() => {
		if (isLoaded) {
			if (isSignedIn) {
				handleConnectToRedis();
			} else {
				setIsRedisConnected(false);
			}
		}
  }, [isLoaded]);

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
            <ThemeToggle />
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <div className="flex space-x-2">
                <SignInButton mode="modal">
                  <Button variant="outline">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button variant="outline">Sign Up</Button>
                </SignUpButton>
              </div>
            </SignedOut>
          </div>
        </div>
      </header>
			
			<SignedIn>
				<main className="container mx-auto p-4">
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
						<div className="lg:col-span-2">
							<Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
								<div className="flex justify-between items-center mb-4">
									<TabsList>
										<TabsTrigger value="list">My Shortcuts</TabsTrigger>
										<TabsTrigger value="create" className="flex items-center gap-1">
											<PlusCircle className="h-4 w-4" />
											<span>{editingShortcut ? "Edit" : "Create"}</span>
										</TabsTrigger>
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
			</SignedIn>
    </div>
  );
}
