import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendResetPasswordEmail } from "@/lib/mailer";
import crypto from "crypto";

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: "Email diperlukan" }, { status: 400 });
        }

        // Cek apakah user dengan email ini ada
        const user = await prisma.user.findUnique({ where: { email } });

        // Selalu kembalikan pesan sukses untuk mencegah user enumeration
        if (!user) {
            return NextResponse.json({
                message: "Jika email terdaftar, link reset password telah dikirim.",
            });
        }

        // Hapus token lama untuk email ini (jika ada)
        await prisma.passwordResetToken.deleteMany({ where: { email } });

        // Buat token baru
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

        await prisma.passwordResetToken.create({
            data: { email, token, expiresAt },
        });

        // Kirim email
        const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
        await sendResetPasswordEmail(email, resetUrl);

        return NextResponse.json({
            message: "Jika email terdaftar, link reset password telah dikirim.",
        });
    } catch (error) {
        console.error("Error forgot-password:", error);
        return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
    }
}
