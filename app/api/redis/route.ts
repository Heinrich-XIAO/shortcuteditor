import { NextRequest, NextResponse } from "next/server";
import Redis from "ioredis";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { credentials, action, data } = await request.json();
    
    // Validate required fields
    if (!credentials || !action) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Create Redis client
    const redis = new Redis({
      host: credentials.host,
      port: credentials.port,
      username: credentials.username || undefined,
      password: credentials.password || undefined,
    });
    
    // Test the connection
    try {
      await redis.ping();
    } catch (error) {
      await redis.disconnect();
      return NextResponse.json(
        { error: "Failed to connect to Redis server" },
        { status: 500 }
      );
    }
    
    let result;
    const listKey = "shortcuts";
    
    switch (action) {
      case "test":
        result = { success: true, message: "Connected to Redis successfully" };
        break;
        
      case "get":
        const shortcuts = await redis.lrange(listKey, 0, -1);
        result = {
          shortcuts: shortcuts.map(item => {
            try {
              return JSON.parse(item);
            } catch (e) {
              return item;
            }
          })
        };
        break;
        
      case "save":
        if (!data) {
          await redis.disconnect();
          return NextResponse.json(
            { error: "No data provided for save action" },
            { status: 400 }
          );
        }
        
        // Save to Redis as a list item
        const jsonData = JSON.stringify(data);
        await redis.rpush(listKey, jsonData);
        result = { success: true, message: "Shortcut saved to Redis" };
        break;
        
      case "update":
        if (!data || !data.uuid) {
          await redis.disconnect();
          return NextResponse.json(
            { error: "Invalid data for update action" },
            { status: 400 }
          );
        }
        
        // Get all items from the list
        const items = await redis.lrange(listKey, 0, -1);
        let updated = false;
        
        // Find the item with matching UUID and update it
        for (let i = 0; i < items.length; i++) {
          try {
            const item = JSON.parse(items[i]);
            if (item.uuid === data.uuid) {
              // Replace the item
              await redis.lset(listKey, i, JSON.stringify(data));
              updated = true;
              break;
            }
          } catch (e) {
            // Skip invalid JSON items
            continue;
          }
        }
        
        if (updated) {
          result = { success: true, message: "Shortcut updated in Redis" };
        } else {
          result = { success: false, message: "Shortcut not found for update" };
        }
        break;
        
      case "delete":
        if (!data || !data.uuid) {
          await redis.disconnect();
          return NextResponse.json(
            { error: "UUID required for delete action" },
            { status: 400 }
          );
        }
        
        // Get all items from the list
        const allItems = await redis.lrange(listKey, 0, -1);
        let deleted = false;
        
        // Iterate through list to find and remove the item with matching UUID
        for (let i = 0; i < allItems.length; i++) {
          try {
            const item = JSON.parse(allItems[i]);
            if (item.uuid === data.uuid) {
              // Remove this item
              await redis.lrem(listKey, 1, allItems[i]);
              deleted = true;
              break;
            }
          } catch (e) {
            // Skip invalid JSON items
            continue;
          }
        }
        
        result = { 
          success: deleted, 
          message: deleted ? "Shortcut deleted from Redis" : "Shortcut not found" 
        };
        break;
        
      default:
        await redis.disconnect();
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }
    
    // Close Redis connection
    await redis.disconnect();
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Redis API error:", error);
    return NextResponse.json(
      { error: "Server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}