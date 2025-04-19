import { NextRequest, NextResponse } from "next/server";
import { Redis } from '@upstash/redis';
import JSON5 from 'json5';
import { auth } from '@clerk/nextjs/server';
import { WebSubURLShortcut } from "@/lib/types";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
	try {
		const { action, data } = await request.json();

		// Validate required fields
		if (!action) {
			return NextResponse.json(
				{ error: "Missing required fields" },
				{ status: 400 }
			);
		}

		// Create Redis client
		// Read from ENV
		const redis = new Redis({
			url: process.env.UPSTASH_REDIS_REST_URL,
			token: process.env.UPSTASH_REDIS_REST_TOKEN
		});

		// Test the connection
		try {
			await redis.ping();
		} catch (error) {
			return NextResponse.json(
				{ error: "Failed to connect to Redis server" },
				{ status: 500 }
			);
		}

		let result;
		const listKey = "shortcuts";

		const { userId } = await auth();

		if (userId === null) {
			return NextResponse.json(
				{ error: "User not authenticated" },
				{ status: 401 }
			);
		}

		switch (action) {
			case "test":
				result = { success: true, message: "Connected to Redis successfully" };
				break;

			case "get":
				const shortcuts = await redis.lrange(listKey, 0, -1);
				result = {
					shortcuts: shortcuts.map(item => {
						try {
							return JSON5.parse(item);
						} catch (e) {
							return item;
						}
					})
				};

				// TODO: Paywall. Only allow user to view their own shortcuts without payment, with payment they can view all public shortcuts
				break;

			case "save":
				if (!data) {
					return NextResponse.json(
						{ error: "No data provided for save action" },
						{ status: 400 }
					);
				}

				// Ensure userId is actually the user's userId
				if (data.userId !== userId) {
					return NextResponse.json(
						{ error: "Invalid userId" },
						{ status: 400 }
					);
				}

				// Save to Redis using atomic operation
				await redis.lpush(listKey, JSON5.stringify(data));
				result = { success: true, message: "Shortcut saved to Redis" };
				break;

			case "update":
				if (!data?.uuid) {
					return NextResponse.json(
						{ error: "Invalid data for update action" },
						{ status: 400 }
					);
				}

				if (data.userId !== userId) {
					return NextResponse.json(
						{ error: "Invalid userId" },
						{ status: 400 }
					);
				}

				// Atomic update operation using transaction
				const pipeline = redis.pipeline();
				const items = await redis.lrange(listKey, 0, -1);
				// Flag to check if update operation is queued
				let updated = false;
				for (let i = 0; i < items.length; i++) {
					try {
						const item = JSON5.parse(items[i].toString());
						if (item.uuid === data.uuid) {
							pipeline.lset(listKey, i, JSON5.stringify(data));
							updated = true;
							break;
						}
					} catch (e) {
						continue;
					}
				}
				if (!updated) {
					return NextResponse.json(
						{ error: "Shortcut not found" },
						{ status: 404 }
					);
				}
				const [updateError] = await pipeline.exec();
				result = {
					success: !updateError,
					message: !updateError ? "Shortcut updated in Redis" : "Failed to update shortcut"
				};
				break;

			case "delete":
				if (!data?.uuid) {
					return NextResponse.json(
						{ error: "UUID required for delete action" },
						{ status: 400 }
					);
				}

				// Find and remove the item with matching UUID using pipeline
				const allItems = await redis.lrange(listKey, 0, -1);
				const targetItem = allItems.find(item => {
					try {
						return JSON5.parse(item).uuid === data.uuid;
					} catch {
						return false;
					}
				});
				
				if (!targetItem) {
					return NextResponse.json(
						{ error: "Shortcut not found" },
						{ status: 404 }
					);
				}
				if  (JSON5.parse(targetItem).userId !== userId) {
					return NextResponse.json(
						{ error: "Invalid userId" },
						{ status: 400 }
					);
				}

				const deleted = targetItem ?
					await redis.lrem(listKey, 1, targetItem) > 0 : false;

				result = {
					success: deleted,
					message: deleted ? "Shortcut deleted from Redis" : "Shortcut not found"
				};
				break;

			default:
				return NextResponse.json(
					{ error: "Invalid action" },
					{ status: 400 }
				);
		}
		return NextResponse.json(result);
	} catch (error) {
		console.error("Redis API error:", error);
		return NextResponse.json(
			{ error: "Server error", details: error instanceof Error ? error.message : String(error) },
			{ status: 500 }
		);
	}
}
