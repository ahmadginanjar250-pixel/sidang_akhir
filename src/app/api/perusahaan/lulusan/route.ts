import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "PERUSAHAAN") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch all Lulusan, maybe with tracer study and portofolio count
    const data = await prisma.lulusan.findMany({
        include: {
            jurusan: true,
            tracerStudy: true,
            user: { select: { email: true } },
            _count: { select: { portofolio: true } }
        },
        orderBy: { nama: 'asc' }
    });

    return NextResponse.json(data);
}
