"use client"

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, XCircle, Copy, Key, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@clerk/nextjs";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { formatJSON5, generateUUID, getDefaultShortcut } from "@/lib/utils";
import { WebSubURLShortcutSchema } from "@/lib/schema";
import { WebSubURLShortcut } from "@/lib/types";

interface ShortcutFormProps {
  initialData?: WebSubURLShortcut;
  onSubmit: (data: WebSubURLShortcut) => void;
  onCancel?: () => void;
}

export function ShortcutForm({ initialData, onSubmit, onCancel }: ShortcutFormProps) {
  const { isLoaded, isSignedIn, userId } = useAuth();

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  if (!isSignedIn) {
    return <div>Sign in to configure shortcuts</div>;
  }

  const defaultValues = initialData
    ? { ...initialData, userId } // Ajout de l'identifiant utilisateur par défaut
    : { ...getDefaultShortcut(), userId };

  const form = useForm({
    resolver: zodResolver(WebSubURLShortcutSchema),
    defaultValues,
  });
  
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "shortcuts",
  });

  const handleSubmit = (data: WebSubURLShortcut) => {
    console.log("Form submitted with data:", data); // Ajout d'un log pour vérifier l'appel
    // Ensure UUID exists (it should be optional in the schema but required in the app)
    const finalData = {
      ...data,
      uuid: data.uuid || generateUUID(),
      userId, // Ajout de l'identifiant utilisateur dans les données finales
    };
    onSubmit(finalData);
  };

  const addShortcut = () => {
    append({
      isModifiers: {
        isControl: false,
        isShift: false,
        isAlt: false,
        isMeta: false,
      },
      key: "",
      uniqueIdentifier: "",
      isRelativeToScrollItem: false,
    });
  };

  const onDragEnd = (result: any) => {
    const { source, destination } = result;

    console.log("Drag result:", result); // Ajout d'un log pour vérifier le résultat du drag
    if (!destination) return;
    if (source.index === destination.index) return; // Aucun changement si la position est identique

    const shortcuts = Array.from(form.getValues("shortcuts"));
    const [moved] = shortcuts.splice(source.index, 1);
    shortcuts.splice(destination.index, 0, moved);
    form.setValue("shortcuts", shortcuts);
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={form.handleSubmit(handleSubmit)}
        className="space-y-6"
      >
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Shortcut Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="hrefRegex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL Regex Pattern</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., https://example.com/.*" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scrollBoxIdentifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scroll Box Identifier</FormLabel>
                  <FormControl>
                    <Input placeholder="CSS selector for scroll container" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <Label className="text-lg font-semibold">Shortcuts</Label>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={addShortcut}
                  className="flex gap-1 items-center"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Add Shortcut</span>
                </Button>
              </div>
              
              <div className="space-y-4">
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="shortcuts">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-4"
                      >
                        {fields.map((field, index) => (
                          <Draggable key={field.id} draggableId={field.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-4 border rounded-lg relative"
                              >
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {remove(index); console.log("Shortcut removed");}}
                                  className="absolute right-2 top-2 text-muted-foreground hover:text-destructive"
                                >
                                  <XCircle className="h-5 w-5" />
                                </Button>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                  <FormField
                                    control={form.control}
                                    name={`shortcuts.${index}.key`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Key</FormLabel>
                                        <FormControl>
                                          <div className="relative">
                                            <Key className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                            <Input className="pl-8" placeholder="e.g., j, k, Enter" {...field} />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  
                                  <FormField
                                    control={form.control}
                                    name={`shortcuts.${index}.uniqueIdentifier`}
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Unique Identifier</FormLabel>
                                        <FormControl>
                                          <Input placeholder="Identifier for this shortcut" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label>Modifier Keys</Label>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                    <FormField
                                      control={form.control}
                                      name={`shortcuts.${index}.isModifiers.isControl`}
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox 
                                              checked={field.value} 
                                              onCheckedChange={field.onChange} 
                                            />
                                          </FormControl>
                                          <FormLabel className="cursor-pointer">Control</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`shortcuts.${index}.isModifiers.isShift`}
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox 
                                              checked={field.value} 
                                              onCheckedChange={field.onChange} 
                                            />
                                          </FormControl>
                                          <FormLabel className="cursor-pointer">Shift</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`shortcuts.${index}.isModifiers.isAlt`}
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox 
                                              checked={field.value} 
                                              onCheckedChange={field.onChange} 
                                            />
                                          </FormControl>
                                          <FormLabel className="cursor-pointer">Alt</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                    
                                    <FormField
                                      control={form.control}
                                      name={`shortcuts.${index}.isModifiers.isMeta`}
                                      render={({ field }) => (
                                        <FormItem className="flex items-center space-x-2">
                                          <FormControl>
                                            <Checkbox 
                                              checked={field.value} 
                                              onCheckedChange={field.onChange} 
                                            />
                                          </FormControl>
                                          <FormLabel className="cursor-pointer">Meta</FormLabel>
                                        </FormItem>
                                      )}
                                    />
                                  </div>
                                </div>
                                
                                <FormField
                                  control={form.control}
                                  name={`shortcuts.${index}.isRelativeToScrollItem`}
                                  render={({ field }) => (
                                    <FormItem className="flex items-center space-x-2 mt-4">
                                      <FormControl>
                                        <Checkbox 
                                          checked={field.value} 
                                          onCheckedChange={field.onChange} 
                                        />
                                      </FormControl>
                                      <FormLabel className="cursor-pointer">Relative to Scroll Item</FormLabel>
                                    </FormItem>
                                  )}
                                />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
                
                {fields.length === 0 && (
                  <div className="text-center p-4 border border-dashed rounded-lg">
                    <p className="text-muted-foreground">No shortcuts added</p>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addShortcut}
                      className="mt-2"
                    >
                      Add your first shortcut
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" className="flex items-center gap-1">
              <Save className="h-4 w-4" />
              <span>Save</span>
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
