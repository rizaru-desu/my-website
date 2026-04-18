import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import {
  AdminResumeAccessError,
  clearAdminResumeAsset,
  getAdminResumeAsset,
  getAdminResumeContext,
  uploadAdminResumeAsset,
  updateAdminResumeAsset,
} from "@/lib/resume";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    await getAdminResumeContext(request.headers);
    const asset = await getAdminResumeAsset();

    return NextResponse.json(asset);
  } catch (error) {
    if (error instanceof AdminResumeAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The resume asset could not be loaded right now." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request) {
  try {
    await getAdminResumeContext(request.headers);
    const payload = (await request.json()) as {
      downloadUrl?: string;
      fileName?: string;
      fileSizeBytes?: number;
      mimeType?: string;
    };

    const result = await updateAdminResumeAsset({
      downloadUrl: payload.downloadUrl ?? "",
      fileName: payload.fileName,
      fileSizeBytes: payload.fileSizeBytes,
      mimeType: payload.mimeType,
    });

    if (result.ok) {
      revalidatePath("/resume");
      revalidatePath("/admin/resume");
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminResumeAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The resume asset could not be updated." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await getAdminResumeContext(request.headers);
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { ok: false, message: "Choose a PDF before uploading." },
        { status: 400 },
      );
    }

    const result = await uploadAdminResumeAsset(file);

    if (result.ok) {
      revalidatePath("/resume");
      revalidatePath("/admin/resume");
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminResumeAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The resume upload could not be completed." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: Request) {
  try {
    await getAdminResumeContext(request.headers);
    const result = await clearAdminResumeAsset();

    if (result.ok) {
      revalidatePath("/resume");
      revalidatePath("/admin/resume");
    }

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    if (error instanceof AdminResumeAccessError) {
      return NextResponse.json({ message: error.message }, { status: error.status });
    }

    return NextResponse.json(
      { message: "The resume asset could not be cleared." },
      { status: 500 },
    );
  }
}
