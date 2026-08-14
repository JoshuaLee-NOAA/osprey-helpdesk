import { eveChannel } from "eve/channels/eve";
import { localDev, vercelOidc, none } from "eve/channels/auth";

export const maxDuration = 60;

export default eveChannel({
  auth: [
    none(),
    vercelOidc(), 
    localDev()
  ]
});
