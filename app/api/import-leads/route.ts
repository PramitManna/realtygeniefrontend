import { NextRequest, NextResponse } from "next/server";

// Simple CSV parser
function parseCSV(text: string): any[] {
  const lines = text.trim().split("\n");
  if (lines.length === 0) return [];

  const headers = lines[0].split(",").map((h) => h.trim());
  const data: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const obj: any = {};
    headers.forEach((header, index) => {
      obj[header] = values[index] || "";
    });
    data.push(obj);
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const fileType = formData.get("file_type") as string;
    const file = formData.get("file") as File | null;
    const url = formData.get("url") as string | null;

    let rawData: any[] = [];

    // Parse CSV file
    if (fileType === "csv" && file) {
      const text = await file.text();
      rawData = parseCSV(text);
    } else if (fileType === "excel" && file) {
      // For Excel, we'll need to install xlsx, for now just show error
      return NextResponse.json(
        {
          error:
            "Excel support requires backend processing. Please use CSV format for now.",
        },
        { status: 400 }
      );
    } else if (fileType === "google_sheets" && url) {
      // Extract sheet ID from Google Sheets URL
      const sheetIdMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!sheetIdMatch) {
        return NextResponse.json(
          { error: "Invalid Google Sheets URL" },
          { status: 400 }
        );
      }
      const sheetId = sheetIdMatch[1];
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
      const response = await fetch(csvUrl);
      const text = await response.text();
      rawData = parseCSV(text);
    }

    // Map raw data to lead format (auto-detect columns)
    const mappedLeads = rawData.map((row: any) => {
      // Try to find email, name, phone, address columns (case-insensitive)
      const keys = Object.keys(row);
      let email = "";
      let name = "";
      let phone = "";
      let address = "";

      for (const key of keys) {
        const lowerKey = key.toLowerCase();
        if (lowerKey.includes("email")) {
          email = row[key];
        } else if (lowerKey.includes("name")) {
          name = row[key];
        } else if (lowerKey.includes("phone") || lowerKey.includes("mobile")) {
          phone = row[key];
        } else if (lowerKey.includes("address") || lowerKey.includes("location")) {
          address = row[key];
        }
      }

      return {
        email: email || "",
        name: name || "",
        phone: phone || "",
        address: address || "",
      };
    });

    // Filter out rows with empty emails
    const validLeads = mappedLeads.filter(
      (lead) => lead.email && lead.email.trim()
    );

    return NextResponse.json({
      success: true,
      total_records: rawData.length,
      cleaned_leads: validLeads,
      duplicates_removed: 0,
      invalid_rows: rawData.length - validLeads.length,
    });
  } catch (error) {
    console.error("Error importing leads:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}
