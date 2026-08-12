import { defineTool } from "eve/tools";
import { z } from "zod";
import { getSupabaseClient } from "../../../../src/lib/supabase";

export default (defineTool as any)({
  description: "Provision an active software seat license (e.g. Figma, Slack Pro, PyCharm, GitHub Copilot) for an employee.",
  inputSchema: z.object({
    userEmail: z.string().email().describe("Email address of the employee receiving the software license seat."),
    softwareName: z.string().describe("Name of the software application (e.g. 'Figma Enterprise', 'Slack Pro', 'PyCharm Professional', 'GitHub Copilot')."),
  }),
  async execute({ userEmail, softwareName }: { userEmail: string; softwareName: string }) {
    try {
      console.log(`[Tool: provision-software] Allocating seat for ${softwareName} to ${userEmail}...`);

      const supabase = getSupabaseClient();
      const generatedKey = `OSPREY-LIC-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const { data, error } = await (supabase.from("user_software_licenses") as any)
        .insert({
          user_email: userEmail,
          software_name: softwareName,
          license_key: generatedKey,
          status: "ACTIVE",
          allocated_by: "OSPREY_AUTOMATION",
        })
        .select()
        .single();

      if (error) {
        console.error("[Tool: provision-software] Error inserting license record:", error);
        return {
          success: false,
          error: error.message || "Failed to allocate software license seat in database.",
        };
      }

      return {
        success: true,
        message: `Successfully allocated seat for ${softwareName} to ${userEmail}.`,
        license: {
          id: data.id,
          userEmail: data.user_email,
          softwareName: data.software_name,
          licenseKey: data.license_key,
          status: data.status,
          createdAt: data.created_at,
        },
      };
    } catch (error: any) {
      console.error("[Tool: provision-software] Unexpected error:", error);
      return {
        success: false,
        error: error.message || "An unexpected error occurred while provisioning software.",
      };
    }
  },
});
