import { handleSampleCloudRequest } from "./core.mjs";

export default {
  fetch(request, env) {
    return handleSampleCloudRequest(request, { env });
  },
};
