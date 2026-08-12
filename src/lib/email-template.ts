/**
 * Osprey IT Helpdesk - Standard Branded Email Template Builder
 * Provides consistent, ultra-clean HTML email formatting across all automated dispatches.
 */

export interface EmailTemplateOptions {
  title: string;
  badgeText?: string;
  badgeType?: "success" | "info" | "warning";
  contentHtml: string;
  detailsGrid?: { label: string; value: string }[];
  actionButton?: { label: string; url: string };
  recipientName?: string;
}

export function buildBrandedEmailHtml(options: EmailTemplateOptions): string {
  const {
    title,
    badgeText = "OFFICIAL IT NOTIFICATION",
    badgeType = "info",
    contentHtml,
    detailsGrid = [],
    actionButton,
    recipientName,
  } = options;

  const badgeColors = {
    success: { bg: "#ECFDF5", text: "#065F46", border: "#A7F3D0" },
    warning: { bg: "#FFFBEB", text: "#92400E", border: "#FDE68A" },
    info: { bg: "#EFF6FF", text: "#1E40AF", border: "#BFDBFE" },
  }[badgeType];

  const gridHtml =
    detailsGrid.length > 0
      ? `
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 16px; margin-bottom: 20px; border-collapse: collapse; background-color: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px;">
          ${detailsGrid
            .map(
              (item) => `
            <tr>
              <td style="padding: 10px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid #EDF2F7; width: 30%;">
                ${item.label}
              </td>
              <td style="padding: 10px 14px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: #0F172A; border-bottom: 1px solid #EDF2F7;">
                ${item.value}
              </td>
            </tr>
          `
            )
            .join("")}
        </table>
      `
      : "";

  const buttonHtml = actionButton
    ? `
      <div style="margin-top: 24px; margin-bottom: 8px; text-align: center;">
        <a href="${actionButton.url}" target="_blank" style="display: inline-block; background-color: #003087; color: #FFFFFF; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; text-decoration: none; padding: 12px 28px; border-radius: 9999px; box-shadow: 0 2px 4px rgba(0, 48, 135, 0.2);">
          ${actionButton.label}
        </a>
      </div>
    `
    : "";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F1F5F9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F1F5F9; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Email Container -->
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 580px; background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E2E8F0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #00103A 0%, #003087 60%, #005F9E 100%); padding: 24px 28px; text-align: left;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display: inline-block; font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; font-weight: 800; color: #FF9F1C; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 4px;">
                      OSPREY HELPDESK
                    </span>
                    <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #FFFFFF; letter-spacing: -0.3px; line-height: 1.2;">
                      ${title}
                    </h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content Area -->
          <tr>
            <td style="padding: 28px;">
              <!-- Status Badge -->
              <div style="margin-bottom: 18px;">
                <span style="display: inline-block; background-color: ${badgeColors.bg}; color: ${badgeColors.text}; border: 1px solid ${badgeColors.border}; font-family: 'SF Mono', SFMono-Regular, Consolas, monospace; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; padding: 4px 10px; border-radius: 9999px;">
                  ${badgeText}
                </span>
              </div>

              ${
                recipientName
                  ? `<p style="margin: 0 0 14px 0; font-size: 14px; font-weight: 600; color: #1E293B;">Hello ${recipientName},</p>`
                  : ""
              }

              <!-- Content Message -->
              <div style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 16px;">
                ${contentHtml}
              </div>

              <!-- Details Grid if provided -->
              ${gridHtml}

              <!-- Call to Action Button if provided -->
              ${buttonHtml}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #F8FAFC; padding: 18px 28px; border-top: 1px solid #E2E8F0; text-align: center;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748B; font-weight: 600;">
                Osprey Autonomous IT Helpdesk System
              </p>
              <p style="margin: 0; font-size: 10px; color: #94A3B8; font-family: monospace;">
                This notification was generated automatically on behalf of your IT Operations team.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
