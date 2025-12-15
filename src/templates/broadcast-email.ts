interface EmailTemplateProps {
  subject: string;
  message: string;
  recipientName: string;
}

export const getBroadcastHtml = ({ subject, message, recipientName }: EmailTemplateProps) => {
  // Tratamento básico para quebras de linha na mensagem
  const formattedMessage = message.replace(/\n/g, '<br>');
  const year = new Date().getFullYear();

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${subject}</title>
    <style>
        body { margin: 0; padding: 0; -webkit-font-smoothing: antialiased; font-family: Arial, Helvetica, sans-serif; }
        table { border-collapse: collapse; }
        a { color: #007BFF; }
    </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f4;">
    <center>
        <table width="100%" border="0" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff;">
            <tr>
                <td align="center" style="padding: 20px 0;">
                    <img src="https://i.imgur.com/cfAm9d6.png" alt="Canaoaves" style="display: block;">
                </td>
            </tr>

            <tr>
                <td align="center" style="padding: 20px 20px 10px 20px;">
                    <h2 style="font-size: 24px; color: #333333; margin: 0;">${subject}</h2>
                </td>
            </tr>

            <tr>
                <td style="padding: 0 30px 20px 30px; font-size: 16px; line-height: 1.5; color: #555555;">
                    <p>Olá, <strong>${recipientName}</strong>!</p>

                    <div style="margin-top: 15px; white-space: pre-wrap;">${formattedMessage}</div>
                </td>
            </tr>

            <tr>
                <td style="padding: 0 30px 30px 30px; font-size: 14px; line-height: 1.5; color: #555555;">
                    <p style="margin-top: 30px;">Atenciosamente,<br><strong>Equipe Canaoaves</strong></p>
                </td>
            </tr>

            <tr>
                <td style="background-color: #f4f4f4; padding: 20px 30px; text-align: center; font-size: 12px; color: #888888;">
                    <p>Você recebeu este e-mail porque faz parte da comunidade Canaoaves.</p>
                    <p>&copy; ${year} Canaoaves. Todos os direitos reservados.</p>
                </td>
            </tr>
        </table>
    </center>
</body>
</html>
  `;
};
