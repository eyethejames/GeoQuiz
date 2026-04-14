import { NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
    const result = await pool.query(
        `SELECT region_id, name, parent_region_id, type
        FROM region
        ORDER BY region_id`
    );

    return NextResponse.json(
        result.rows.map((row) => ({
            regionId: row.region_id,
            name: row.name,
            parentRegionId: row.parent_region_id,
            type: row.type
        }))
    );
}