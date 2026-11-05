<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Kode OTP - Bank Mini</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333333;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f4f6f9; padding: 30px 0;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" max-width="600" cellspacing="0" cellpadding="0" border="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.05); max-width: 600px; margin: 0 auto;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background-color: #0d6efd; padding: 25px 30px; text-align: left;">
                            <h1 style="color: #ffffff; font-size: 20px; margin: 0; font-weight: 600;">Bank Mini</h1>
                        </td>
                    </tr>

                    <!-- Body Content -->
                    <tr>
                        <td style="padding: 30px;">
                            <p style="font-size: 16px; line-height: 1.5; margin-top: 0;">Halo,</p>
                            
                            <p style="font-size: 15px; line-height: 1.6; color: #555555;">
                                @if ($purpose === 'email')
                                    Kami menerima permintaan untuk mengubah email akun <strong>Bank Mini</strong> Anda menjadi <strong>{{ $targetEmail }}</strong>. Masukkan kode OTP berikut pada aplikasi Bank Mini untuk mengonfirmasi perubahan:
                                @else
                                    Kami menerima permintaan untuk mengatur ulang {{ $purpose === 'password' ? 'password' : 'PIN' }} akun <strong>Bank Mini</strong> Anda. Masukkan kode OTP berikut pada aplikasi Bank Mini untuk melanjutkan:
                                @endif
                            </p>

                            <p style="margin: 25px 0; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 10px; color: #0d6efd;">
                                {{ $otp }}
                            </p>

                            <p style="font-size: 14px; line-height: 1.6; color: #6c757d; background-color: #f8f9fa; padding: 12px; border-left: 4px solid #0d6efd;">
                                Kode ini berlaku selama <strong>{{ $expiresInMinutes }} menit</strong>. Jangan bagikan kode ini kepada siapa pun.
                            </p>

                            <hr style="border: none; border-top: 1px solid #eeeeee; margin: 30px 0;">

                            <!-- Security Warning -->
                            <p style="font-size: 13px; line-height: 1.5; color: #888888; margin-bottom: 0;">
                                <strong>Pemberitahuan Keamanan:</strong><br>
                                @if ($purpose === 'email')
                                    Jika Anda tidak meminta perubahan email, abaikan email ini. Email akun tidak akan berubah kecuali kode OTP digunakan pada aplikasi. Petugas Bank Mini tidak akan pernah meminta kode OTP Anda.
                                @else
                                    Jika Anda tidak meminta reset {{ $purpose === 'password' ? 'password' : 'PIN' }}, abaikan email ini. Kredensial Anda tidak akan berubah kecuali kode OTP digunakan pada aplikasi. Petugas Bank Mini tidak akan pernah meminta kode OTP Anda.
                                @endif
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fa; padding: 20px 30px; text-align: center; font-size: 12px; color: #999999; border-top: 1px solid #eeeeee;">
                            <p style="margin: 0 0 5px 0;">Email ini dikirimkan secara otomatis oleh sistem keamanan Bank Mini.</p>
                            <p style="margin: 0;">&copy; {{ date('Y') }} Bank Mini. All rights reserved.</p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>